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
}