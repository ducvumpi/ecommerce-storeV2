import { orderServiceServer } from '@/app/services/order.service';
import { OrderTracking } from '../components/ui/orders/OrderTracking';

export default async function OrdersPage() {
    const initialOrders = await orderServiceServer.getOrders();

    return <OrderTracking initialOrders={initialOrders} />;
}