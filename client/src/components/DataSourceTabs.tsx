import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, Upload } from "lucide-react";
import UploadArea from "@/components/UploadArea";

interface DataSourceTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  toastApiKey: string;
  setToastApiKey: (key: string) => void;
  isConnectingToast: boolean;
  onFileUpload: (result: any) => void;
  onUploadStart: () => void;
  onConnectToast: () => void;
}

export default function DataSourceTabs({
  activeTab,
  setActiveTab,
  toastApiKey,
  setToastApiKey,
  isConnectingToast,
  onFileUpload,
  onUploadStart,
  onConnectToast
}: DataSourceTabsProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="toast" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Toast POS
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            CSV Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="toast" className="mt-6">
          <div data-testid="toast-connection-section" className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                Connect to Toast POS
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter your Toast API key to import sales data and generate forecasts automatically.
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-4">
              <div className="space-y-2">
                <Label htmlFor="toast-api-key">Toast API Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="toast-api-key"
                    type="password"
                    placeholder="Enter your Toast API key"
                    value={toastApiKey}
                    onChange={(e) => setToastApiKey(e.target.value)}
                    className="pl-10"
                    disabled={isConnectingToast}
                  />
                </div>
              </div>
              <Button
                onClick={onConnectToast}
                disabled={isConnectingToast || !toastApiKey.trim()}
                className="w-full"
                data-testid="button-connect-toast"
              >
                {isConnectingToast ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting to Toast...
                  </>
                ) : (
                  "Connect to Toast"
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="csv" className="mt-6">
          <div data-testid="upload-section" className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold text-foreground">
                Upload Your Sales Data
              </h2>
              <p className="text-sm text-muted-foreground">
                Upload a CSV file with your sales history. Include columns for date, item, quantity, unit, and price.
              </p>
            </div>
            <UploadArea
              onFileUpload={onFileUpload}
              onUploadStart={onUploadStart}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}