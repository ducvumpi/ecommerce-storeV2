'use client';
import { Ban, Truck, CheckCircle, MapPin, Phone, Mail, ShoppingBag, Package } from 'lucide-react';
import { Order } from '@/app/types/order.types';
import { StatusBadge } from './StatusBadge';
import { memo } from 'react';

const formatPrice = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const canCancel = (s: string) => s === 'pending' || s === 'paid';

interface Props {
    order: Order | null;
    progressPct: number;
    onCancelRequest: (order: Order) => void;
}
export const OrderDetail = memo(function OrderDetail({ order, progressPct, onCancelRequest }: Props) {

    if (!order) return (
        <div className="bg-white rounded-2xl border border-stone-200 p-16 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 mx-auto flex items-center justify-center mb-3">
                    <Package className="text-stone-300" size={28} />
                </div>
                <p className="text-stone-400 text-sm">Đang tải đơn hàng...</p>
            </div>
        </div>
    );

    const completedCount = order.trackingSteps.filter(s => s.completed).length;

    return (
        <div className="space-y-4">

            {/* Cancelled banner */}
            {order.status === 'cancelled' && (
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

            {/* Tracking card */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="px-6 pt-6 pb-4 border-b border-stone-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Truck className="text-amber-600" size={17} />
                            </div>
                            <div>
                                <h2 className="font-semibold text-stone-800 text-sm">Trạng thái giao hàng</h2>
                                <p className="text-xs text-stone-400 mt-0.5">Mã đơn #{order.id.slice(0, 8)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <StatusBadge status={order.status} />
                            {canCancel(order.status) && (
                                <button onClick={() => onCancelRequest(order)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-400 text-xs font-medium hover:bg-red-50 transition-all">
                                    <Ban size={11} /> Hủy đơn
                                </button>
                            )}
                        </div>
                    </div>

                    {order.status !== 'cancelled' && (
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
                            {order.trackingSteps.map((step, i) => {
                                const isCurrent = step.completed && i === completedCount - 1 && order.status !== 'completed';
                                return (
                                    <div key={i} className="flex items-center gap-4 py-2.5 relative">
                                        <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${step.completed ? 'bg-amber-500 shadow-sm shadow-amber-200' : 'bg-white border-2 border-stone-200'}`}>
                                            {step.completed
                                                ? <CheckCircle className="text-white" size={18} />
                                                : <span className="text-xs font-semibold text-stone-400">{i + 1}</span>
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-medium ${step.completed ? 'text-stone-800' : 'text-stone-400'}`}>{step.label}</p>
                                                {isCurrent && (
                                                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Hiện tại</span>
                                                )}
                                            </div>
                                            <p className={`text-xs mt-0.5 ${step.completed ? 'text-stone-400' : 'text-stone-300'}`}>{step.date || '—'}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Info + Products */}
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
                            <p className="text-sm font-semibold text-stone-800">{order.receiver_name}</p>
                            <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                                {order.address_line}
                                {order.ward_name && `, ${order.ward_name}`}
                                {order.city_name && `, ${order.city_name}`}
                            </p>
                        </div>
                        <div className="h-px bg-stone-100" />
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                                <Phone className="text-stone-500" size={12} />
                            </div>
                            <span className="text-sm text-stone-600">{order.phone}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                                <Mail className="text-stone-500" size={12} />
                            </div>
                            <span className="text-sm text-stone-600 truncate">{order.mail}</span>
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
                        {order.items.map((item, i) => (
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
                            <span className="text-base font-bold text-amber-700">{formatPrice(order.total_price)}</span>
                        </div>
                    </div>
                    {canCancel(order.status) && (
                        <button onClick={() => onCancelRequest(order)}
                            className="w-full mt-3.5 py-2.5 rounded-xl border border-red-200 text-red-400 text-xs font-semibold hover:bg-red-50 transition-all flex items-center justify-center gap-1.5">
                            <Ban size={12} /> Hủy đơn hàng
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});