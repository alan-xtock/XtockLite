import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Cloud, CloudRain } from "lucide-react";

interface WeatherForecastControlsProps {
  selectedWeather: "sunny" | "cloudy" | "rainy";
  setSelectedWeather: (weather: "sunny" | "cloudy" | "rainy") => void;
  onGenerateForecast: () => void;
  showForecast: boolean;
  hasUploadedFile: boolean;
  isToastConnected: boolean;
  isGeneratingForecast: boolean;
}

export default function WeatherForecastControls({
  selectedWeather,
  setSelectedWeather,
  onGenerateForecast,
  showForecast,
  hasUploadedFile,
  isToastConnected,
  isGeneratingForecast
}: WeatherForecastControlsProps) {
  if (!(hasUploadedFile || isToastConnected) || isGeneratingForecast) {
    return null;
  }

  return (
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
        onClick={onGenerateForecast}
        size="lg"
        data-testid="button-generate-forecast"
        variant={showForecast ? "outline" : "default"}
      >
        {showForecast ? "Regenerate Forecast" : "Generate AI Forecast"}
      </Button>
    </div>
  );
}