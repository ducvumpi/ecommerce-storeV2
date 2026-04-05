'use client';
import { Ban, AlertTriangle } from 'lucide-react';
import { Order } from '@/app/types/order.types';

const formatPrice = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

export function CancelConfirmModal({ order, onConfirm, onClose, isLoading }: {
    order: Order; onConfirm: () => void; onClose: () => void; isLoading: boolean;
}) {
    return (
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
                        <span className="font-semibold text-amber-700">{formatPrice(order.total_price)}</span>
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
                            ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg> Đang xử lý...</>
                            : <><Ban size={14} /> Xác nhận hủy</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}