import { useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import UploadArea from "@/components/UploadArea";
import ForecastCard from "@/components/ForecastCard";
import OrderCard from "@/components/OrderCard";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const { toast } = useToast();

  // Fetch real sales data
  const { data: salesData } = useQuery({
    queryKey: ['/api/sales-data'],
    enabled: hasUploadedFile
  });

  // Fetch real forecasts
  const { data: forecasts, isLoading: forecastsLoading } = useQuery({
    queryKey: ['/api/forecasts'],
    enabled: showForecast
  });

  // Generate forecasts mutation
  const generateForecastMutation = useMutation({
    mutationFn: async (params: { forecastDays: number; bufferPercentage: number }) => {
      const response = await fetch('/api/forecasts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to generate forecasts');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/forecasts'] });
      setShowForecast(true);
      setIsGeneratingForecast(false);
      toast({ title: "Forecasts generated successfully" });
    },
    onError: (error: any) => {
      setIsGeneratingForecast(false);
      toast({ 
        title: "Failed to generate forecasts", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleUploadStart = () => {
    setIsGeneratingForecast(true);
  };

  const handleFileUpload = (result: any) => {
    console.log('Upload completed:', result);
    setUploadResult(result);
    setHasUploadedFile(true);
    
    // Auto-generate forecasts after successful upload
    setTimeout(() => {
      handleGenerateForecast();
    }, 1000);
  };

  const handleGenerateForecast = () => {
    setIsGeneratingForecast(true);
    generateForecastMutation.mutate({
      forecastDays: 7,
      bufferPercentage: 20
    });
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
            <h1 className="text-2xl font-bold text-primary" data-testid="text-app-title">XtockLite</h1>
            <p className="text-sm text-muted-foreground">AI Produce Ordering</p>
          </div>
          <Button variant="outline" size="icon" data-testid="button-refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Stats Overview - Only show when we have real data */}
        {hasUploadedFile && salesData && (
          <div className="grid grid-cols-2 gap-4">
            <DashboardCard
              title="Items Tracked"
              value={Array.isArray(salesData) ? salesData.length.toString() : '0'}
              subtitle="Sales records uploaded"
              trend={0}
              variant="accent"
            />
            <DashboardCard
              title="Ready for AI"
              value="✓"
              subtitle="Data processed successfully"
              trend={0}
            />
          </div>
        )}

        {/* Welcome Section - Show when no file uploaded */}
        {!hasUploadedFile && (
          <div className="text-center py-8 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                Welcome to XtockLite
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Upload your sales data to start reducing produce costs with AI-powered forecasting.
              </p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {!hasUploadedFile && (
          <div data-testid="upload-section">
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Upload Your Sales Data
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV file with your sales history. Include columns for date, item, quantity, unit, and price.
            </p>
            <UploadArea 
              onFileUpload={handleFileUpload} 
              onUploadStart={handleUploadStart}
            />
          </div>
        )}

        {/* Processing Status */}
        {isGeneratingForecast && (
          <div data-testid="processing-section">
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Processing your data...
            </h2>
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
        {showForecast && Array.isArray(forecasts) && (
          <div data-testid="forecast-section">
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              AI Forecast Results
            </h2>
            <ForecastCard
              date="Next 7 Days"
              items={forecasts}
              totalSavings={forecasts.reduce((sum: number, item: any) => sum + (item.estimatedSavings || 0), 0) / 100 || 0}
              onGenerateOrder={handleGenerateOrder}
            />
          </div>
        )}

        {/* Order Section */}
        {showOrder && Array.isArray(forecasts) && (
          <div data-testid="order-section">
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Generated Purchase Order
            </h2>
            <OrderCard
              orderId={`PO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`}
              supplier="Your Supplier"
              status="draft"
              items={forecasts.map((forecast: any) => ({
                item: forecast.item,
                quantity: forecast.recommendedOrderQuantity,
                unit: "units",
                price: forecast.recommendedOrderQuantity * 1.00 // Default $1 per unit
              }))}
              total={forecasts.reduce((sum: number, forecast: any) => sum + (forecast.recommendedOrderQuantity * 1.00), 0)}
              onApprove={() => {
                console.log('Order approved');
                toast({ title: "Order approved successfully" });
              }}
              onSend={() => {
                console.log('Order sent via WhatsApp');
                toast({ title: "Order sent to supplier via WhatsApp" });
              }}
            />
          </div>
        )}

        {/* Generate Forecast Button */}
        {hasUploadedFile && !showForecast && !isGeneratingForecast && (
          <div className="text-center">
            <Button 
              onClick={handleGenerateForecast}
              size="lg"
              data-testid="button-generate-forecast"
            >
              Generate AI Forecast
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}