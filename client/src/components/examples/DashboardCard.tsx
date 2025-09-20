import DashboardCard from '../DashboardCard';

export default function DashboardCardExample() {
  return (
    <div className="space-y-4 p-4">
      <DashboardCard
        title="Daily Savings"
        value="$247.50"
        subtitle="10.2% cost reduction"
        trend={10.2}
        variant="accent"
      />
      <DashboardCard
        title="Monthly Total"
        value="$6,892.40"
        subtitle="vs $7,650 last month"
        trend={-9.9}
      />
    </div>
  );
}