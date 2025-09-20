import { useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import UploadArea from "@/components/UploadArea";
import ForecastCard from "@/components/ForecastCard";
import OrderCard from "@/components/OrderCard";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

//todo: remove mock functionality - replace with real data from backend
const mockForecastItems = [
  {
    item: "Organic Tomatoes",
    currentStock: 45,
    predicted: 60,
    confidence: 94,
    savings: 23.50
  },
  {
    item: "Fresh Lettuce", 
    currentStock: 30,
    predicted: 25,
    confidence: 87,
    savings: 15.75
  },
  {
    item: "Red Peppers",
    currentStock: 20, 
    predicted: 35,
    confidence: 91,
    savings: 18.25
  }
];

//todo: remove mock functionality - replace with real data from backend
const mockOrderItems = [
  { item: "Organic Tomatoes", quantity: 60, unit: "lbs", price: 89.40 },
  { item: "Fresh Lettuce", quantity: 25, unit: "heads", price: 37.50 },
  { item: "Red Peppers", quantity: 35, unit: "lbs", price: 52.25 }
];

export default function Dashboard() {
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showOrder, setShowOrder] = useState(false);

  const handleFileUpload = (file: File) => {
    console.log('File uploaded:', file.name);
    setHasUploadedFile(true);
    // Simulate processing time
    setTimeout(() => {
      setShowForecast(true);
    }, 1000);
  };

  const handleGenerateOrder = () => {
    console.log('Generate order triggered');
    setShowOrder(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">XtockLite</h1>
            <p className="text-sm text-muted-foreground">AI Produce Ordering</p>
          </div>
          <Button variant="outline" size="icon" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <DashboardCard
            title="Daily Savings"
            value="$247.50"
            subtitle="10.2% cost reduction"
            trend={10.2}
            variant="accent"
          />
          <DashboardCard
            title="Monthly Total"
            value="$6,892"
            subtitle="vs $7,650 last month"
            trend={-9.9}
          />
        </div>

        {/* Upload Section */}
        {!hasUploadedFile && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Start by uploading your sales data
            </h2>
            <UploadArea onFileUpload={handleFileUpload} />
          </div>
        )}

        {/* Forecast Section */}
        {showForecast && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              AI Forecast Results
            </h2>
            <ForecastCard
              date="Tomorrow"
              items={mockForecastItems}
              totalSavings={57.50}
              onGenerateOrder={handleGenerateOrder}
            />
          </div>
        )}

        {/* Order Section */}
        {showOrder && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Generated Purchase Order
            </h2>
            <OrderCard
              orderId="PO-2024-001"
              supplier="Green Valley Farms"
              status="draft"
              items={mockOrderItems}
              total={179.15}
              onApprove={() => console.log('Order approved')}
              onSend={() => console.log('Order sent via WhatsApp')}
            />
          </div>
        )}

        {/* Analytics Section */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">
            Performance Analytics
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              title="Cost Reduction"
              value="10.2%"
              change={2.4}
              period="last month"
              description="Exceeding target"
            />
            <StatsCard
              title="Forecast Accuracy"
              value="94.3%"
              change={-1.2}
              period="last month"
              description="AI confidence"
            />
          </div>
        </div>
      </div>
    </div>
  );
}