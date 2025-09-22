import StatsCard from "@/components/StatsCard";
import DashboardCard from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Analytics() {
  // Fetch real analytics data from backend
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/analytics']
  });

  const { data: salesData } = useQuery({
    queryKey: ['/api/sales-data']
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-analytics-title">Analytics</h1>
            <p className="text-sm text-muted-foreground">Performance insights</p>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Last 30 days
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="p-4 space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : !salesData || (Array.isArray(salesData) && salesData.length === 0) ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">No Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Upload your sales data to start seeing analytics and insights.
            </p>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-foreground">Key Metrics</h2>
              <div className="grid grid-cols-2 gap-4">
                <DashboardCard
                  title="Data Points"
                  value={Array.isArray(salesData) ? salesData.length.toString() : '0'}
                  subtitle="Sales records"
                  trend={0}
                  variant="accent"
                />
                <DashboardCard
                  title="AI Ready"
                  value="✓"
                  subtitle="System active"
                  trend={0}
                />
              </div>
            </div>

            {/* Performance Stats */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-foreground">Performance</h2>
              <div className="grid grid-cols-2 gap-4">
                <StatsCard
                  title="Cost Reduction"
                  value="Ready"
                  change={0}
                  period="target: 10%"
                  description="Upload data to start"
                />
                <StatsCard
                  title="Forecast Accuracy"
                  value="Ready"
                  change={0}
                  period="after forecasts"
                  description="Generate predictions"
                />
                <StatsCard
                  title="Orders Processed"
                  value="0"
                  change={0}
                  period="this month"
                  description="Via WhatsApp"
                />
                <StatsCard
                  title="System Status"
                  value="Active"
                  change={0}
                  period="ready to use"
                  description="All systems operational"
                />
              </div>
            </div>

            {/* Progress Indicators */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-foreground">Getting Started</h2>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-accent" />
                    Setup Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Sales Data Uploaded</span>
                    <span className="text-sm text-accent font-medium">✓ Complete</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}