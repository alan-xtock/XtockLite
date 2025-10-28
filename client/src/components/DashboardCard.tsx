import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign } from "lucide-react";
import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: string | ReactNode;
  subtitle?: string;
  trend?: number;
  variant?: "default" | "accent";
}

export default function DashboardCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  variant = "default" 
}: DashboardCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <DollarSign className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3 text-accent" />
            <Badge 
              variant={variant === "accent" ? "default" : "secondary"}
              className={variant === "accent" ? "bg-accent text-accent-foreground" : ""}
            >
              {trend > 0 ? "+" : ""}{trend}%
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}