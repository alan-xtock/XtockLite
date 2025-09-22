import { useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import UploadArea from "@/components/UploadArea";
import ForecastCard from "@/components/ForecastCard";
import OrderCard from "@/components/OrderCard";
import StatsCard from "@/components/StatsCard";
import TryNowDemo from "@/components/TryNowDemo";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";

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
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentDemoStep, setCurrentDemoStep] = useState(1);

  const handleUploadStart = () => {
    setIsProcessing(true);
  };

  const handleFileUpload = (result: any) => {
    console.log('Upload completed:', result);
    setUploadResult(result);
    setHasUploadedFile(true);
    
    // Progress demo to step 2 if in demo mode and keep processing active
    if (isDemoMode) {
      setCurrentDemoStep(2);
      // Auto-scroll to processing section
      setTimeout(() => {
        const processingSection = document.querySelector('[data-testid="processing-section"]');
        if (processingSection) {
          processingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
    
    // Simulate AI processing time before showing forecast
    setTimeout(() => {
      setIsProcessing(false); // Stop processing animation
      setShowForecast(true);
      // Progress demo to step 3 if in demo mode
      if (isDemoMode) {
        setCurrentDemoStep(3);
        // Auto-scroll to forecast section
        setTimeout(() => {
          const forecastSection = document.querySelector('[data-testid="forecast-section"]');
          if (forecastSection) {
            forecastSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 500);
      }
    }, 2000);
  };

  const handleGenerateOrder = () => {
    console.log('Generate order triggered');
    setShowOrder(true);
    
    // Progress demo to step 4 if in demo mode
    if (isDemoMode) {
      setCurrentDemoStep(4);
      // Auto-scroll to order section
      setTimeout(() => {
        const orderSection = document.querySelector('[data-testid="order-section"]');
        if (orderSection) {
          orderSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  };

  const handleStartDemo = () => {
    console.log('Demo started');
    setIsDemoMode(true);
    setCurrentDemoStep(1);
    // Scroll to upload area
    setTimeout(() => {
      const uploadSection = document.querySelector('[data-testid="upload-section"]');
      if (uploadSection) {
        uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleExitDemo = () => {
    console.log('Demo exited');
    setIsDemoMode(false);
    setCurrentDemoStep(1);
    // Reset demo state
    setHasUploadedFile(false);
    setShowForecast(false);
    setShowOrder(false);
    setUploadResult(null);
    setIsProcessing(false);
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

        {/* Try Now Demo - Show when no file uploaded */}
        {!hasUploadedFile && !isDemoMode && (
          <div className="text-center py-8 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-center">
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Ready to reduce your produce costs by 10%?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Discover how AI can transform your purchasing decisions and save money every day.
              </p>
            </div>
            <TryNowDemo 
              onStartDemo={handleStartDemo} 
              isDemoActive={isDemoMode}
              currentDemoStep={currentDemoStep}
              onExitDemo={handleExitDemo}
            />
          </div>
        )}

        {/* Upload Section */}
        {(!hasUploadedFile && isDemoMode) && (
          <div data-testid="upload-section" className={isDemoMode && currentDemoStep === 1 ? "ring-2 ring-primary ring-offset-2 rounded-lg p-4" : ""}>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              {isDemoMode ? "Step 1: Upload Your Sales Data" : "Start by uploading your sales data"}
            </h2>
            {isDemoMode && (
              <p className="text-sm text-muted-foreground mb-4">
                Upload a CSV file with your sales history from the last 30 days. Include columns for date, item, quantity, unit, and price.
              </p>
            )}
            <UploadArea 
              onFileUpload={handleFileUpload} 
              onUploadStart={handleUploadStart}
            />
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div data-testid="processing-section" className={isDemoMode && currentDemoStep === 2 ? "ring-2 ring-accent ring-offset-2 rounded-lg p-4" : ""}>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              {isDemoMode && currentDemoStep === 2 ? "Step 2: AI Analysis in Progress" : "Processing your data..."}
            </h2>
            {isDemoMode && currentDemoStep === 2 && (
              <p className="text-sm text-muted-foreground mb-4">
                Our AI is analyzing your sales patterns, identifying trends, and calculating optimal order quantities.
              </p>
            )}
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Analyzing sales patterns with AI</p>
            </div>
          </div>
        )}

        {/* Upload Summary */}
        {hasUploadedFile && uploadResult && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Data Upload Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <DashboardCard
                title="Records Processed"
                value={uploadResult.validRows?.toString() || "0"}
                subtitle={`from ${uploadResult.totalRows || 0} total rows`}
                trend={uploadResult.errors?.length > 0 ? -((uploadResult.errors.length / uploadResult.totalRows) * 100) : 0}
              />
              <DashboardCard
                title="Data Quality"
                value={`${Math.round(((uploadResult.validRows || 0) / (uploadResult.totalRows || 1)) * 100)}%`}
                subtitle="validation success rate"
                trend={uploadResult.errors?.length === 0 ? 5 : 0}
                variant={uploadResult.errors?.length === 0 ? "accent" : "default"}
              />
            </div>
          </div>
        )}

        {/* Forecast Section */}
        {showForecast && (
          <div data-testid="forecast-section" className={isDemoMode && currentDemoStep === 3 ? "ring-2 ring-accent ring-offset-2 rounded-lg p-4" : ""}>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              {isDemoMode && currentDemoStep === 3 ? "Step 3: Review AI Forecasts" : "AI Forecast Results"}
            </h2>
            {isDemoMode && currentDemoStep === 3 && (
              <p className="text-sm text-muted-foreground mb-4">
                Review the AI predictions showing demand forecasts, confidence scores, and potential savings. Click "Generate Order" when ready.
              </p>
            )}
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
          <div data-testid="order-section" className={isDemoMode && currentDemoStep === 4 ? "ring-2 ring-accent ring-offset-2 rounded-lg p-4" : ""}>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              {isDemoMode && currentDemoStep === 4 ? "Step 4: Approve & Send Order" : "Generated Purchase Order"}
            </h2>
            {isDemoMode && currentDemoStep === 4 && (
              <p className="text-sm text-muted-foreground mb-4">
                Review the automatically generated purchase order. Approve it and send directly to your supplier via WhatsApp.
              </p>
            )}
            <OrderCard
              orderId="PO-2024-001"
              supplier="Green Valley Farms"
              status="draft"
              items={mockOrderItems}
              total={179.15}
              onApprove={() => {
                console.log('Order approved');
                if (isDemoMode) {
                  // Demo completed successfully
                  setTimeout(() => {
                    handleExitDemo();
                  }, 2000);
                }
              }}
              onSend={() => {
                console.log('Order sent via WhatsApp');
                if (isDemoMode) {
                  // Demo completed successfully
                  setTimeout(() => {
                    handleExitDemo();
                  }, 2000);
                }
              }}
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