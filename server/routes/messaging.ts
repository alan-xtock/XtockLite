import type { Express } from "express";
import { createTwilioService } from "../twilio-service";
import { storage } from "../storage";
import type { Forecast } from "@shared/schema";
import { z } from "zod";

const sendMessageSchema = z.object({
  to: z.string().optional(),
  message: z.string().min(1, "Message is required")
});

// Helper function to format forecasts into WhatsApp message
function formatForecastMessage(forecasts: Forecast[]): string {
  // Calculate summary statistics
  const totalUnits = forecasts.reduce((sum, f) => sum + f.predictedQuantity, 0);
  const estimatedSales = totalUnits * 10; // $10 per unit estimate
  const predictedSales = `$${estimatedSales.toLocaleString()}`;

  // Determine day demand based on total units
  const dayDemand = totalUnits > 200 ? "busy" : totalUnits > 100 ? "moderate" : "slow";
  const predictedPercentage = "23% higher"; // TODO: Calculate from historical data

  // Build header
  const header = `📈 We're forecasting a ${dayDemand} day with predicted sales of ~${predictedSales}, *${predictedPercentage}* than normal.\n📦 *Based on this, here are the items you'll likely sell:*`;

  // Format forecast items
  const itemsText = forecasts
    .map(forecast => `${forecast.item}: ${forecast.predictedQuantity} units`)
    .join('\n');
  const formattedItems = `\`\`\`${itemsText}\`\`\``;

  return `${header}\n\n${formattedItems}`;
}

export function registerMessagingRoutes(app: Express) {
  const twilioService = createTwilioService();

  app.post('/api/messaging/send', async (req, res) => {
    try {
      if (!twilioService) {
        return res.status(500).json({
          error: 'Twilio service not configured',
          message: 'Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER environment variables'
        });
      }

      const validatedData = sendMessageSchema.parse(req.body);

      // Use default phone number from environment if not provided
      const toNumber = validatedData.to || process.env.TWILIO_TO_NUMBER || '+1234567890';

      const result = await twilioService.sendWhatsAppMessage(toNumber, validatedData.message);

      if (result.success) {
        res.json({
          success: true,
          messageSid: result.messageSid,
          message: 'Message sent successfully'
        });
      } else {
        res.status(500).json({
          error: 'Failed to send message',
          message: result.error
        });
      }

    } catch (error) {
      console.error('Messaging API error:', error);

      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }

      res.status(500).json({
        error: 'Failed to send message',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Webhook endpoint for incoming WhatsApp messages
  app.post('/api/messaging/webhook', async (req, res) => {
    try {
      console.log('Received WhatsApp webhook:', req.body);

      const { From, Body } = req.body;

      // Validate incoming message
      if (!From || !Body) {
        console.log('Invalid webhook payload - missing From or Body');
        return res.status(200).send('OK');
      }

      console.log(`Received message from ${From}: ${Body}`);

      // Check Twilio service availability
      if (!twilioService) {
        console.error('Twilio service not configured for webhook response');
        return res.status(200).send('OK');
      }

      // Retrieve latest forecasts from database
      const forecasts = await storage.getForecasts(10);

      if (forecasts.length === 0) {
        console.log('No forecasts available to send');
        return res.status(200).send('OK');
      }

      // Format the forecast message
      const forecastMessage = formatForecastMessage(forecasts);

      // Send WhatsApp message with forecast data
      const phoneNumber = From.replace('whatsapp:', '');
      const result = await twilioService.sendFreeFormMessage(phoneNumber, forecastMessage);

      if (result.success) {
        console.log('Follow-up message sent successfully');
      } else {
        console.error('Failed to send follow-up message:', result.error);
      }

      res.status(200).send('OK');

    } catch (error) {
      console.error('Webhook error:', error);
      // Always respond OK to prevent Twilio from retrying
      res.status(200).send('OK');
    }
  });
}