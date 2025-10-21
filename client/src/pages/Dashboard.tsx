import ForecastCard from "@/components/ForecastCard";
import OrderCard from "@/components/OrderCard";
import DataSourceTabs from "@/components/DataSourceTabs";
import { DashboardOverview, DataImportSummary } from "@/components/DashboardStats";
import WeatherForecastControls from "@/components/WeatherForecastControls";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const {
    hasUploadedFile,
    showForecast,
    showOrder,
    uploadResult,
    isGeneratingForecast,
    selectedWeather,
    activeTab,
    toastApiKey,
    isConnectingToast,
    isToastConnected,
    salesData,
    forecasts,
    forecastsLoading,
    setSelectedWeather,
    setActiveTab,
    setToastApiKey,
    handleUploadStart,
    handleFileUpload,
    handleGenerateForecast,
    handleGenerateOrder,
    handleConnectToast
  } = useDashboard();

  const { toast } = useToast();

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
        {/* Stats Overview */}
        <DashboardOverview
          salesData={salesData}
          hasUploadedFile={hasUploadedFile}
          isToastConnected={isToastConnected}
          uploadResult={uploadResult}
        />

        {/* Welcome Section */}
        {!hasUploadedFile && !isToastConnected && (
          <div className="text-center py-8 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                Welcome to XtockLite
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Connect your data source to start reducing produce costs with AI-powered forecasting.
              </p>
            </div>
          </div>
        )}

        {/* Data Source Selection Tabs */}
        {!hasUploadedFile && !isToastConnected && (
          <DataSourceTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            toastApiKey={toastApiKey}
            setToastApiKey={setToastApiKey}
            isConnectingToast={isConnectingToast}
            onFileUpload={handleFileUpload}
            onUploadStart={handleUploadStart}
            onConnectToast={handleConnectToast}
          />
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

        {/* Data Import Summary */}
        <DataImportSummary
          uploadResult={uploadResult}
          hasUploadedFile={hasUploadedFile}
          isToastConnected={isToastConnected}
          salesData={salesData}
        />

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
        <WeatherForecastControls
          selectedWeather={selectedWeather}
          setSelectedWeather={setSelectedWeather}
          onGenerateForecast={handleGenerateForecast}
          showForecast={showForecast}
          hasUploadedFile={hasUploadedFile}
          isToastConnected={isToastConnected}
          isGeneratingForecast={isGeneratingForecast}
        />
      </div>
    </div>
  );
}