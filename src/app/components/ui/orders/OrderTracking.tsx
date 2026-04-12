'use client';
import { Package, CheckCircle } from 'lucide-react';
import { useOrders } from '@/app/hooks/useOrders';
import { CancelConfirmModal } from './CancelConfirmModal';
import { OrderList } from '@/app/components/ui/orders/OrderList';
import { OrderDetail } from '@/app/components/ui/orders/OrderDetail';
import { Order } from '@/app/types/order.types';

export function OrderTracking({ initialOrders = [] }: { initialOrders?: Order[] }) {

    const {
        orders, filteredOrders, selectedOrder, setSelectedOrderId, // 👈 đổi
        searchQuery, setSearchQuery,
        cancelModalOrder, setCancelModalOrder,
        isCancelling, cancelSuccess, loading, // 👈 thêm loading
        handleCancel,
    } = useOrders(initialOrders);

    const completedSteps = selectedOrder?.trackingSteps.filter(s => s.completed).length ?? 0;
    const totalSteps = selectedOrder?.trackingSteps.length ?? 5;
    const progressPct = Math.round((completedSteps / totalSteps) * 100);

    // 👈 skeleton khi loading
    if (loading) return (
        <div className="min-h-screen bg-[#f7f4f0] p-4 md:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-5">
                <div className="rounded-2xl bg-stone-200 animate-pulse h-24" />
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
                        <div className="h-4 bg-stone-100 rounded-full w-1/2 animate-pulse" />
                        <div className="h-10 bg-stone-100 rounded-xl animate-pulse" />
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-3 py-2">
                                <div className="w-11 h-11 rounded-xl bg-stone-100 animate-pulse flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-stone-100 rounded-full animate-pulse w-3/4" />
                                    <div className="h-3 bg-stone-100 rounded-full animate-pulse w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
                            <div className="h-4 bg-stone-100 rounded-full w-1/3 animate-pulse" />
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex gap-4 py-2">
                                    <div className="w-10 h-10 rounded-xl bg-stone-100 animate-pulse flex-shrink-0" />
                                    <div className="flex-1 space-y-2 pt-1">
                                        <div className="h-3 bg-stone-100 rounded-full animate-pulse w-1/2" />
                                        <div className="h-3 bg-stone-100 rounded-full animate-pulse w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl border border-stone-200 p-5 h-48 animate-pulse" />
                            <div className="bg-white rounded-2xl border border-stone-200 p-5 h-48 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
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
                <div className="relative overflow-hidden rounded-2xl bg-[#3d2f20] px-7 py-6 shadow-md">
                    <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-amber-700/25 blur-3xl pointer-events-none" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                                <Package className="text-amber-300" size={22} />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-white">Theo Dõi Đơn Hàng</h1>
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
                    <div className="lg:col-span-2">
                        <OrderList
                            filteredOrders={filteredOrders}
                            selectedOrder={selectedOrder}
                            searchQuery={searchQuery}
                            onSearch={setSearchQuery}
                            onSelect={(order) => setSelectedOrderId(order.id)} // 👈 đổi
                        />
                    </div>
                    <div className="lg:col-span-3">
                        <OrderDetail
                            order={selectedOrder}
                            progressPct={progressPct}
                            onCancelRequest={setCancelModalOrder}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}