import { createSupabaseServer } from '@/app/libs/supabaseServer';
import { Order } from '../types/order.types';

const fmtDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString('vi-VN') : '';

export const PAYMENT_METHOD_LABEL: Record<string, { label: string; icon: string; color: string }> = {
    cod: { label: 'Thanh toán khi nhận hàng (COD)', icon: '💵', color: '#a07050' },
    bank: { label: 'Chuyển khoản ngân hàng', icon: '🏦', color: '#5060a0' },
    ipn: { label: 'Thanh toán qua VNPAY', icon: '💳', color: '#1a6fb0' },
};
const mkTracking = (status: string, isCOD = false) => {
    const steps = isCOD
        ? [
            { status: 'pending', label: 'Đặt hàng' },
            { status: 'packing', label: 'Đóng gói' },
            { status: 'shipping', label: 'Vận chuyển' },
            { status: 'completed', label: 'Hoàn tất' },
            { status: 'cod_payment', label: 'Thu tiền khi giao' },
        ]
        : [
            { status: 'pending', label: 'Đặt hàng' },
            { status: 'paid', label: 'Thanh toán' },
            { status: 'packing', label: 'Đóng gói' },
            { status: 'shipping', label: 'Vận chuyển' },
            { status: 'completed', label: 'Hoàn tất' },
        ];

    // ✅ Với COD: 'paid' và 'pending_payment' đều coi như 'packing'
    // vì backend set paid ngay sau khi đặt COD
    const normalizeStatus = (s: string) => {
        if (isCOD && (s === 'paid' || s === 'pending_payment')) return 'packing';
        return s;
    };

    const resolvedStatus = normalizeStatus(status);

    const currentIdx = (() => {
        const idx = steps.findIndex(x => x.status === resolvedStatus);
        // cod_payment chỉ completed khi 'completed'
        if (isCOD && resolvedStatus === 'completed') return steps.length - 1;
        return idx;
    })();

    return steps.map((s, i) => ({
        ...s,
        completed: i <= currentIdx,
        date: i <= currentIdx ? new Date().toLocaleDateString('vi-VN') : '',
        isCodStep: s.status === 'cod_payment',
    }));
};

export async function getOrdersServer(): Promise<Order[]> {
    const supabase = await createSupabaseServer(); // 👈 chỉ khác mỗi dòng này
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('orders')
        .select(`
  id, total_price, created_at, status, payment_method,
  addresses:addresses (
    full_name, phone, address_line, mail, ward, city
  ),
  order_items:order_items (
    quantity, price,
    product_variants:product_variants (
      id, size, color, price,
      products:products (
        name, image_url
      )
    )
  )
`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) { console.error(error); return []; }

    const wardCodes = [...new Set((data || []).map((o: any) => o.addresses?.ward).filter(Boolean))] as string[];
    const cityCodes = [...new Set((data || []).map((o: any) => o.addresses?.city).filter(Boolean))] as string[];

    const { data: communesData } = wardCodes.length > 0
        ? await supabase.from('communes').select('code, name, province_code').in('code', wardCodes)
        : { data: [] };

    const communeProvinceCodes = [...new Set((communesData || []).map((c: any) => c.province_code).filter(Boolean))] as string[];
    const allProvinceCodes = [...new Set([...cityCodes, ...communeProvinceCodes])];

    const { data: provincesData } = allProvinceCodes.length > 0
        ? await supabase.from('provinces').select('code, name').in('code', allProvinceCodes)
        : { data: [] };

    const provinceMap: Record<string, string> = {};
    (provincesData || []).forEach((p: any) => { provinceMap[p.code] = p.name; });

    const communeMap: Record<string, { name: string; provinceName: string }> = {};
    (communesData || []).forEach((c: any) => {
        communeMap[c.code] = { name: c.name, provinceName: provinceMap[c.province_code] || '' };
    });

    return (data || []).map((o: any) => {
        const wardCode = o.addresses?.ward || '';
        const cityCode = o.addresses?.city || '';
        const commune = communeMap[wardCode] || { name: '', provinceName: '' };

        const items = (o.order_items || []).map((i: any) => ({
            title: i.product_variants?.products?.name || 'Không tên',
            image: i.product_variants?.products?.image_url || '',
            quantity: i.quantity,
            price: i.price ?? i.product_variants?.price ?? 0,
            color: i.product_variants?.color || '',
            size: i.product_variants?.size || '',
        }));

        const pmKey = (o.payment_method || 'cod').toString().trim().toLowerCase();
        console.log('pmKey:', pmKey, '| found:', !!PAYMENT_METHOD_LABEL[pmKey]);
        const pmInfo = PAYMENT_METHOD_LABEL[pmKey] ?? PAYMENT_METHOD_LABEL['cod'];

        return {
            id: o.id,
            status: o.status,
            orderDate: fmtDate(o.created_at),
            estimatedDelivery: fmtDate(o.estimated_delivery),
            trackingSteps: mkTracking(o.status),
            items,
            address_line: o.addresses?.address_line || '',
            receiver_name: o.addresses?.full_name || '',
            phone: o.addresses?.phone || '',
            mail: o.addresses?.mail || '',
            ward_name: commune.name,
            city_name: commune.provinceName || provinceMap[cityCode] || '',
            total_price: o.total_price ?? items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
            payment_method: pmKey,
            payment_method_label: pmInfo.label,
            payment_method_icon: pmInfo.icon,
            payment_method_color: pmInfo.color,
        };
    });
}