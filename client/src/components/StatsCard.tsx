import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  period: string;
  description?: string;
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  period, 
  description 
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (change > 0) return <TrendingUp className="h-3 w-3" />;
    if (change < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (change > 0) return "text-accent";
    if (change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const getBadgeVariant = () => {
    if (change > 0) return "default";
    if (change < 0) return "destructive";
    return "secondary";
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold text-foreground">
          {value}
        </div>
        
        <div className="flex items-center justify-between">
          <Badge 
            variant={getBadgeVariant()}
            className={`flex items-center gap-1 ${
              change > 0 ? "bg-accent text-accent-foreground" : ""
            }`}
          >
            {getTrendIcon()}
            {change > 0 ? "+" : ""}{change}%
          </Badge>
          <span className="text-xs text-muted-foreground">
            vs {period}
          </span>
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}