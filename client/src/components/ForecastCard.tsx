import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Brain, Calendar, Send } from "lucide-react";
import { useMessaging } from "@/hooks/useMessaging";
import { useToast } from "@/hooks/use-toast";

interface ForecastItem {
  item: string;
  predictedQuantity: number;
}

interface ForecastCardProps {
  date: string;
  items: ForecastItem[];
  weather?: string;
}

export default function ForecastCard({
  date,
  items,
  weather = "cloudy"
}: ForecastCardProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { sendMessage } = useMessaging();
  const { toast } = useToast();
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AI Forecast</CardTitle>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {date}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-accent/10 rounded-lg">
          <span className="text-sm font-medium">Weather Forecast</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="text-base font-bold text-accent capitalize">{weather}</span>
          </div>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 border rounded-lg">
              <div className="font-medium text-foreground">{item.item}</div>
              <span className="text-base font-bold text-primary">
                {item.predictedQuantity} units
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-3 pt-2">
          <div className="space-y-2">
            <label htmlFor="phone-number" className="text-sm font-medium text-foreground">
              WhatsApp Number
            </label>
            <Input
              id="phone-number"
              type="tel"
              placeholder="+1234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full"
              data-testid="input-whatsapp-number"
            />
          </div>
          <Button
            onClick={async () => {
              if (!phoneNumber.trim()) {
                toast({
                  title: "Phone number required",
                  description: "Please enter a WhatsApp phone number",
                  variant: "destructive",
                });
                return;
              }

              setIsSending(true);
              try {
                // Format the forecast items into a message
                const itemsList = items
                  .map(item => `• ${item.item}: ${item.predictedQuantity} units`)
                  .join('\n');
                const message = `Tomorrow's Forecast (${date}):\n\n${itemsList}`;

                const success = await sendMessage({
                  to: phoneNumber,
                  message
                });

                if (success) {
                  toast({
                    title: "Message sent!",
                    description: "WhatsApp message sent successfully",
                  });
                  setPhoneNumber('');
                } else {
                  toast({
                    title: "Failed to send",
                    description: "Please try again later",
                    variant: "destructive",
                  });
                }
              } finally {
                setIsSending(false);
              }
            }}
            className="w-full"
            disabled={isSending || !phoneNumber.trim()}
            data-testid="button-send-whatsapp"
          >
            <Send className="h-4 w-4 mr-2" />
            {isSending ? 'Sending...' : 'Send WhatsApp Message'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}