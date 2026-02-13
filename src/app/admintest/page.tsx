"use client";
import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { supabase } from '../libs/supabaseClient';
interface Order {
    id: string;
    total_amount: number;
    orderDate: string;
    estimatedDelivery: string;
    items: { name: string; quantity: number; price: number; image: string }[];
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

    useEffect(() => {
        loadOrders();
    }, []);

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
      quantity,
      price,
      product_id
    )
  `);


        if (error) {
            console.error(error);
            return;
        }

        const createTracking = (statusId: number) => {
            const status = STATUS_MAP[statusId];

            const steps = [
                { status: "pending", label: "Đã đặt hàng", completed: false },
                { status: "paid", label: "Đã thanh toán", completed: false },
                { status: "packing", label: "Đang đóng gói", completed: false },
                { status: "shipping", label: "Đang giao hàng", completed: false },
                { status: "completed", label: "Hoàn thành", completed: false },
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


        const mapped = data.map((o: any) => ({
            id: o.id,
            total: o.total,
            orderDate: o.order_date,
            estimatedDelivery: o.estimated_delivery || '',

            // 👉 CHUẨN THEO INT
            status: STATUS_MAP[o.status_id],

            trackingSteps: createTracking(o.status_id),

            items: o.order_items.map((i: any) => ({
                name: i.products?.name,
                quantity: i.quantity,
                price: i.price,
                image: i.products?.image,
            })),

            receiver_address: o.receiver_address,
            receiver_name: o.receiver_name,
            receiver_phone: o.receiver_phone,
            receiver_mail: o.receiver_mail,
            total_amount: o.total_amount,
        }));



        setOrders(mapped);
        setSelectedOrder(mapped[0]);
    };


    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending":
            case "pending_payment":
                return "bg-yellow-100 text-yellow-800";

            case "paid":
                return "bg-blue-100 text-blue-800";

            case "packing":
                return "bg-purple-100 text-purple-800";

            case "shipping":
                return "bg-blue-100 text-blue-800";

            case "completed":
                return "bg-green-100 text-green-800";

            case "cancelled":
            case "payment_failed":
                return "bg-red-100 text-red-800";

            default:
                return "bg-gray-100 text-gray-800";
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Package className="text-indigo-600" size={36} />
                        Theo Dõi Đơn Hàng
                    </h1>
                    <p className="text-gray-600 mt-2">Quản lý và theo dõi tình trạng đơn hàng của bạn</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Danh sách đơn hàng */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Đơn hàng của tôi</h2>
                            <div className="space-y-3">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${selectedOrder.id === order.id
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-gray-800">{order.id}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 flex items-center gap-2">
                                            <Calendar size={14} />
                                            {order.orderDate}
                                        </div>
                                        <div className="text-sm font-semibold text-indigo-600 mt-2">
                                            {formatPrice(order.total_amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chi tiết đơn hàng */}
                    {!selectedOrder ? (
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 text-center">
                            Đang tải đơn hàng...
                        </div>
                    ) : (
                        <div className="lg:col-span-2 space-y-6">                        {/* Trạng thái giao hàng */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">Trạng thái giao hàng</h2>

                                <div className="relative">
                                    {selectedOrder.trackingSteps.map((step: { status: string; label: string; date: string; completed: boolean }, index) => (
                                        <div key={index} className="flex gap-4 mb-8 last:mb-0">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500' : 'bg-gray-300'
                                                    }`}>
                                                    {step.completed ? (
                                                        <CheckCircle className="text-white" size={24} />
                                                    ) : (
                                                        <Clock className="text-white" size={24} />
                                                    )}
                                                </div>
                                                {index < selectedOrder.trackingSteps.length - 1 && (
                                                    <div className={`w-1 h-16 ${step.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                                                )}
                                            </div>

                                            <div className="flex-1 pb-8">
                                                <h3 className={`font-semibold ${step.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </h3>
                                                <p className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    {step.date || 'Chưa cập nhật'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Thông tin giao hàng */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Thông tin giao hàng</h2>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                        <MapPin className="text-indigo-600 mt-1" size={20} />
                                        <div>
                                            <p className="font-semibold text-gray-800">{selectedOrder.receiver_name}</p>
                                            <p className="text-gray-600 text-sm">{selectedOrder.receiver_address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Phone className="text-indigo-600" size={20} />
                                        <span className="text-gray-700">{selectedOrder.receiver_phone}</span>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Mail className="text-indigo-600" size={20} />
                                        <span className="text-gray-700">{selectedOrder.receiver_mail}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Sản phẩm */}
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-4">Sản phẩm đã đặt</h2>

                                <div className="space-y-3">
                                    {selectedOrder.items.map((item: { name: string; quantity: number; price: number; image: string }, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="text-4xl">{item.image}</div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-indigo-600">{formatPrice(item.price)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-800">Tổng cộng:</span>
                                        <span className="text-2xl font-bold text-indigo-600">{formatPrice(selectedOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}</div>
            </div>
        </div>
    );

};

export default OrderTracking;