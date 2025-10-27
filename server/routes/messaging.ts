import type { Express } from "express";
import { createTwilioService } from "../twilio-service";
import { z } from "zod";

const sendMessageSchema = z.object({
  to: z.string().optional(),
  message: z.string().min(1, "Message is required")
});

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

      const { From, Body, MessageSid } = req.body;

      if (From && Body) {
        console.log(`Received message from ${From}: ${Body}`);

        if (!twilioService) {
          console.error('Twilio service not configured for webhook response');
          return res.status(200).send('OK'); // Still respond OK to Twilio
        }

        const dayDemand = "busy";
        const predictedSales = "$5,200";
        const predictedPercentage = "23% higher";
        const dummyInfo = `📈 We're forecasting a ${dayDemand} day with predicted sales of ~${predictedSales}, *${predictedPercentage}* than normal.\n📦 *Based on this, here are the items you'll likely sell:*`;

        // List of predicted items with units
        const predictedItems = [
          { name: "Ribeye Steak", units: 32 },
          { name: "Fried Calamari", units: 34 },
          { name: "Crispy Brussels Sprouts", units: 29 }
        ];

        // Format items into monospace block
        const itemsText = predictedItems
          .map(item => `${item.name}: ${item.units} units`)
          .join('\n');
        const dummyInfo2 = `\`\`\`${itemsText}\`\`\``;

        // Send a free-form follow-up message
        const dummyMessage = `${dummyInfo}\n\n${dummyInfo2}`;

        // Extract phone number (remove whatsapp: prefix if present)
        const phoneNumber = From.replace('whatsapp:', '');

        const result = await twilioService.sendFreeFormMessage(phoneNumber, dummyMessage);

        if (result.success) {
          console.log('Follow-up message sent successfully');
        } else {
          console.error('Failed to send follow-up message:', result.error);
        }
      }

      // Always respond with 200 OK to Twilio
      res.status(200).send('OK');

    } catch (error) {
      console.error('Webhook error:', error);
      // Still respond OK to prevent Twilio from retrying
      res.status(200).send('OK');
    }
  });
}