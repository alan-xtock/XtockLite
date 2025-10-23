import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import styles from "./ForecastReport.module.css";

// ===========================
// MODEL / DATA LAYER
// ===========================

interface SavingsData {
  baselineWaste: number;
  currentWaste: number;
  totalSaved: number;
  cumulativeSavings: number;
}

interface ChartDataPoint {
  week?: string;
  day?: string;
  savings?: number;
  accuracy?: number;
}

interface VarianceItem {
  name: string;
  variance: string;
}

interface ForecastBreakdownRow {
  item: string;
  forecasted: string;
  actual: string;
  variance: string;
  cost: string;
}

interface ForecastReportData {
  savingsData: SavingsData;
  cumulativeSavingsData: ChartDataPoint[];
  accuracyTrendData: ChartDataPoint[];
  overallAccuracy: number;
  biggestMisses: VarianceItem[];
  mostImproved: string[];
  forecastBreakdown: ForecastBreakdownRow[];
}

// Mock data - in a real app, this would come from an API or state management
const getForecastReportData = (): ForecastReportData => {
  return {
    savingsData: {
      baselineWaste: 750,
      currentWaste: 215,
      totalSaved: 535,
      cumulativeSavings: 8560,
    },
    cumulativeSavingsData: [
      { week: "Week 1", savings: 535 },
      { week: "Week 2", savings: 1420 },
      { week: "Week 3", savings: 2680 },
      { week: "Week 4", savings: 3890 },
      { week: "Week 5", savings: 5240 },
      { week: "Week 6", savings: 6780 },
      { week: "Week 7", savings: 7920 },
      { week: "Week 8", savings: 8560 },
    ],
    accuracyTrendData: [
      { day: "Day 1", accuracy: 72 },
      { day: "Day 5", accuracy: 75 },
      { day: "Day 10", accuracy: 78 },
      { day: "Day 15", accuracy: 82 },
      { day: "Day 20", accuracy: 85 },
      { day: "Day 25", accuracy: 87 },
      { day: "Day 30", accuracy: 88 },
    ],
    overallAccuracy: 88,
    biggestMisses: [
      { name: "Crispy Brussels Sprouts", variance: "5" },
      { name: "House Burger", variance: "5" },
      { name: "Spinach Artichoke Dip", variance: "2" },
    ],
    mostImproved: ["Fried Chicken Sandwich", "Braised Short Rib", "Fried Calamari"],
    forecastBreakdown: [
      { item: "Crispy Brussels Sprouts", forecasted: "35", actual: "40", variance: "5", cost: "$24" },
      { item: "Fried Calamari", forecasted: "28", actual: "28", variance: "0", cost: "$0" },
      { item: "Spinach Artichoke Dip", forecasted: "22", actual: "20", variance: "-2", cost: "$8" },
      { item: "House Burger", forecasted: "45", actual: "40", variance: "-5", cost: "$18" },
      { item: "Grilled Salmon", forecasted: "26", actual: "26", variance: "0", cost: "$0" },
      { item: "Ribeye Steak", forecasted: "18", actual: "20", variance: "2", cost: "$14" },
      { item: "Fried Chicken Sandwich", forecasted: "38", actual: "38", variance: "0", cost: "$0" },
      { item: "Braised Short Rib", forecasted: "24", actual: "23", variance: "-1", cost: "$7" },
      { item: "Penne alla Vodka", forecasted: "20", actual: "20", variance: "0", cost: "$0" },
      { item: "Chocolate Lava Cake", forecasted: "19", actual: "19", variance: "0", cost: "$0" },
    ],
  };
};

// ===========================
// VIEW COMPONENTS
// ===========================

interface SavingsCardProps {
  savingsData: SavingsData;
}

const SavingsCard = ({ savingsData }: SavingsCardProps) => (
  <Card className={styles.card}>
    <CardHeader className={styles.cardHeader}>
      <CardTitle className={styles.cardTitle}>This Period's Savings</CardTitle>
    </CardHeader>
    <CardContent className={styles.cardContent}>
      <div className={styles.savingsRow}>
        <span className={styles.savingsLabel}>Baseline Waste (Industry Avg)</span>
        <span className={styles.savingsValue}>${savingsData.baselineWaste.toFixed(2)}</span>
      </div>
      <div className={styles.savingsRow}>
        <span className={styles.savingsLabel}>Current Waste</span>
        <span className={styles.savingsValue}>${savingsData.currentWaste.toFixed(2)}</span>
      </div>
      <div className={styles.savingsTotalRow}>
        <span className={styles.savingsTotalLabel}>Total Saved This Period</span>
        <span className={styles.savingsTotalValue}>${savingsData.totalSaved.toFixed(2)}</span>
      </div>
    </CardContent>
  </Card>
);

interface CumulativeSavingsCardProps {
  cumulativeSavings: number;
}

const CumulativeSavingsCard = ({ cumulativeSavings }: CumulativeSavingsCardProps) => (
  <Card className={styles.card}>
    <CardHeader className={styles.cardHeader}>
      <CardTitle className={styles.cardTitle}>Total Cumulative Savings</CardTitle>
    </CardHeader>
    <CardContent className={styles.cardContent}>
      <div className={styles.cumulativeSavingsContent}>
        <p className={styles.cumulativeSavingsLabel}>Total Saved to Date</p>
        <p className={styles.cumulativeSavingsValue}>${cumulativeSavings.toFixed(2)}</p>
      </div>
    </CardContent>
  </Card>
);

interface CumulativeSavingsChartProps {
  data: ChartDataPoint[];
}

const CumulativeSavingsChart = ({ data }: CumulativeSavingsChartProps) => (
  <Card className={styles.card}>
    <CardHeader className={styles.cardHeader}>
      <CardTitle className={styles.cardTitle}>Cumulative Savings Over Time</CardTitle>
    </CardHeader>
    <CardContent className={styles.cardContent}>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
);

interface AccuracyMetricProps {
  accuracy: number;
}

const AccuracyMetric = ({ accuracy }: AccuracyMetricProps) => (
  <div className={styles.accuracyMetric}>
    <p className={styles.accuracyLabel}>Overall Accuracy:</p>
    <p className={styles.accuracyValue}>{accuracy}%</p>
  </div>
);

interface InsightCardProps {
  title: string;
  items: VarianceItem[] | string[];
}

const InsightCard = ({ title, items }: InsightCardProps) => (
  <Card className={styles.cardWithBackground}>
    <CardHeader className={styles.cardHeader}>
      <CardTitle className={styles.cardTitle}>{title}</CardTitle>
    </CardHeader>
    <CardContent className={styles.cardContent}>
      <ol className={styles.insightList}>
        {items.map((item, index) => (
          <li key={index} className={styles.insightItem}>
            {typeof item === "string"
              ? `${index + 1}. ${item}`
              : `${index + 1}. ${item.name}: ${item.variance} Variance`
            }
          </li>
        ))}
      </ol>
    </CardContent>
  </Card>
);

interface AccuracyTrendChartProps {
  data: ChartDataPoint[];
}

const AccuracyTrendChart = ({ data }: AccuracyTrendChartProps) => (
  <Card className={styles.cardWithBackground}>
    <CardHeader className={styles.cardHeader}>
      <CardTitle className={styles.cardTitle}>Accuracy Trend (Last 30 Days)</CardTitle>
    </CardHeader>
    <CardContent className={styles.cardContent}>
      <div className={styles.chartContainerLarge}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
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
);

interface ForecastBreakdownTableProps {
  data: ForecastBreakdownRow[];
}

const ForecastBreakdownTable = ({ data }: ForecastBreakdownTableProps) => (
  <Card className={styles.cardWithBackground}>
    <CardHeader className={styles.cardHeader}>
      <CardTitle className={styles.cardTitleLarge}>Detailed Forecast Breakdown</CardTitle>
    </CardHeader>
    <CardContent className={styles.cardContent}>
      {/* Control Bar */}
      <div className={styles.tableControls}>
        <Select defaultValue="7days">
          <SelectTrigger className={styles.tableControlSelect}>
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all">
          <SelectTrigger className={styles.tableControlSelect}>
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
          <SelectTrigger className={styles.tableControlSelect}>
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
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.tableHeader}>Item</th>
              <th className={styles.tableHeader}>Forecasted Usage</th>
              <th className={styles.tableHeader}>Actual Usage</th>
              <th className={styles.tableHeader}>Variance</th>
              <th className={styles.tableHeader}>Cost of Variance</th>
              <th className={styles.tableHeader}>Feedback</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {data.map((row, index) => (
              <tr key={index} className={styles.tableRow}>
                <td className={styles.tableCell}>{row.item}</td>
                <td className={styles.tableCell}>{row.forecasted}</td>
                <td className={styles.tableCell}>{row.actual}</td>
                <td className={styles.tableCell}>{row.variance}</td>
                <td className={styles.tableCell}>{row.cost}</td>
                <td className={styles.tableCell}>
                  <Button
                    variant="outline"
                    size="sm"
                    className={styles.addNoteButton}
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
);

// ===========================
// MAIN COMPONENT
// ===========================

const ForecastReport = () => {
  // Fetch data from model layer
  const reportData = getForecastReportData();

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Forecast & Savings Report</h1>
        </div>

        {/* Section 1: Executive ROI Summary */}
        <section className={styles.sectionWithBackground}>
          <h2 className={styles.sectionTitle}>Your Executive ROI Summary</h2>

          <div className={styles.twoColumnGrid}>
            {/* Column 1: Key Metric Cards */}
            <div className={styles.savingsCardsColumn}>
              <SavingsCard savingsData={reportData.savingsData} />
              <CumulativeSavingsCard cumulativeSavings={reportData.savingsData.cumulativeSavings} />
            </div>

            {/* Column 2: Cumulative Savings Graph */}
            <CumulativeSavingsChart data={reportData.cumulativeSavingsData} />
          </div>
        </section>

        {/* Section 2: Forecast Performance & Insights */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Forecast Performance & Insights</h2>

          {/* Key Metric */}
          <AccuracyMetric accuracy={reportData.overallAccuracy} />

          {/* Two-Column Insight Cards */}
          <div className={styles.twoColumnGrid}>
            <InsightCard title="Biggest Misses" items={reportData.biggestMisses} />
            <InsightCard title="Most Improved" items={reportData.mostImproved} />
          </div>

          {/* Full-Width Graph */}
          <AccuracyTrendChart data={reportData.accuracyTrendData} />
        </section>

        {/* Section 3: Detailed Forecast Breakdown */}
        <section className={styles.section}>
          <ForecastBreakdownTable data={reportData.forecastBreakdown} />
        </section>
      </div>
    </div>
  );
};

export default ForecastReport;
