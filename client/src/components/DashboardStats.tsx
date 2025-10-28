import { useEffect, useState } from "react";
import DashboardCard from "@/components/DashboardCard";

interface DashboardStatsProps {
  salesData?: any;
  uploadResult?: any;
  hasUploadedFile: boolean;
  isToastConnected: boolean;
  loadingProgress?: number;
}

function AnimatedNumber({ targetValue, loadingProgress }: { targetValue: number; loadingProgress: number }) {
  const [currentValue, setCurrentValue] = useState(0);
  const isLoading = loadingProgress > 0 && loadingProgress < 4;

  useEffect(() => {
    if (loadingProgress >= 4) {
      // Animate from current to target
      const duration = 800; // ms
      const steps = 30;
      const increment = (targetValue - currentValue) / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        if (step >= steps) {
          setCurrentValue(targetValue);
          clearInterval(timer);
        } else {
          setCurrentValue(prev => Math.min(targetValue, Math.round(prev + increment)));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }
  }, [loadingProgress, targetValue]);

  const color = isLoading ? "text-red-500" : "text-foreground";

  return <span className={color}>{currentValue}</span>;
}

export function DashboardOverview({ salesData, hasUploadedFile, isToastConnected, loadingProgress = 0 }: DashboardStatsProps) {
  if (!(hasUploadedFile || isToastConnected) || !salesData) {
    return null;
  }

  const itemsCount = Array.isArray(salesData) ? salesData.length : 0;

  return (
    <div className="grid grid-cols-2 gap-4">
      <DashboardCard
        title="Items Tracked"
        value={<AnimatedNumber targetValue={itemsCount} loadingProgress={loadingProgress} />}
        subtitle="Sales records uploaded"
        trend={0}
        variant="accent"
      />
      <DashboardCard
        title="Ready for AI"
        value={loadingProgress >= 4 ? "✓" : <span className="text-red-500">...</span>}
        subtitle="Data processed successfully"
        trend={0}
      />
    </div>
  );
}

export function DataImportSummary({ uploadResult, hasUploadedFile, isToastConnected, salesData, loadingProgress = 0 }: DashboardStatsProps) {
  if (!(hasUploadedFile || isToastConnected) || !uploadResult) {
    return null;
  }

  const recordsCount = uploadResult.validRows || 0;
  const qualityPercent = uploadResult.toastDataUsed ? 100 : Math.round(((uploadResult.validRows || 0) / (uploadResult.totalRows || 1)) * 100);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-foreground">
        {uploadResult.toastDataUsed ? "Toast Connection Summary" : "Data Upload Summary"}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <DashboardCard
          title="Records Processed"
          value={<AnimatedNumber targetValue={recordsCount} loadingProgress={loadingProgress} />}
          subtitle={uploadResult.toastDataUsed ? "items from Toast POS" : `from ${uploadResult.totalRows || 0} total rows`}
          trend={uploadResult.errors?.length > 0 ? -((uploadResult.errors.length / uploadResult.totalRows) * 100) : 5}
        />
        <DashboardCard
          title="Data Quality"
          value={
            <>
              <AnimatedNumber targetValue={qualityPercent} loadingProgress={loadingProgress} />
              <span className={loadingProgress >= 4 ? "text-foreground" : "text-red-500"}>%</span>
            </>
          }
          subtitle={uploadResult.toastDataUsed ? "Toast integration success" : "validation success rate"}
          trend={5}
          variant="accent"
        />
      </div>
    </div>
  );
}