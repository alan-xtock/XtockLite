import OrderCard from "@/components/OrderCard";
import { DataImportSummary } from "@/components/DashboardStats";
import WeatherForecastControls from "@/components/WeatherForecastControls";
import ForecastSection from "@/components/ForecastSection";
import { useDashboardContext } from "@/contexts/DashboardContext";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const {
    hasUploadedFile,
    showForecast,
    showOrder,
    uploadResult,
    isGeneratingForecast,
    selectedWeather,
    isToastConnected,
    loadingProgress,
    firstForecastLoad,
    salesData,
    forecasts,
    forecastsLoading,
    setSelectedWeather,
    handleGenerateForecast,
    handleGenerateOrder
  } = useDashboardContext();

  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Toast Connection Success Banner */}
        {uploadResult?.toastDataUsed && isToastConnected && loadingProgress === 4 && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
            <div className="flex items-center text-green-800">
              <div className="text-sm font-medium">
                ✅ Toast POS: Successfully connected and imported sales data
              </div>
            </div>
          </div>
        )}


        {/* No Data Connected Message */}
        {!hasUploadedFile && !isToastConnected && (
          <div className="text-center py-12 space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-foreground">
                No Data Source Connected
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Go to the Connect tab to upload a CSV file or connect to Toast POS to start using Xtock.
              </p>
            </div>
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

        {/* Data Import Summary - Show after data is imported (step 2+) */}
        {loadingProgress >= 2 && (
          <div className="animate-fade-in">
            <DataImportSummary
              uploadResult={uploadResult}
              hasUploadedFile={hasUploadedFile}
              isToastConnected={isToastConnected}
              salesData={salesData}
              loadingProgress={loadingProgress}
            />
          </div>
        )}

        {/* Generate Forecast Button - Show after data is loaded */}
        {loadingProgress >= 4 && !showForecast && !isGeneratingForecast && (
          <div className="text-center py-8 space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-foreground">
              Ready to Generate Forecasts
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your data is loaded. Click below to generate AI-powered demand forecasts for tomorrow.
            </p>
            <Button
              onClick={handleGenerateForecast}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4"
            >
              Generate Forecast
            </Button>
          </div>
        )}

        {/* Forecast Section - Show after user clicks generate */}
        {showForecast && (
          <div className="animate-fade-in">
            <ForecastSection
              showForecast={showForecast}
              forecasts={forecasts}
              forecastsLoading={forecastsLoading}
              selectedWeather={selectedWeather}
              onGenerateOrder={handleGenerateOrder}
              firstForecastLoad={firstForecastLoad}
            />
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

        {/* Hide WeatherForecastControls - using prominent Generate Forecast button instead */}
      </div>
    </div>
  );
}