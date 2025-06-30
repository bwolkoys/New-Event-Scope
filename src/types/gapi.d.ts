// Type definitions for Google API (gapi) and Google Identity Services
declare global {
  interface Window {
    gapi: {
      load: (
        libraries: string,
        callback: () => void
      ) => void;
      client: {
        init: (config: {
          apiKey: string;
          discoveryDocs: string[];
        }) => Promise<void>;
        setToken: (token: any) => void;
        calendar: {
          events: {
            insert: (params: {
              calendarId: string;
              resource: any;
            }) => Promise<{ result: { id?: string } }>;
            update: (params: {
              calendarId: string;
              eventId: string;
              resource: any;
            }) => Promise<{ result: any }>;
            delete: (params: {
              calendarId: string;
              eventId: string;
            }) => Promise<{ result: any }>;
            get: (params: {
              calendarId: string;
              eventId: string;
            }) => Promise<{ result: any }>;
          };
        };
      };
    };
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export {};