"use client";
import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, Calendar, ChevronRight, ShoppingBag, Search, X, AlertTriangle, Ban, Boxes } from 'lucide-react';
import { supabase } from '../libs/supabaseClient';

const FontLoader = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap');
    * { font-family: 'Be Vietnam Pro', Lora, serif; }
  `}</style>
);

interface Order {
    id: string;
    total_price: number;
    orderDate: string;
    estimatedDelivery: string;
    items: { title: string; quantity: number; price: number; image: string; color: string; size: string }[];
    address_line: string;
    ward_name: string;
    city_name: string;
    receiver_name: string;
    phone: string;
    mail: string;
    trackingSteps: { status: string; label: string; date: string; completed: boolean }[];
    status: 'delivering' | 'completed' | 'pending' | 'cancelled' | 'pending_payment' | 'paid' | 'packing' | 'shipping' | 'payment_failed';
}

const CancelConfirmModal = ({ order, onConfirm, onClose, isLoading }: {
    order: Order; onConfirm: () => void; onClose: () => void; isLoading: boolean;
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-xl border border-stone-200 p-7 max-w-sm w-full">
            <div className="flex justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="text-red-400" size={26} />
                </div>
            </div>
            <h3 className="text-lg font-semibold text-stone-800 text-center mb-1">Hủy đơn hàng?</h3>
            <p className="text-stone-500 text-center text-sm mb-5">
                Đơn <span className="text-amber-700 font-semibold">#{order.id.slice(0, 8)}</span> sẽ bị hủy vĩnh viễn.
            </p>
            <div className="bg-stone-50 rounded-xl p-4 mb-5 border border-stone-100 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Sản phẩm</span>
                    <span className="font-medium text-stone-700">{order.items.length} món</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-stone-500">Tổng tiền</span>
                    <span className="font-semibold text-amber-700">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total_price)}
                    </span>
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-all">
                    Giữ lại
                </button>
                <button onClick={onConfirm} disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                    {isLoading
                        ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Đang xử lý...</>
                        : <><Ban size={14} /> Xác nhận hủy</>
                    }
                </button>
            </div>
        </div>
    </div>
);

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
    pending: { label: 'Chờ xác nhận', dot: 'bg-amber-400', bg: 'bg-amber-50', text: 'text-amber-700' },
    pending_payment: { label: 'Chờ thanh toán', dot: 'bg-orange-400', bg: 'bg-orange-50', text: 'text-orange-700' },
    paid: { label: 'Đã thanh toán', dot: 'bg-sky-400', bg: 'bg-sky-50', text: 'text-sky-700' },
    packing: { label: 'Đang đóng gói', dot: 'bg-violet-400', bg: 'bg-violet-50', text: 'text-violet-700' },
    shipping: { label: 'Đang giao hàng', dot: 'bg-blue-400', bg: 'bg-blue-50', text: 'text-blue-700' },
    completed: { label: 'Đã hoàn thành', dot: 'bg-emerald-400', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    cancelled: { label: 'Đã hủy', dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-500' },
    payment_failed: { label: 'Thanh toán thất bại', dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-500' },
};

const StatusBadge = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] ?? { label: 'Không xác định', dot: 'bg-stone-400', bg: 'bg-stone-50', text: 'text-stone-500' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
};

const formatPrice = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const OrderTracking = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

    useEffect(() => { loadOrders(); }, []);

    useEffect(() => {
        if (!searchQuery.trim()) { setFilteredOrders(orders); return; }
        const q = searchQuery.toLowerCase();
        setFilteredOrders(orders.filter(o =>
            o.id.toLowerCase().includes(q) || o.items.some(i => i.title?.toLowerCase().includes(q))
        ));
    }, [searchQuery, orders]);

    const loadOrders = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("orders")
            .select(`
                id, total_price, created_at, status,
                addresses(full_name, phone, address_line, mail, ward, city),
                order_items(quantity, price,
                    product_variants(id, size, color, price,
                        products(name, image_url)
                    )
                )
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) { console.error(error); return; }

        const fmtDate = (iso: string) => iso ? new Date(iso).toLocaleDateString("vi-VN") : "";
        const mkTracking = (status: string) => {
            const steps = [
                { status: "pending", label: "Đặt hàng" },
                { status: "paid", label: "Thanh toán" },
                { status: "packing", label: "Đóng gói" },
                { status: "shipping", label: "Vận chuyển" },
                { status: "completed", label: "Hoàn tất" },
            ];
            return steps.map(s => ({
                ...s,
                completed: steps.findIndex(x => x.status === s.status) <= steps.findIndex(x => x.status === status),
                date: steps.findIndex(x => x.status === s.status) <= steps.findIndex(x => x.status === status)
                    ? new Date().toLocaleDateString("vi-VN") : ""
            }));
        };

        // ── Lấy ward codes và city codes ──
        const wardCodes = [...new Set((data || []).map((o: any) => o.addresses?.ward).filter(Boolean))] as string[];
        const cityCodes = [...new Set((data || []).map((o: any) => o.addresses?.city).filter(Boolean))] as string[];

        // ── Query communes theo ward codes ──
        const { data: communesData } = wardCodes.length > 0
            ? await supabase.from("communes").select("code, name, province_code").in("code", wardCodes)
            : { data: [] };

        // ── Gộp tất cả province codes cần lấy ──
        const communeProvinceCodes = [...new Set((communesData || []).map((c: any) => c.province_code).filter(Boolean))] as string[];
        const allProvinceCodes = [...new Set([...cityCodes, ...communeProvinceCodes])];

        // ── Query provinces ──
        const { data: provincesData } = allProvinceCodes.length > 0
            ? await supabase.from("provinces").select("code, name").in("code", allProvinceCodes)
            : { data: [] };

        // ── Lookup maps ──
        const provinceMap: Record<string, string> = {};
        (provincesData || []).forEach((p: any) => {
            provinceMap[p.code] = p.name;
        });

        const communeMap: Record<string, { name: string; provinceName: string }> = {};
        (communesData || []).forEach((c: any) => {
            communeMap[c.code] = {
                name: c.name,
                provinceName: provinceMap[c.provinceCode] || "",
            };
        });

        // ── Map orders ──
        const mapped: Order[] = (data || []).map((o: any) => {
            const wardCode = o.addresses?.ward || "";
            const cityCode = o.addresses?.city || "";
            const commune = communeMap[wardCode] || { name: "", provinceName: "" };
            // ward_name từ communes, city_name ưu tiên từ commune.provinceName, fallback sang provinceMap[cityCode]
            const cityName = commune.provinceName || provinceMap[cityCode] || "";

            const items = (o.order_items || []).map((i: any) => ({
                title: i.product_variants?.products?.name || "Không tên",
                image: i.product_variants?.products?.image_url || "",
                quantity: i.quantity,
                price: i.price ?? i.product_variants?.price ?? 0,
                color: i.product_variants?.color || "",
                size: i.product_variants?.size || "",
            }));

            return {
                id: o.id, status: o.status,
                orderDate: fmtDate(o.created_at),
                estimatedDelivery: fmtDate(o.estimated_delivery),
                trackingSteps: mkTracking(o.status), items,
                address_line: o.addresses?.address_line || "",
                receiver_name: o.addresses?.full_name || "",
                phone: o.addresses?.phone || "",
                mail: o.addresses?.mail || "",
                ward_name: commune.name,
                city_name: cityName,
                total_price: o.total_price ?? items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
            };
        });

        setOrders(mapped);
        setFilteredOrders(mapped);
        setSelectedOrder(mapped[0] || null);
    };

    const canCancel = (s: string) => s === 'pending' || s === 'paid';

    const handleCancel = async () => {
        if (!cancelModalOrder) return;
        setIsCancelling(true);
        try {
            const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", cancelModalOrder.id);
            if (error) throw error;
            const cancelledTracking = [
                { status: "pending", label: "Đặt hàng", completed: true, date: new Date().toLocaleDateString("vi-VN") },
                { status: "paid", label: "Thanh toán", completed: false, date: "" },
                { status: "packing", label: "Đóng gói", completed: false, date: "" },
                { status: "shipping", label: "Vận chuyển", completed: false, date: "" },
                { status: "completed", label: "Hoàn tất", completed: false, date: "" },
            ];
            const upd = (list: Order[]) => list.map(o =>
                o.id === cancelModalOrder.id ? { ...o, status: 'cancelled' as const, trackingSteps: cancelledTracking } : o);
            setOrders(upd); setFilteredOrders(upd);
            if (selectedOrder?.id === cancelModalOrder.id)
                setSelectedOrder(p => p ? { ...p, status: 'cancelled' as const, trackingSteps: cancelledTracking } : p);
            setCancelModalOrder(null);
            setCancelSuccess(cancelModalOrder.id);
            setTimeout(() => setCancelSuccess(null), 3000);
        } catch (e) { console.error(e); }
        finally { setIsCancelling(false); }
    };

    const completedSteps = selectedOrder?.trackingSteps.filter(s => s.completed).length ?? 0;
    const totalSteps = selectedOrder?.trackingSteps.length ?? 5;
    const progressPct = Math.round((completedSteps / totalSteps) * 100);

    return (
        <>
            <FontLoader />
            <div className="min-h-screen bg-[#f7f4f0] p-4 md:p-6 lg:p-8">

                {cancelModalOrder && (
                    <CancelConfirmModal order={cancelModalOrder} onConfirm={handleCancel}
                        onClose={() => setCancelModalOrder(null)} isLoading={isCancelling} />
                )}

                {cancelSuccess && (
                    <div className="fixed top-6 right-6 z-50 bg-stone-700 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2.5 text-sm font-medium">
                        <CheckCircle size={16} className="text-amber-300" />
                        Đã hủy đơn hàng thành công
                    </div>
                )}

                <div className="max-w-6xl mx-auto space-y-5">

                    {/* ── Header ── */}
                    <div className="relative overflow-hidden rounded-2xl bg-[#3d2f20] px-7 py-6 shadow-md">
                        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-amber-700/25 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-6 left-10 w-32 h-32 rounded-full bg-stone-600/20 blur-2xl pointer-events-none" />
                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                                    <Package className="text-amber-300" size={22} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-white tracking-tight">Theo Dõi Đơn Hàng</h1>
                                    <p className="text-stone-400 text-xs mt-0.5">Quản lý & cập nhật trạng thái đơn của bạn</p>
                                </div>
                            </div>
                            <div className="hidden md:block text-right">
                                <p className="text-stone-400 text-xs mb-0.5">Tổng đơn hàng</p>
                                <p className="text-2xl font-bold text-amber-300">{orders.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                        {/* ── Sidebar ── */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden sticky top-6">
                                <div className="px-5 pt-5 pb-4 border-b border-stone-100">
                                    <div className="flex items-center justify-between mb-3.5">
                                        <h2 className="text-base font-semibold text-stone-800">Đơn hàng của tôi</h2>
                                        <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                                            {filteredOrders.length} đơn
                                        </span>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
                                        <input
                                            type="text"
                                            placeholder="Tìm mã đơn hoặc sản phẩm..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
                                        />
                                        {searchQuery && (
                                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                                <X size={15} />
                                            </button>
                                        )}
                                    </div>
                                    {searchQuery && (
                                        <p className="text-xs text-stone-400 mt-2">
                                            {filteredOrders.length === 0 ? 'Không tìm thấy' : `Tìm thấy ${filteredOrders.length} đơn`}
                                        </p>
                                    )}
                                </div>

                                <div className="divide-y divide-stone-100 max-h-[calc(100vh-320px)] overflow-y-auto">
                                    {filteredOrders.length === 0 ? (
                                        <div className="py-14 text-center">
                                            <Boxes className="mx-auto text-stone-300 mb-3" size={36} />
                                            <p className="text-stone-400 text-sm">{searchQuery ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}</p>
                                        </div>
                                    ) : filteredOrders.map(order => {
                                        const isActive = selectedOrder?.id === order.id;
                                        const firstImg = order.items[0]?.image;
                                        return (
                                            <div key={order.id} onClick={() => setSelectedOrder(order)}
                                                className={`px-5 py-4 cursor-pointer transition-all duration-150 ${isActive
                                                    ? 'bg-amber-50/70 border-l-[3px] border-l-amber-500'
                                                    : 'hover:bg-stone-50 border-l-[3px] border-l-transparent'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                                                        {firstImg
                                                            ? <img src={firstImg} alt="" className="w-full h-full object-cover" />
                                                            : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-stone-300" /></div>
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-xs font-semibold text-stone-500 tracking-wide">#{order.id.slice(0, 8)}</p>
                                                            <StatusBadge status={order.status} />
                                                        </div>
                                                        <p className="text-xs text-stone-500 truncate">{order.items.map(i => i.title).join(', ')}</p>
                                                        <div className="flex items-center justify-between mt-1.5">
                                                            <span className="text-xs text-stone-400 flex items-center gap-1"><Calendar size={10} />{order.orderDate}</span>
                                                            <span className={`text-xs font-bold ${isActive ? 'text-amber-700' : 'text-stone-600'}`}>{formatPrice(order.total_price)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* ── Detail ── */}
                        {!selectedOrder ? (
                            <div className="lg:col-span-3 bg-white rounded-2xl border border-stone-200 p-16 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-stone-100 mx-auto flex items-center justify-center mb-3">
                                        <Package className="text-stone-300" size={28} />
                                    </div>
                                    <p className="text-stone-400 text-sm">Đang tải đơn hàng...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="lg:col-span-3 space-y-4">

                                {selectedOrder.status === 'cancelled' && (
                                    <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl">
                                        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                                            <Ban className="text-red-400" size={16} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-red-600 text-sm">Đơn hàng đã bị hủy</p>
                                            <p className="text-red-400 text-xs mt-0.5">Đơn hàng này không còn được xử lý nữa.</p>
                                        </div>
                                    </div>
                                )}

                                {/* ── Tracking Card ── */}
                                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                                    <div className="px-6 pt-6 pb-4 border-b border-stone-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                                    <Truck className="text-amber-600" size={17} />
                                                </div>
                                                <div>
                                                    <h2 className="font-semibold text-stone-800 text-sm">Trạng thái giao hàng</h2>
                                                    <p className="text-xs text-stone-400 mt-0.5">Mã đơn #{selectedOrder.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <StatusBadge status={selectedOrder.status} />
                                                {canCancel(selectedOrder.status) && (
                                                    <button onClick={() => setCancelModalOrder(selectedOrder)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-400 text-xs font-medium hover:bg-red-50 transition-all">
                                                        <Ban size={11} /> Hủy đơn
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {selectedOrder.status !== 'cancelled' && (
                                            <div className="mt-4">
                                                <div className="flex justify-between text-xs text-stone-400 mb-1.5">
                                                    <span>Tiến độ</span>
                                                    <span className="font-semibold text-amber-700">{progressPct}%</span>
                                                </div>
                                                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-700"
                                                        style={{ width: `${progressPct}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Timeline */}
                                    <div className="px-6 py-5">
                                        <div className="relative">
                                            <div className="absolute left-[1.3rem] top-4 bottom-4 w-px bg-stone-100" />
                                            <div className="space-y-1">
                                                {selectedOrder.trackingSteps.map((step, i) => {
                                                    const isCurrentStep = step.completed &&
                                                        i === selectedOrder.trackingSteps.filter(s => s.completed).length - 1 &&
                                                        selectedOrder.status !== 'completed';
                                                    return (
                                                        <div key={i} className="flex items-center gap-4 py-2.5 relative">
                                                            <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${step.completed
                                                                ? 'bg-amber-500 shadow-sm shadow-amber-200'
                                                                : 'bg-white border-2 border-stone-200'
                                                                }`}>
                                                                {step.completed
                                                                    ? <CheckCircle className="text-white" size={18} />
                                                                    : <span className="text-xs font-semibold text-stone-400">{i + 1}</span>
                                                                }
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <p className={`text-sm font-medium ${step.completed ? 'text-stone-800' : 'text-stone-400'}`}>{step.label}</p>
                                                                    {isCurrentStep && (
                                                                        <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Hiện tại</span>
                                                                    )}
                                                                </div>
                                                                <p className={`text-xs mt-0.5 ${step.completed ? 'text-stone-400' : 'text-stone-300'}`}>
                                                                    {step.date || '—'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Info + Products ── */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    {/* Delivery info */}
                                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
                                        <div className="flex items-center gap-2.5 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                                <MapPin className="text-amber-600" size={15} />
                                            </div>
                                            <h3 className="text-sm font-semibold text-stone-800">Thông tin giao hàng</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Người nhận</p>
                                                <p className="text-sm font-semibold text-stone-800">{selectedOrder.receiver_name}</p>
                                                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                                                    {selectedOrder.address_line}
                                                    {selectedOrder.ward_name && `, ${selectedOrder.ward_name}`}
                                                    {selectedOrder.city_name && `, ${selectedOrder.city_name}`}
                                                </p>
                                            </div>
                                            <div className="h-px bg-stone-100" />
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                                                    <Phone className="text-stone-500" size={12} />
                                                </div>
                                                <span className="text-sm text-stone-600">{selectedOrder.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                                                    <Mail className="text-stone-500" size={12} />
                                                </div>
                                                <span className="text-sm text-stone-600 truncate">{selectedOrder.mail}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Products */}
                                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
                                        <div className="flex items-center gap-2.5 mb-4">
                                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                                                <ShoppingBag className="text-amber-600" size={15} />
                                            </div>
                                            <h3 className="text-sm font-semibold text-stone-800">Sản phẩm đã đặt</h3>
                                        </div>
                                        <div className="space-y-2.5 mb-4">
                                            {selectedOrder.items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                                                        {item.image
                                                            ? <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                                            : <div className="w-full h-full flex items-center justify-center"><Package size={12} className="text-stone-300" /></div>
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium text-stone-700 truncate">{item.title}</p>
                                                        <p className="text-[10px] text-stone-400 mt-0.5">{item.color} · {item.size} · x{item.quantity}</p>
                                                    </div>
                                                    <p className="text-xs font-semibold text-stone-700 flex-shrink-0">{formatPrice(item.price)}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="border-t border-stone-100 pt-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-stone-500">Tổng thanh toán</span>
                                                <span className="text-base font-bold text-amber-700">{formatPrice(selectedOrder.total_price)}</span>
                                            </div>
                                        </div>
                                        {canCancel(selectedOrder.status) && (
                                            <button onClick={() => setCancelModalOrder(selectedOrder)}
                                                className="w-full mt-3.5 py-2.5 rounded-xl border border-red-200 text-red-400 text-xs font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-1.5">
                                                <Ban size={12} /> Hủy đơn hàng
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderTracking;