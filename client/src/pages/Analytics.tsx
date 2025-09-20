import StatsCard from "@/components/StatsCard";
import DashboardCard from "@/components/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Target } from "lucide-react";

export default function Analytics() {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
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
        {/* Key Metrics */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Key Metrics</h2>
          <div className="grid grid-cols-2 gap-4">
            <DashboardCard
              title="Total Savings"
              value="$6,892"
              subtitle="This month"
              trend={12.3}
              variant="accent"
            />
            <DashboardCard
              title="Average Order"
              value="$156.80"
              subtitle="Per purchase order"
              trend={-3.2}
            />
          </div>
        </div>

        {/* Performance Stats */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Performance</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              title="Cost Reduction"
              value="10.2%"
              change={2.4}
              period="target: 10%"
              description="Goal exceeded!"
            />
            <StatsCard
              title="Forecast Accuracy"
              value="94.3%"
              change={1.8}
              period="last month"
              description="AI improvements"
            />
            <StatsCard
              title="Orders Processed"
              value="47"
              change={23.5}
              period="last month"
              description="Via WhatsApp"
            />
            <StatsCard
              title="Response Time"
              value="2.3 hrs"
              change={-18.2}
              period="average"
              description="Supplier response"
            />
          </div>
        </div>

        {/* Goals */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Goals Progress</h2>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-base">Monthly Targets</CardTitle>
              <Target className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Cost Reduction (10%)</span>
                  <span className="text-accent font-medium">10.2% ✓</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: '102%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Orders Sent (40)</span>
                  <span className="text-accent font-medium">47 ✓</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Forecast Accuracy (90%)</span>
                  <span className="text-accent font-medium">94.3% ✓</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}