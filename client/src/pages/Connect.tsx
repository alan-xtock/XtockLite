import { useEffect } from "react";
import DataSourceTabs from "@/components/DataSourceTabs";
import { useDashboardContext } from "@/contexts/DashboardContext";

interface ConnectProps {
  onConnected?: () => void;
}

export default function Connect({ onConnected }: ConnectProps) {
  const {
    activeTab,
    toastApiKey,
    isConnectingToast,
    setActiveTab,
    setToastApiKey,
    handleUploadStart,
    handleFileUpload,
    handleConnectToast
  } = useDashboardContext();

  // Redirect to Dashboard when connection/upload starts
  useEffect(() => {
    if (isConnectingToast) {
      onConnected?.();
    }
  }, [isConnectingToast, onConnected]);

  // Wrap handlers to redirect immediately
  const handleFileUploadWithRedirect = (result: any) => {
    handleFileUpload(result);
    onConnected?.();
  };

  const handleConnectToastWithRedirect = async () => {
    // The redirect will happen via useEffect when isConnectingToast becomes true
    await handleConnectToast();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Main Content */}
      <div className="p-4 space-y-6">

        {/* Welcome Section */}
        <div className="text-center py-8 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-foreground">
              Connect Your Data Source
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Connect to Toast POS or upload a CSV file to start reducing produce costs with AI-powered forecasting.
            </p>
          </div>
        </div>

        {/* Data Source Selection Tabs */}
        <DataSourceTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          toastApiKey={toastApiKey}
          setToastApiKey={setToastApiKey}
          isConnectingToast={isConnectingToast}
          onFileUpload={handleFileUploadWithRedirect}
          onUploadStart={handleUploadStart}
          onConnectToast={handleConnectToastWithRedirect}
        />
      </div>
    </div>
  );
}
