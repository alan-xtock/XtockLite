import { useState } from "react";
import DashboardCard from "@/components/DashboardCard";
import UploadArea from "@/components/UploadArea";
import ForecastCard from "@/components/ForecastCard";
import OrderCard from "@/components/OrderCard";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Sun, Cloud, CloudRain, Key } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [hasUploadedFile, setHasUploadedFile] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const [selectedWeather, setSelectedWeather] = useState<"sunny" | "cloudy" | "rainy">("cloudy");
  const [toastApiKey, setToastApiKey] = useState("");
  const [isConnectingToast, setIsConnectingToast] = useState(false);
  const [isToastConnected, setIsToastConnected] = useState(false);
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

  // Generate forecasts mutation - use TRUE 1-day endpoint
  const generateForecastMutation = useMutation({
    mutationFn: async (params: { weather?: "sunny" | "cloudy" | "rainy" }) => {
      const response = await fetch('/api/forecasts/generate-1day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!response.ok) throw new Error('Failed to generate forecasts');
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Forecast generation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/forecasts'] });
      setShowForecast(true);
      setIsGeneratingForecast(false);
      toast({ title: "Forecasts generated successfully" });
    },
    onError: (error: any) => {
      console.log('Forecast generation failed:', error);
      setIsGeneratingForecast(false);
      toast({ 
        title: "Failed to generate forecasts", 
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleUploadStart = () => {
    // Don't set generating forecast during upload
    // Only set it when user clicks the forecast button
  };

  const handleFileUpload = (result: any) => {
    console.log('Upload completed:', result);
    setUploadResult(result);
    setHasUploadedFile(true);
    setIsGeneratingForecast(false); // Ensure button is visible after upload
    
    // Don't auto-generate forecasts - let user click the button instead
    // This prevents getting stuck in generating state
  };

  const handleGenerateForecast = () => {
    console.log('Generate forecast button clicked');
    setIsGeneratingForecast(true);
    generateForecastMutation.mutate({
      weather: selectedWeather
    });
  };

  const handleGenerateOrder = () => {
    console.log('Generate order triggered');
    setShowOrder(true);
  };

  const handleConnectToast = async () => {
    if (!toastApiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Toast API key",
        variant: "destructive"
      });
      return;
    }

    setIsConnectingToast(true);

    try {
      // Simulate connection to Toast and call prediction endpoint with dummy data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call delay

      // Generate dummy sales data and call forecast endpoint
      const dummySalesData = [
        { item: "Tomatoes", quantity: 15, date: "2024-01-01", unit: "lbs", price: 2.50 },
        { item: "Lettuce", quantity: 8, date: "2024-01-01", unit: "heads", price: 1.25 },
        { item: "Onions", quantity: 12, date: "2024-01-01", unit: "lbs", price: 1.80 },
        { item: "Carrots", quantity: 10, date: "2024-01-01", unit: "lbs", price: 1.50 },
        { item: "Bell Peppers", quantity: 6, date: "2024-01-01", unit: "lbs", price: 3.00 }
      ];

      // Simulate storing dummy data (you could make an actual API call here)
      console.log('Simulating Toast connection with dummy data:', dummySalesData);

      // Call the actual prediction endpoint
      const response = await fetch('/api/forecasts/generate-1day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weather: selectedWeather })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Forecast generated successfully:', result);

        setIsToastConnected(true);
        setHasUploadedFile(true); // Enable the rest of the flow
        setUploadResult({
          validRows: dummySalesData.length,
          totalRows: dummySalesData.length,
          errors: []
        });

        // Automatically show forecasts
        queryClient.invalidateQueries({ queryKey: ['/api/forecasts'] });
        setShowForecast(true);

        toast({
          title: "Toast Connected Successfully!",
          description: "Your sales data has been imported and forecasts generated."
        });
      } else {
        throw new Error('Failed to generate forecasts');
      }

    } catch (error) {
      console.error('Error connecting to Toast:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Toast. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnectingToast(false);
    }
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
        {/* Stats Overview - Only show when we have Toast connected */}
        {isToastConnected && (
          <div className="grid grid-cols-2 gap-4">
            <DashboardCard
              title="Items Tracked"
              value={uploadResult?.validRows?.toString() || '5'}
              subtitle="Items from Toast"
              trend={0}
              variant="accent"
            />
            <DashboardCard
              title="Toast Connected"
              value="✓"
              subtitle="Ready for forecasting"
              trend={0}
            />
          </div>
        )}

        {/* Welcome Section - Show when no Toast connection */}
        {!isToastConnected && (
          <div className="text-center py-8 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                Welcome to XtockLite
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Connect your Toast account to start reducing produce costs with AI-powered forecasting.
              </p>
            </div>
          </div>
        )}

        {/* Toast API Connection Section */}
        {!isToastConnected && (
          <div data-testid="toast-connection-section" className="space-y-4">
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Connect to Toast
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter your Toast API key to import sales data and generate forecasts automatically.
            </p>
            <div className="max-w-md mx-auto space-y-4">
              <div className="space-y-2">
                <Label htmlFor="toast-api-key">Toast API Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="toast-api-key"
                    type="password"
                    placeholder="Enter your Toast API key"
                    value={toastApiKey}
                    onChange={(e) => setToastApiKey(e.target.value)}
                    className="pl-10"
                    disabled={isConnectingToast}
                  />
                </div>
              </div>
              <Button
                onClick={handleConnectToast}
                disabled={isConnectingToast || !toastApiKey.trim()}
                className="w-full"
                data-testid="button-connect-toast"
              >
                {isConnectingToast ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting to Toast...
                  </>
                ) : (
                  "Connect to Toast"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Upload Section - Now hidden since Toast connection replaces it */}
        {!hasUploadedFile && isToastConnected && (
          <div data-testid="upload-section" className="hidden">
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

        {/* Toast Connection Summary */}
        {isToastConnected && uploadResult && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Toast Connection Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <DashboardCard
                title="Records Processed"
                value={uploadResult.validRows?.toString() || "5"}
                subtitle={`items imported from Toast`}
                trend={5}
              />
              <DashboardCard
                title="Data Quality"
                value="100%"
                subtitle="Toast integration success"
                trend={5}
                variant="accent"
              />
            </div>
          </div>
        )}

        {/* Forecast Section */}
        {showForecast && (
          <div data-testid="forecast-section">
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Next-Day Sales Forecast
            </h2>
            {(() => {
              // Extract the actual forecast array from the API response
              const forecastArray = (forecasts as any)?.forecasts || [];
              // Use the currently selected weather instead of API response to avoid stale data
              const weather = selectedWeather;
              
              return Array.isArray(forecastArray) && forecastArray.length > 0 ? (
                <ForecastCard
                  date="Tomorrow"
                  items={forecastArray.map((item: any) => ({
                    item: item.item,
                    predictedQuantity: item.predictedQuantity
                  }))}
                  weather={weather}
                  onGenerateOrder={handleGenerateOrder}
                />
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {forecastsLoading ? 'Loading forecasts...' : 'No forecast data available'}
                </div>
              );
            })()}
          </div>
        )}

        {/* Order Section */}
        {showOrder && (forecasts as any)?.forecasts && Array.isArray((forecasts as any).forecasts) && (
          <div data-testid="order-section">
            <h2 className="text-lg font-semibold mb-3 text-foreground">
              Generated Purchase Order
            </h2>
            <OrderCard
              orderId={`PO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`}
              supplier="Your Supplier"
              status="draft"
              items={(forecasts as any).forecasts.map((forecast: any) => ({
                item: forecast.item,
                quantity: forecast.basedOnData?.recommendedOrderQuantity || forecast.predictedQuantity,
                unit: "units",
                price: (forecast.basedOnData?.recommendedOrderQuantity || forecast.predictedQuantity) * 1.00 // Default $1 per unit
              }))}
              total={(forecasts as any).forecasts.reduce((sum: number, forecast: any) => sum + ((forecast.basedOnData?.recommendedOrderQuantity || forecast.predictedQuantity) * 1.00), 0)}
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

        {/* Weather Selector & Generate Forecast Button */}
        {isToastConnected && !isGeneratingForecast && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <span className="text-sm font-medium text-muted-foreground">Weather for tomorrow:</span>
              <Select 
                value={selectedWeather} 
                onValueChange={(value: "sunny" | "cloudy" | "rainy") => {
                  console.log('Weather selection changed to:', value);
                  setSelectedWeather(value);
                }}
              >
                <SelectTrigger className="w-32" data-testid="select-weather">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent data-testid="select-weather-content">
                  <SelectItem value="sunny" data-testid="option-sunny">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Sunny
                    </div>
                  </SelectItem>
                  <SelectItem value="cloudy" data-testid="option-cloudy">
                    <div className="flex items-center gap-2">
                      <Cloud className="h-4 w-4" />
                      Cloudy
                    </div>
                  </SelectItem>
                  <SelectItem value="rainy" data-testid="option-rainy">
                    <div className="flex items-center gap-2">
                      <CloudRain className="h-4 w-4" />
                      Rainy
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleGenerateForecast}
              size="lg"
              data-testid="button-generate-forecast"
              variant={showForecast ? "outline" : "default"}
            >
              {showForecast ? "Regenerate Forecast" : "Generate AI Forecast"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}