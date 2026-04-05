'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Order } from '@/app/types/order.types';
import { orderServiceServer } from '@/app/services/order.service';


export function useOrders(initialOrders: Order[] = []) { // 👈 nhận initialOrders
    const [orders, setOrders] = useState<Order[]>(initialOrders); // 👈 có data ngay
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrders[0]?.id ?? null);
    const [loading, setLoading] = useState(false); // 👈 không cần loading

    const [searchQuery, setSearchQuery] = useState('');
    const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

    useEffect(() => {
        orderServiceServer.getOrders().then(data => {
            setOrders(data ?? []);
            setSelectedOrderId(data?.[0]?.id ?? null); // 👈 chỉ set id
        }).finally(() => setLoading(false));
    }, []);

    // useMemo — chỉ tính lại khi orders hoặc searchQuery thay đổi
    const filteredOrders = useMemo(() => {
        if (!searchQuery.trim()) return orders;
        const q = searchQuery.toLowerCase();
        return orders.filter(o =>
            o.id.toLowerCase().includes(q) ||
            o.items.some(i => i.title?.toLowerCase().includes(q))
        );
    }, [searchQuery, orders]);

    // useMemo — chỉ tính lại khi id thay đổi
    const selectedOrder = useMemo(() =>
        orders.find(o => o.id === selectedOrderId) ?? null,
        [selectedOrderId, orders]
    );

    const cancelledTracking = [
        { status: 'pending', label: 'Đặt hàng', completed: true, date: new Date().toLocaleDateString('vi-VN') },
        { status: 'paid', label: 'Thanh toán', completed: false, date: '' },
        { status: 'packing', label: 'Đóng gói', completed: false, date: '' },
        { status: 'shipping', label: 'Vận chuyển', completed: false, date: '' },
        { status: 'completed', label: 'Hoàn tất', completed: false, date: '' },
    ]; const handleCancel = useCallback(async () => {
        if (!cancelModalOrder) return;
        setIsCancelling(true);
        try {
            await orderServiceServer.cancelOrder(cancelModalOrder.id);
            setOrders(prev => prev.map(o =>
                o.id === cancelModalOrder.id
                    ? { ...o, status: 'cancelled' as const, trackingSteps: cancelledTracking }
                    : o
            ));
            setCancelModalOrder(null);
            setCancelSuccess(cancelModalOrder.id);
            setTimeout(() => setCancelSuccess(null), 3000);
        } catch (e) {
            console.error(e);
        } finally {
            setIsCancelling(false);
        }
    }, [cancelModalOrder]);

    return {
        orders,
        filteredOrders,
        selectedOrder,
        setSelectedOrderId,
        searchQuery,
        setSearchQuery,
        loading,
        handleCancel,
        cancelModalOrder,    // 👈
        setCancelModalOrder, // 👈
        isCancelling,        // 👈
        cancelSuccess,       // 👈
    }
}