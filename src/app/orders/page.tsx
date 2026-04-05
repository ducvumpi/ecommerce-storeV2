import { getOrdersServer } from '@/app/services/order.server.service';
import { OrderTracking } from '../components/ui/orders/OrderTracking';

export default async function OrdersPage() {
    const initialOrders = await getOrdersServer();
    return <OrderTracking initialOrders={initialOrders} />;
}