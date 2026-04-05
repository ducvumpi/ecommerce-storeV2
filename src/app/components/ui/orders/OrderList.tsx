'use client';
import { Package, Search, X, Boxes, Calendar } from 'lucide-react';
import { Order } from '@/app/types/order.types';
import { StatusBadge } from './StatusBadge';
import { memo } from 'react';

const formatPrice = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

interface Props {
    filteredOrders: Order[];
    selectedOrder: Order | null;
    searchQuery: string;
    onSearch: (q: string) => void;
    onSelect: (order: Order) => void;
}
export const OrderList = memo(function OrderList({ filteredOrders, selectedOrder, searchQuery, onSearch, onSelect }: Props) {

    return (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden sticky top-6">
            {/* Search header */}
            <div className="px-5 pt-5 pb-4 border-b border-stone-100">
                <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-base font-semibold text-stone-800">Đơn hàng của tôi</h2>
                    <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                        {filteredOrders.length} đơn
                    </span>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
                    <input type="text" placeholder="Tìm mã đơn hoặc sản phẩm..."
                        value={searchQuery} onChange={e => onSearch(e.target.value)}
                        className="w-full pl-9 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300 transition-all"
                    />
                    {searchQuery && (
                        <button onClick={() => onSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
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

            {/* List */}
            <div className="divide-y divide-stone-100 max-h-[calc(100vh-320px)] overflow-y-auto">
                {filteredOrders.length === 0 ? (
                    <div className="py-14 text-center">
                        <Boxes className="mx-auto text-stone-300 mb-3" size={36} />
                        <p className="text-stone-400 text-sm">
                            {searchQuery ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
                        </p>
                    </div>
                ) : filteredOrders.map(order => {
                    const isActive = selectedOrder?.id === order.id;
                    return (
                        <div key={order.id} onClick={() => onSelect(order)}
                            className={`px-5 py-4 cursor-pointer transition-all duration-150 ${isActive
                                ? 'bg-amber-50/70 border-l-[3px] border-l-amber-500'
                                : 'hover:bg-stone-50 border-l-[3px] border-l-transparent'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 flex-shrink-0">
                                    {order.items[0]?.image
                                        ? <img src={order.items[0].image} alt="" className="w-full h-full object-cover" />
                                        : <div className="w-full h-full flex items-center justify-center"><Package size={16} className="text-stone-300" /></div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-semibold text-stone-500">#{order.id.slice(0, 8)}</p>
                                        <StatusBadge status={order.status} />
                                    </div>
                                    <p className="text-xs text-stone-500 truncate">{order.items.map(i => i.title).join(', ')}</p>
                                    <div className="flex items-center justify-between mt-1.5">
                                        <span className="text-xs text-stone-400 flex items-center gap-1"><Calendar size={10} />{order.orderDate}</span>
                                        <span className={`text-xs font-bold ${isActive ? 'text-amber-700' : 'text-stone-600'}`}>
                                            {formatPrice(order.total_price)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});