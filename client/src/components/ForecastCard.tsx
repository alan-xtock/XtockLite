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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AI Forecast</CardTitle>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {date}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-accent/10 rounded-lg">
          <span className="text-sm font-medium">Weather Forecast</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-base font-bold text-accent capitalize">{weather}</span>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 border rounded-lg">
              <div className="font-medium text-foreground">{item.item}</div>
              <span className="text-base font-bold text-primary">
                {item.predictedQuantity} units
              </span>
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