"use client";
import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, Calendar, ChevronRight, ShoppingBag, Search, X } from 'lucide-react';
import { supabase } from '../libs/supabaseClient';
import { title } from 'process';

interface Order {
    id: string;
    total_amount: number;
    orderDate: string;
    estimatedDelivery: string;
    items: { title: string; quantity: number; price: number; image: string, color: string, size: string }[];
    receiver_address: string;
    receiver_name: string;
    receiver_phone: string;
    receiver_mail: string;
    trackingSteps: { status: string; label: string; date: string; completed: boolean }[];
    status: 'delivering' | 'completed' | 'pending' | 'cancelled';
}

const STATUS_MAP: Record<number, string> = {
    1: "pending",
    2: "pending_payment",
    3: "paid",
    4: "packing",
    5: "shipping",
    6: "completed",
    7: "cancelled",
    8: "payment_failed",
};

const OrderTracking = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredOrders(orders);
            return;
        }

        const query = searchQuery.toLowerCase();
        const filtered = orders.filter(order => {
            // Tìm theo mã đơn hàng
            const matchOrderId = order.id.toLowerCase().includes(query);

            // Tìm theo tên sản phẩm
            const matchProductName = order.items.some(item =>
                item.title?.toLowerCase().includes(query)
            );

            return matchOrderId || matchProductName;
        });

        setFilteredOrders(filtered);
    }, [searchQuery, orders]);

    const loadOrders = async () => {
        const { data, error } = await supabase
            .from("orders")
            .select(`
    *,
    order_statuses (
      id,
      name
    ),
    order_items (
      quantity,      product_id,

      products (
        title,price,
        image
      ),

      variants (
        color_id,
        size_id,

        colors (
          id,
          name
        ),

        sizes (
          id,
          name
        )
      )
    )
  `);



        if (error) {
            console.error(error);
            return;
        }

        const createTracking = (statusId: number) => {
            const status = STATUS_MAP[statusId];

            const steps = [
                { status: "pending", label: "Đã đặt hàng", date: "", completed: false },
                { status: "paid", label: "Đã thanh toán", date: "", completed: false },
                { status: "packing", label: "Đang đóng gói", date: "", completed: false },
                { status: "shipping", label: "Đang giao hàng", date: "", completed: false },
                { status: "completed", label: "Hoàn thành", date: "", completed: false },
            ];

            return steps.map((step) => {
                let completed = false;

                switch (status) {
                    case "pending":
                    case "pending_payment":
                        completed = step.status === "pending";
                        break;
                    case "paid":
                        completed = ["pending", "paid"].includes(step.status);
                        break;
                    case "packing":
                        completed = ["pending", "paid", "packing"].includes(step.status);
                        break;
                    case "shipping":
                        completed = ["pending", "paid", "packing", "shipping"].includes(step.status);
                        break;
                    case "completed":
                        completed = true;
                        break;
                    case "cancelled":
                    case "payment_failed":
                        completed = step.status === "pending";
                        break;
                    default:
                        completed = false;
                }

                return { ...step, completed };
            });
        };
        const formatDateVN = (iso: string) => {
            return new Date(iso).toLocaleDateString("vi-VN");
        };

        // → 05/02/2026

        const mapped: Order[] = data.map((o: any) => ({
            id: o.id,
            status: STATUS_MAP[o.order_statuses?.id] as any,

            orderDate: formatDateVN(o.created_at || ""),
            estimatedDelivery: formatDateVN(o.estimated_delivery || ""),

            trackingSteps: createTracking(o.order_statuses?.id || 1),

            items: o.order_items.map((i: any) => ({
                title: i.products?.title || "Không tên",
                image: i.products?.image || "",
                quantity: i.quantity,
                price: i.products?.price || 0,

                color: i.variants?.colors?.name || "",
                size: i.variants?.sizes?.name || "",
            })),

            receiver_address: o.receiver_address || "",
            receiver_name: o.receiver_name || "",
            receiver_phone: o.receiver_phone || "",
            receiver_mail: o.receiver_mail || "",

            total_amount: o.total_amount || 0,
        }));



        setOrders(mapped);
        setFilteredOrders(mapped);
        setSelectedOrder(mapped[0]);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
            case "pending_payment":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "paid":
                return "bg-sky-100 text-sky-700 border-sky-200";
            case "packing":
                return "bg-purple-100 text-purple-700 border-purple-200";
            case "shipping":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "completed":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "cancelled":
            case "payment_failed":
                return "bg-rose-100 text-rose-700 border-rose-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "Chờ xác nhận";
            case "pending_payment":
                return "Chờ thanh toán";
            case "paid":
                return "Đã thanh toán";
            case "packing":
                return "Đang đóng gói";
            case "shipping":
                return "Đang giao hàng";
            case "completed":
                return "Đã hoàn thành";
            case "cancelled":
                return "Đã hủy";
            case "payment_failed":
                return "Thanh toán thất bại";
            default:
                return "Không xác định";
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const clearSearch = () => {
        setSearchQuery('');
    };
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl">
                            <Package className="text-white" size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                Theo Dõi Đơn Hàng
                            </h1>
                            <p className="text-gray-500 mt-1">Quản lý và theo dõi tình trạng đơn hàng của bạn</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Danh sách đơn hàng */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-gray-900">Đơn hàng của tôi</h2>
                                <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full">
                                    {filteredOrders.length} đơn
                                </span>
                            </div>

                            {/* Search Bar */}
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Tìm theo mã đơn hoặc sản phẩm..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={clearSearch}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                                {searchQuery && (
                                    <p className="text-xs text-gray-500 mt-2 ml-1">
                                        {filteredOrders.length === 0 ? 'Không tìm thấy đơn hàng' : `Tìm thấy ${filteredOrders.length} đơn hàng`}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3 max-h-[calc(100vh-380px)] overflow-y-auto pr-2">
                                {filteredOrders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Package className="mx-auto text-gray-300 mb-3" size={48} />
                                        <p className="text-gray-500 text-sm">
                                            {searchQuery ? 'Không tìm thấy đơn hàng' : 'Chưa có đơn hàng nào'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredOrders.map((order) => (
                                        <div
                                            key={order.id}
                                            onClick={() => setSelectedOrder(order)}
                                            className={`group p-4 rounded-2xl cursor-pointer transition-all duration-200 border-2 ${selectedOrder?.id === order.id
                                                ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md'
                                                : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50 hover:shadow-sm'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 text-sm mb-1">#{order.id.slice(0, 8)}</p>
                                                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                        {getStatusText(order.status)}
                                                    </span>
                                                </div>
                                                <ChevronRight
                                                    className={`transition-transform ${selectedOrder?.id === order.id ? 'text-indigo-600' : 'text-gray-400'}`}
                                                    size={20}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                                <Calendar size={14} />
                                                <span>{order.orderDate}</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                <span className="text-xs text-gray-500">Tổng tiền</span>
                                                <span className="text-sm font-bold text-indigo-600">
                                                    {formatPrice(order.total_amount)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chi tiết đơn hàng */}
                    {!selectedOrder ? (
                        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-12 text-center">
                            <div className="animate-pulse">
                                <Package className="mx-auto text-gray-300 mb-4" size={64} />
                                <p className="text-gray-400">Đang tải đơn hàng...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="lg:col-span-2 space-y-6">
                            {/* Trạng thái giao hàng */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <Truck className="text-indigo-600" size={24} />
                                    <h2 className="text-xl font-bold text-gray-900">Trạng thái giao hàng</h2>
                                </div>

                                <div className="relative pl-2">
                                    {selectedOrder.trackingSteps.map((step: { status: string; label: string; date: string; completed: boolean }, index) => (
                                        <div key={index} className="flex gap-6 mb-8 last:mb-0">
                                            <div className="flex flex-col items-center">
                                                <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${step.completed
                                                    ? 'bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-200'
                                                    : 'bg-gray-200'
                                                    }`}>
                                                    {step.completed ? (
                                                        <CheckCircle className="text-white" size={28} />
                                                    ) : (
                                                        <Clock className="text-gray-400" size={28} />
                                                    )}
                                                </div>
                                                {index < selectedOrder.trackingSteps.length - 1 && (
                                                    <div className={`w-0.5 h-16 mt-2 transition-all duration-300 ${step.completed ? 'bg-gradient-to-b from-emerald-400 to-green-500' : 'bg-gray-200'
                                                        }`} />
                                                )}
                                            </div>

                                            <div className="flex-1 pb-4">
                                                <h3 className={`font-semibold text-lg mb-1 ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </h3>
                                                <p className={`text-sm ${step.completed ? 'text-gray-500' : 'text-gray-400'}`}>
                                                    {step.date || 'Chưa cập nhật'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Thông tin giao hàng */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <MapPin className="text-indigo-600" size={24} />
                                    <h2 className="text-xl font-bold text-gray-900">Thông tin giao hàng</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-100">
                                        <div className="bg-indigo-100 p-2.5 rounded-xl">
                                            <MapPin className="text-indigo-600" size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 mb-1">{selectedOrder.receiver_name}</p>
                                            <p className="text-gray-600 text-sm leading-relaxed">{selectedOrder.receiver_address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-100">
                                        <div className="bg-blue-100 p-2.5 rounded-xl">
                                            <Phone className="text-blue-600" size={20} />
                                        </div>
                                        <span className="text-gray-700 font-medium">{selectedOrder.receiver_phone}</span>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-100">
                                        <div className="bg-purple-100 p-2.5 rounded-xl">
                                            <Mail className="text-purple-600" size={20} />
                                        </div>
                                        <span className="text-gray-700 font-medium">{selectedOrder.receiver_mail}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sản phẩm */}
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <ShoppingBag className="text-indigo-600" size={24} />
                                    <h2 className="text-xl font-bold text-gray-900">Sản phẩm đã đặt</h2>
                                </div>

                                <div className="space-y-3">
                                    {selectedOrder.items.map((item: { title: string; quantity: number; price: number; image: string, color: string, size: string }, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                                            <div className="w-16 h-16 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                                <img
                                                    src={item.image || "/no-image.png"}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                                                <p className="text-sm text-gray-500">Số lượng: <span className="font-medium text-gray-700">{item.quantity}</span> Màu sắc: <span className="font-medium text-gray-700">{item.color}</span> Size: <span className="font-medium text-gray-700">{item.size}</span></p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-indigo-600">{formatPrice(item.price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t-2 border-gray-100">
                                    <div className="flex justify-between items-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl">
                                        <span className="text-lg font-bold text-gray-900">Tổng cộng:</span>
                                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                            {formatPrice(selectedOrder.total_amount)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;