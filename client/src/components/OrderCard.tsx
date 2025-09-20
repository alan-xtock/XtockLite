import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, CheckCircle, Clock, Send } from "lucide-react";

interface OrderItem {
  item: string;
  quantity: number;
  unit: string;
  price: number;
}

interface OrderCardProps {
  orderId: string;
  supplier: string;
  status: "draft" | "approved" | "sent";
  items: OrderItem[];
  total: number;
  onApprove?: () => void;
  onSend?: () => void;
}

export default function OrderCard({ 
  orderId, 
  supplier, 
  status, 
  items, 
  total, 
  onApprove, 
  onSend 
}: OrderCardProps) {
  const [currentStatus, setCurrentStatus] = useState(status);

  const handleApprove = () => {
    console.log('Order approved:', orderId);
    setCurrentStatus("approved");
    onApprove?.();
  };

  const handleSend = () => {
    console.log('Order sent via WhatsApp:', orderId);
    setCurrentStatus("sent");
    onSend?.();
  };

  const getStatusIcon = () => {
    switch (currentStatus) {
      case "draft":
        return <Clock className="h-4 w-4" />;
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "sent":
        return <Send className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case "draft":
        return "secondary";
      case "approved":
        return "default";
      case "sent":
        return "default";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Order #{orderId}</CardTitle>
          <p className="text-sm text-muted-foreground">{supplier}</p>
        </div>
        <Badge variant={getStatusColor()} className="flex items-center gap-1">
          {getStatusIcon()}
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-foreground">
                {item.quantity} {item.unit} {item.item}
              </span>
              <span className="font-medium">${item.price.toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between items-center font-semibold">
            <span>Total</span>
            <span className="text-lg">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {currentStatus === "draft" && (
            <Button 
              onClick={handleApprove}
              variant="outline" 
              className="flex-1"
              data-testid="button-approve"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          {currentStatus === "approved" && (
            <Button 
              onClick={handleSend}
              className="flex-1 bg-accent hover:bg-accent/90"
              data-testid="button-send"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send via WhatsApp
            </Button>
          )}
          {currentStatus === "sent" && (
            <Button variant="outline" className="flex-1" disabled>
              <MessageCircle className="h-4 w-4 mr-2 text-accent" />
              Sent to {supplier}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}