import OrderCard from '../OrderCard';

export default function OrderCardExample() {
  const mockItems = [
    { item: "Organic Tomatoes", quantity: 60, unit: "lbs", price: 89.40 },
    { item: "Fresh Lettuce", quantity: 25, unit: "heads", price: 37.50 },
    { item: "Red Peppers", quantity: 35, unit: "lbs", price: 52.25 }
  ];

  return (
    <div className="space-y-4 p-4">
      <OrderCard
        orderId="PO-2024-001"
        supplier="Green Valley Farms"
        status="draft"
        items={mockItems}
        total={179.15}
        onApprove={() => console.log('Order approved in example')}
        onSend={() => console.log('Order sent in example')}
      />
      <OrderCard
        orderId="PO-2024-002"
        supplier="Fresh Harvest Co"
        status="approved"
        items={[{ item: "Carrots", quantity: 40, unit: "lbs", price: 32.00 }]}
        total={32.00}
        onSend={() => console.log('Order sent in example')}
      />
    </div>
  );
}