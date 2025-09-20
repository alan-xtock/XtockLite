import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, MessageCircle, Bell, Download } from "lucide-react";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">App configuration</p>
          </div>
          <SettingsIcon className="h-6 w-6 text-muted-foreground" />
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-4 space-y-6">
        {/* Integrations */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Integrations</h2>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-accent" />
                <div>
                  <CardTitle className="text-base">WhatsApp</CardTitle>
                  <p className="text-sm text-muted-foreground">Send orders via WhatsApp</p>
                </div>
              </div>
              <Badge variant="default" className="bg-accent text-accent-foreground">
                Connected
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm">Enable WhatsApp orders</span>
              <Switch 
                checked={whatsappEnabled}
                onCheckedChange={setWhatsappEnabled}
                data-testid="switch-whatsapp"
              />
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Notifications</h2>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle className="text-base">Push Notifications</CardTitle>
                  <p className="text-sm text-muted-foreground">Get alerts for orders and forecasts</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm">Enable notifications</span>
              <Switch 
                checked={notifications}
                onCheckedChange={setNotifications}
                data-testid="switch-notifications"
              />
            </CardContent>
          </Card>
        </div>

        {/* Data Management */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">Data</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Export Data</CardTitle>
              <p className="text-sm text-muted-foreground">
                Download your sales data and analytics
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-export-sales"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Sales Data (CSV)
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                data-testid="button-export-orders"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Order History
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* About */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-foreground">About</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">AI Engine</span>
                <span className="text-sm font-medium">GPT-4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <span className="text-sm font-medium">Today</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}