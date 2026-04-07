export interface OrderItem {
    title: string;
    quantity: number;
    price: number;
    image: string;
    color: string;
    size: string;
}

export interface TrackingStep {
    status: string;
    label: string;
    date: string;
    completed: boolean;
}

export type OrderStatus =
    | 'delivering' | 'completed' | 'pending' | 'cancelled'
    | 'pending_payment' | 'paid' | 'packing' | 'shipping' | 'payment_failed';

export interface Order {
    id: string;
    total_price: number;
    orderDate: string;
    estimatedDelivery: string;
    items: OrderItem[];
    address_line: string;
    ward_name: string;
    city_name: string;
    receiver_name: string;
    phone: string;
    mail: string;
    trackingSteps: TrackingStep[];
    status: OrderStatus;
    // order.types.ts
    payment_method: string;
    payment_method_label: string;
    payment_method_icon: string;
    payment_method_color: string;
}