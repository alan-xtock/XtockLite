import DashboardCard from "@/components/DashboardCard";

interface DashboardStatsProps {
  salesData?: any;
  uploadResult?: any;
  hasUploadedFile: boolean;
  isToastConnected: boolean;
}

export function DashboardOverview({ salesData, hasUploadedFile, isToastConnected }: DashboardStatsProps) {
  if (!(hasUploadedFile || isToastConnected) || !salesData) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <DashboardCard
        title="Items Tracked"
        value={Array.isArray(salesData) ? salesData.length.toString() : '0'}
        subtitle="Sales records uploaded"
        trend={0}
        variant="accent"
      />
      <DashboardCard
        title="Ready for AI"
        value="✓"
        subtitle="Data processed successfully"
        trend={0}
      />
    </div>
  );
}

export function DataImportSummary({ uploadResult, hasUploadedFile, isToastConnected, salesData }: DashboardStatsProps) {
  if (!(hasUploadedFile || isToastConnected) || !uploadResult) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 text-foreground">
        {uploadResult.toastDataUsed ? "Toast Connection Summary" : "Data Upload Summary"}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <DashboardCard
          title="Records Processed"
          value={uploadResult.validRows?.toString() || "0"}
          subtitle={uploadResult.toastDataUsed ? "items from Toast POS" : `from ${uploadResult.totalRows || 0} total rows`}
          trend={uploadResult.errors?.length > 0 ? -((uploadResult.errors.length / uploadResult.totalRows) * 100) : 5}
        />
        <DashboardCard
          title="Data Quality"
          value={uploadResult.toastDataUsed ? "100%" : `${Math.round(((uploadResult.validRows || 0) / (uploadResult.totalRows || 1)) * 100)}%`}
          subtitle={uploadResult.toastDataUsed ? "Toast integration success" : "validation success rate"}
          trend={5}
          variant="accent"
        />
      </div>
    </div>
  );
}