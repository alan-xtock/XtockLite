import StatsCard from '../StatsCard';

export default function StatsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <StatsCard
        title="Cost Reduction"
        value="10.2%"
        change={2.4}
        period="last month"
        description="Exceeding target of 10%"
      />
      <StatsCard
        title="Orders Sent"
        value="47"
        change={12.5}
        period="last week"
        description="Via WhatsApp integration"
      />
      <StatsCard
        title="Forecast Accuracy"
        value="94.3%"
        change={-1.2}
        period="last month"
        description="AI prediction confidence"
      />
      <StatsCard
        title="Supplier Response"
        value="2.3 hrs"
        change={-15.8}
        period="average"
        description="Response time improvement"
      />
    </div>
  );
}