import twilio from 'twilio';

export function createTwilioService() {
  
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const contentSid = process.env.TWILIO_CONTENT_SID;

  console.log("accountSid", accountSid)
  console.log("authToken", authToken)
  console.log("fromNumber", fromNumber)
  if (!accountSid || !authToken || !fromNumber) {
    console.warn('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER environment variables.');
    return null;
  }

  const client = twilio(accountSid, authToken);

  const sendMessage = async (to: string, body: string) => {
    try {
      const message = await client.messages
        .create({
          body,
          from: fromNumber,
          contentSid,
          contentVariables: '{"1":"12/1","2":"3pm"}',
          to
        });

      console.log(`Twilio message sent: ${message.sid}`);
      return { success: true, messageSid: message.sid };
    } catch (error) {
      console.error('Twilio message error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const sendWhatsAppMessage = async (to: string, body: string, contentSid?: string, contentVariables?: string) => {
    try {
      contentSid = process.env.TWILIO_CONTENT_SID;
      contentVariables = '{"1":"12/1","2":"3pm"}';
      const messageOptions: any = {
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${to}`
      };

      if (contentSid) {
        messageOptions.contentSid = contentSid;
        if (contentVariables) {
          messageOptions.contentVariables = contentVariables;
        }
      } else {
        messageOptions.body = body;
      }

      const message = await client.messages
        .create(messageOptions)
        .then((message: any) => {
          console.log(`WhatsApp message sent: ${message.sid}`);
          return message;
        });

      return { success: true, messageSid: message.sid };
    } catch (error) {
      console.error('WhatsApp message error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const sendFreeFormMessage = async (to: string, body: string) => {
    try {
      const message = await client.messages
        .create({
          body,
          from: `whatsapp:${fromNumber}`,
          to: `whatsapp:${to}`
        });

      console.log(`Free-form WhatsApp message sent: ${message.sid}`);
      return { success: true, messageSid: message.sid };
    } catch (error) {
      console.error('Free-form WhatsApp message error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  return {
    sendMessage,
    sendWhatsAppMessage,
    sendFreeFormMessage
  };
}