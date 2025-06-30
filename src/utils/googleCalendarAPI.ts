/// <reference path="../types/gapi.d.ts" />
import { EventData } from '../App';

export interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: string;
  attendees?: Array<{ email: string }>;
}

export interface GoogleCalendarConfig {
  apiKey: string;
  clientId: string;
  discoveryDoc: string;
  scopes: string;
}

class GoogleCalendarService {
  private gapi: any = null;
  private isSignedIn: boolean = false;
  private config: GoogleCalendarConfig;

  constructor() {
    this.config = {
      apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID || '',
      discoveryDoc: 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
      scopes: 'https://www.googleapis.com/auth/calendar'
    };
  }

  // Check if Google Calendar is properly configured
  private isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.clientId);
  }

  // Load Google API and initialize with new Google Identity Services
  async loadGapi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google API can only be loaded in browser environment'));
        return;
      }

      // If gapi is already loaded, resolve immediately
      if (window.gapi && this.gapi) {
        resolve();
        return;
      }

      // Load both the Google API script and Google Identity Services
      let scriptsLoaded = 0;
      const totalScripts = 2;
      
      const checkAllLoaded = () => {
        scriptsLoaded++;
        if (scriptsLoaded === totalScripts) {
          initializeGapi();
        }
      };

      // Load Google API script
      const apiScript = document.createElement('script');
      apiScript.src = 'https://apis.google.com/js/api.js';
      apiScript.onload = checkAllLoaded;
      apiScript.onerror = () => reject(new Error('Failed to load Google API script'));
      document.head.appendChild(apiScript);

      // Load Google Identity Services script
      const gisScript = document.createElement('script');
      gisScript.src = 'https://accounts.google.com/gsi/client';
      gisScript.onload = checkAllLoaded;
      gisScript.onerror = () => reject(new Error('Failed to load Google Identity Services script'));
      document.head.appendChild(gisScript);

      const initializeGapi = async () => {
        try {
          await window.gapi.load('client', async () => {
            try {
              await window.gapi.client.init({
                apiKey: this.config.apiKey,
                discoveryDocs: [this.config.discoveryDoc]
              });
              
              this.gapi = window.gapi;
              resolve();
            } catch (error) {
              reject(error);
            }
          });
        } catch (error) {
          reject(error);
        }
      };
    });
  }

  // Sign in to Google using new Google Identity Services
  async signIn(): Promise<void> {
    if (!this.gapi) {
      await this.loadGapi();
    }

    if (!this.isSignedIn) {
      return new Promise((resolve, reject) => {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: this.config.clientId,
          scope: this.config.scopes,
          callback: (response: any) => {
            if (response.error) {
              reject(new Error(response.error));
            } else {
              this.isSignedIn = true;
              this.gapi.client.setToken(response);
              resolve();
            }
          }
        });
        
        tokenClient.requestAccessToken();
      });
    }
  }

  // Check if user is signed in
  async isUserSignedIn(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    if (!this.gapi) {
      try {
        await this.loadGapi();
      } catch (error) {
        console.error('Google API initialization failed:', error);
        console.error('API Key configured:', !!this.config.apiKey);
        console.error('Client ID configured:', !!this.config.clientId);
        console.error('Current origin:', window.location.origin);
        return false;
      }
    }
    
    return this.isSignedIn;
  }

  // Convert EventData to Google Calendar format
  private convertToGoogleCalendarEvent(event: EventData): GoogleCalendarEvent {
    const startDateTime = new Date(`${event.startDate}T${event.startTime}`);
    const endDateTime = new Date(`${event.endDate}T${event.endTime}`);

    return {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: event.timezone
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: event.timezone
      },
      location: event.location,
      attendees: event.guests.map(email => ({ email }))
    };
  }

  // Create event in Google Calendar
  async createEvent(event: EventData): Promise<string | null> {
    try {
      if (!this.isConfigured()) {
        console.log('Google Calendar not configured - skipping sync');
        return null;
      }

      if (!await this.isUserSignedIn()) {
        await this.signIn();
      }

      const googleEvent = this.convertToGoogleCalendarEvent(event);
      
      const response = await this.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: googleEvent
      });

      return response.result.id || null;
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      return null;
    }
  }

  // Update event in Google Calendar
  async updateEvent(event: EventData, googleEventId: string): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        console.log('Google Calendar not configured - skipping sync');
        return false;
      }

      if (!await this.isUserSignedIn()) {
        await this.signIn();
      }

      const googleEvent = this.convertToGoogleCalendarEvent(event);
      
      await this.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        resource: googleEvent
      });

      return true;
    } catch (error) {
      console.error('Failed to update Google Calendar event:', error);
      return false;
    }
  }

  // Delete event from Google Calendar
  async deleteEvent(googleEventId: string): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        console.log('Google Calendar not configured - skipping sync');
        return false;
      }

      if (!await this.isUserSignedIn()) {
        await this.signIn();
      }

      await this.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId
      });

      return true;
    } catch (error) {
      console.error('Failed to delete Google Calendar event:', error);
      return false;
    }
  }

  // Get event from Google Calendar
  async getEvent(googleEventId: string): Promise<GoogleCalendarEvent | null> {
    try {
      if (!await this.isUserSignedIn()) {
        await this.signIn();
      }

      const response = await this.gapi.client.calendar.events.get({
        calendarId: 'primary',
        eventId: googleEventId
      });

      return response.result;
    } catch (error) {
      console.error('Failed to get Google Calendar event:', error);
      return null;
    }
  }
}

// Create singleton instance
export const googleCalendarService = new GoogleCalendarService();

// Helper function to show user a message about Google Calendar integration
export const showGoogleCalendarMessage = (action: 'updated' | 'deleted', success: boolean) => {
  const actionText = action === 'updated' ? 'update' : 'deletion';
  const message = success 
    ? `Event ${actionText} synced with Google Calendar successfully!`
    : `Event ${actionText}d locally, but failed to sync with Google Calendar. Please check your connection and try again.`;
  
  // You can customize this notification method based on your app's notification system
  if (success) {
    console.log('✅', message);
  } else {
    console.warn('⚠️', message);
  }
  
  // Optional: Show a toast notification or modal
  // For now, we'll just log to console, but you can integrate with your notification system
};