import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const ForecastReport = () => {
  const [baselineSet, setBaselineSet] = useState(false);
  const [baselineAmount, setBaselineAmount] = useState("");

  const handleSetBaseline = () => {
    if (baselineAmount) {
      setBaselineSet(true);
    }
  };

  const handleUseIndustryAverage = () => {
    setBaselineAmount("750");
    setBaselineSet(true);
  };

  // Sample data for cumulative savings chart
  const cumulativeSavingsData = [
    { week: "Week 1", savings: 535 },
    { week: "Week 2", savings: 1420 },
    { week: "Week 3", savings: 2680 },
    { week: "Week 4", savings: 3890 },
    { week: "Week 5", savings: 5240 },
    { week: "Week 6", savings: 6780 },
    { week: "Week 7", savings: 7920 },
    { week: "Week 8", savings: 8560 },
  ];

  // Sample data for accuracy trend chart
  const accuracyTrendData = [
    { day: "Day 1", accuracy: 72 },
    { day: "Day 5", accuracy: 75 },
    { day: "Day 10", accuracy: 78 },
    { day: "Day 15", accuracy: 82 },
    { day: "Day 20", accuracy: 85 },
    { day: "Day 25", accuracy: 87 },
    { day: "Day 30", accuracy: 88 },
  ];

  const biggestMisses = [
    { name: "Avocados", variance: "$45" },
    { name: "Salmon", variance: "$32" },
    { name: "Sourdough", variance: "$21" },
  ];

  const mostImproved = [
    "Beef Patties",
    "Tomatoes",
    "Milk",
  ];

  const forecastBreakdown = [
    { item: "Avocados", forecasted: "50 lbs", actual: "55 lbs", variance: "-5 lbs", cost: "$25 (Stockout Risk)" },
    { item: "Salmon", forecasted: "20 lbs", actual: "18 lbs", variance: "+2 lbs", cost: "$30 (Waste)" },
    { item: "Beef Patties", forecasted: "100 lbs", actual: "101 lbs", variance: "-1 lb", cost: "$4 (Stockout Risk)" },
  ];

  if (!baselineSet) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center p-4 pb-20">
        <Card className="max-w-md w-full bg-light-grey border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-charcoal text-center">
              Let's calculate your savings!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-charcoal text-center">
              To show your ROI, we need a baseline. What was your estimated average weekly cost of food waste before using our forecasts?
            </p>
            <div className="space-y-2">
              <label className="text-sm text-charcoal font-medium">Weekly Waste Cost</label>
              <Input
                type="number"
                placeholder="$0.00"
                value={baselineAmount}
                onChange={(e) => setBaselineAmount(e.target.value)}
                className="text-charcoal"
              />
            </div>
            <Button 
              onClick={handleSetBaseline}
              className="w-full bg-growth-green hover:bg-growth-green/90 text-white"
            >
              Start Saving
            </Button>
            <button
              onClick={handleUseIndustryAverage}
              className="w-full text-charcoal text-sm hover:underline"
            >
              I'm not sure, use industry average.
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white pb-20">
      <div className="container mx-auto p-4 space-y-8">
        {/* Page Header */}
        <div className="pt-4">
          <h1 className="text-3xl font-bold text-charcoal">Forecast & Savings Report</h1>
        </div>

        {/* Section 1: Executive ROI Summary */}
        <section className="bg-light-grey rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-charcoal">Your Executive ROI Summary</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Column 1: Key Metric Cards */}
            <div className="space-y-4">
              <Card className="bg-white border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-charcoal">This Period's Savings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-charcoal">Baseline Waste</span>
                    <span className="font-semibold text-charcoal">$750.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal">Current Waste</span>
                    <span className="font-semibold text-charcoal">$215.00</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center">
                    <span className="text-charcoal font-medium">Total Saved This Period</span>
                    <span className="text-3xl font-bold text-growth-green">$535.00</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0">
                <CardHeader>
                  <CardTitle className="text-lg text-charcoal">Total Cumulative Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-charcoal mb-2">Total Saved to Date</p>
                    <p className="text-4xl font-bold text-growth-green">$8,560.00</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Column 2: Cumulative Savings Graph */}
            <Card className="bg-white border-0">
              <CardHeader>
                <CardTitle className="text-lg text-charcoal">Cumulative Savings Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={cumulativeSavingsData}>
                      <XAxis dataKey="week" stroke="#19191C" fontSize={12} />
                      <YAxis stroke="#19191C" fontSize={12} />
                      <Area
                        type="monotone"
                        dataKey="savings"
                        stroke="hsl(var(--growth-green))"
                        fill="hsl(var(--mint-accent))"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Section 2: Forecast Performance & Insights */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-charcoal">Forecast Performance & Insights</h2>
          
          {/* Key Metric */}
          <div className="text-center py-6">
            <p className="text-xl text-charcoal mb-2">Overall Accuracy:</p>
            <p className="text-5xl font-bold text-growth-green">88%</p>
          </div>

          {/* Two-Column Insight Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-light-grey border-0">
              <CardHeader>
                <CardTitle className="text-lg text-charcoal">Biggest Misses</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {biggestMisses.map((item, index) => (
                    <li key={index} className="text-charcoal">
                      {index + 1}. {item.name}: {item.variance} Variance
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-light-grey border-0">
              <CardHeader>
                <CardTitle className="text-lg text-charcoal">Most Improved</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {mostImproved.map((item, index) => (
                    <li key={index} className="text-charcoal">
                      {index + 1}. {item}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          {/* Full-Width Graph */}
          <Card className="bg-light-grey border-0">
            <CardHeader>
              <CardTitle className="text-lg text-charcoal">Accuracy Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={accuracyTrendData}>
                    <XAxis dataKey="day" stroke="#19191C" fontSize={12} />
                    <YAxis stroke="#19191C" fontSize={12} domain={[0, 100]} />
                    <Line
                      type="monotone"
                      dataKey="accuracy"
                      stroke="hsl(var(--growth-green))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--growth-green))", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Section 3: Detailed Forecast Breakdown */}
        <section>
          <Card className="bg-light-grey border-0">
            <CardHeader>
              <CardTitle className="text-2xl text-charcoal">Detailed Forecast Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Control Bar */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select defaultValue="7days">
                  <SelectTrigger className="bg-white text-charcoal">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="bg-white text-charcoal">
                    <SelectValue placeholder="Filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="produce">Produce</SelectItem>
                    <SelectItem value="protein">Protein</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="variance">
                  <SelectTrigger className="bg-white text-charcoal">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="variance">Highest Cost Variance</SelectItem>
                    <SelectItem value="accuracy">Highest Accuracy</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-charcoal font-semibold">Item</th>
                      <th className="px-4 py-3 text-left text-charcoal font-semibold">Forecasted Usage</th>
                      <th className="px-4 py-3 text-left text-charcoal font-semibold">Actual Usage</th>
                      <th className="px-4 py-3 text-left text-charcoal font-semibold">Variance</th>
                      <th className="px-4 py-3 text-left text-charcoal font-semibold">Cost of Variance</th>
                      <th className="px-4 py-3 text-left text-charcoal font-semibold">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {forecastBreakdown.map((row, index) => (
                      <tr key={index} className="border-t border-gray-200">
                        <td className="px-4 py-3 text-charcoal">{row.item}</td>
                        <td className="px-4 py-3 text-charcoal">{row.forecasted}</td>
                        <td className="px-4 py-3 text-charcoal">{row.actual}</td>
                        <td className="px-4 py-3 text-charcoal">{row.variance}</td>
                        <td className="px-4 py-3 text-charcoal">{row.cost}</td>
                        <td className="px-4 py-3">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-white border-charcoal text-charcoal hover:bg-light-grey"
                          >
                            Add Note
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ForecastReport;
