import OrderCard from "@/components/OrderCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

//todo: remove mock functionality - replace with real data from backend
const mockOrders = [
  {
    orderId: "PO-2024-001",
    supplier: "Green Valley Farms",
    status: "draft" as const,
    items: [
      { item: "Organic Tomatoes", quantity: 60, unit: "lbs", price: 89.40 },
      { item: "Fresh Lettuce", quantity: 25, unit: "heads", price: 37.50 }
    ],
    total: 126.90
  },
  {
    orderId: "PO-2024-002", 
    supplier: "Fresh Harvest Co",
    status: "approved" as const,
    items: [
      { item: "Carrots", quantity: 40, unit: "lbs", price: 32.00 }
    ],
    total: 32.00
  },
  {
    orderId: "PO-2024-003",
    supplier: "Organic Depot",
    status: "sent" as const,
    items: [
      { item: "Bell Peppers", quantity: 25, unit: "lbs", price: 48.75 },
      { item: "Cucumbers", quantity: 30, unit: "units", price: 22.50 }
    ],
    total: 71.25
  }
];

export default function Orders() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Purchase Orders</h1>
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
        {mockOrders.map((order) => (
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
        ))}
      </div>
    </div>
  );
}