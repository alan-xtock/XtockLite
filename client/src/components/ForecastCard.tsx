import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Brain, Calendar } from "lucide-react";

interface ForecastItem {
  item: string;
  predictedQuantity: number;
}

interface ForecastCardProps {
  date: string;
  items: ForecastItem[];
  weather?: string;
  onGenerateOrder?: () => void;
}

export default function ForecastCard({ 
  date, 
  items, 
  weather = "cloudy",
  onGenerateOrder 
}: ForecastCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AI Forecast</CardTitle>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {date}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
          <span className="text-sm font-medium">Weather Forecast</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-lg font-bold text-accent capitalize">{weather}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex-1">
                <div className="font-medium text-foreground">{item.item}</div>
                <div className="text-xs text-muted-foreground">
                  Predicted sales for tomorrow
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {item.predictedQuantity} units
                </span>
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={() => {
            console.log('Generate purchase order triggered');
            onGenerateOrder?.();
          }}
          className="w-full" 
          data-testid="button-generate-order"
        >
          Generate Purchase Order
        </Button>
      </CardContent>
    </Card>
  );
}