const API_BASE_URL = process.env.REACT_APP_EMAIL_API_URL || 'http://localhost:3001';

export interface EmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  messageId?: string;
}

export interface EventEmailData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
}

export const emailService = {
  async sendEventInvitation(
    eventData: EventEmailData,
    guests: string[],
    organizer?: string
  ): Promise<EmailResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/send-event-invitation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventData,
          guests,
          organizer,
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      return result;
    } catch (error) {
      console.error('Email service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async sendTestEmail(to: string): Promise<EmailResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/email/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ to }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send test email');
      }

      return result;
    } catch (error) {
      console.error('Test email service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  async checkServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
      });
      
      return response.ok;
    } catch (error) {
      console.error('Email server health check failed:', error);
      return false;
    }
  },
};