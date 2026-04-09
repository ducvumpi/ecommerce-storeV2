import { supabase } from '@/app/libs/supabaseClient';
import { Order } from '../types/order.types';
const fmtDate = (iso: string) =>
    iso ? new Date(iso).toLocaleDateString('vi-VN') : '';

const mkTracking = (status: string) => {
    const steps = [
        { status: 'pending', label: 'Đặt hàng' },
        { status: 'paid', label: 'Thanh toán' },
        { status: 'packing', label: 'Đóng gói' },
        { status: 'shipping', label: 'Vận chuyển' },
        { status: 'completed', label: 'Hoàn tất' },
    ];
    const currentIdx = steps.findIndex(x => x.status === status);
    return steps.map((s, i) => ({
        ...s,
        completed: i <= currentIdx,
        date: i <= currentIdx ? new Date().toLocaleDateString('vi-VN') : '',
    }));
};


export const orderServiceServer = {
    async getOrders(): Promise<Order[]> {
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


        // ── Resolve ward/city names ──
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

        return (data || []).map((o: any): Order => {
            console.log('raw status from DB:', o.status); // 👈 thêm dòng này

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

            return {
                id: o.id,
                status: o.status,
                payment_method: o.payment_method,                    // ✅ thêm
                payment_method_label: o.payment_method === 'cod' ? 'Thanh toán khi nhận hàng'
                    : o.payment_method === 'bank' ? 'Thanh toán Chuyển khoản'
                        : o.payment_method === 'ipn' ? 'Thanh toán qua VNPAY'
                            : 'Không xác định',
                payment_method_icon: o.payment_method === 'cod' ? ''
                    : o.payment_method === 'bank' ? ''
                        : o.payment_method === 'ipn' ? ''
                            : '',
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
            } as Order;
        });
    },

    async cancelOrder(orderId: string): Promise<void> {
        const { error } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', orderId);
        if (error) throw error;
    },
};