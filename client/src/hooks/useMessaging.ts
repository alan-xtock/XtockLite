import { useState } from 'react';

interface SendMessageParams {
  to: string;
  message: string;
}

interface UseMessagingReturn {
  isApproving: boolean;
  handleApprove: () => Promise<void>;
  sendMessage: (params: SendMessageParams) => Promise<boolean>;
}

export function useMessaging(): UseMessagingReturn {
  const [isApproving, setIsApproving] = useState(false);

  const sendMessage = async ({ to, message }: SendMessageParams): Promise<boolean> => {
    try {
      const response = await fetch('/api/messaging/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to, message }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Message sent successfully:', result.messageSid);
        return true;
      } else {
        console.error('Failed to send message:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  const handleApprove = async () => {
    console.log("Approving now");
    if (isApproving) return;

    setIsApproving(true);

    try {
      await sendMessage({
        to: '', // Server will use default phone number from env
        message: 'Order approved! Tomorrow\'s order:\n• Tomatoes: 15 lbs\n• Lettuce: 8 heads\n• Onions: 12 lbs'
      });
    } finally {
      setIsApproving(false);
    }
  };

  return {
    isApproving,
    handleApprove,
    sendMessage
  };
}