import ForecastCard from "@/components/ForecastCard";

interface ForecastSectionProps {
  showForecast: boolean;
  forecasts: any;
  forecastsLoading: boolean;
  selectedWeather: "sunny" | "cloudy" | "rainy";
  onGenerateOrder: () => void;
}

export default function ForecastSection({
  showForecast,
  forecasts,
  forecastsLoading,
  selectedWeather,
  onGenerateOrder
}: ForecastSectionProps) {
  if (!showForecast) {
    return null;
  }

  return (
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
            onGenerateOrder={onGenerateOrder}
          />
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            {forecastsLoading ? 'Loading forecasts...' : 'No forecast data available'}
          </div>
        );
      })()}
    </div>
  );
}