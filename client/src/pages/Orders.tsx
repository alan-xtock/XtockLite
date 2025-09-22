import OrderCard from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Orders() {
  // Fetch real orders from backend
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/orders']
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-orders-title">Purchase Orders</h1>
            <p className="text-sm text-muted-foreground">Manage your orders</p>
          </div>
          <Button data-testid="button-new-order">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </div>
      </div>

      {/* Orders List */}
      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : (orders as any[]).length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground mb-4">
              Orders will appear here once you generate them from forecasts.
            </p>
            <Button variant="outline" data-testid="button-go-to-dashboard">
              Go to Dashboard
            </Button>
          </div>
        ) : (
          (orders as any[]).map((order: any) => (
            <OrderCard
              key={order.orderId}
              orderId={order.orderId}
              supplier={order.supplier}
              status={order.status}
              items={order.items}
              total={order.total}
              onApprove={() => console.log('Order approved:', order.orderId)}
              onSend={() => console.log('Order sent:', order.orderId)}
            />
          ))
        )}
      </div>
    </div>
  );
}