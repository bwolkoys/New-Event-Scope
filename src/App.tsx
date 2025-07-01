import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EventsList from './components/EventsList';
import DeletedEvents from './components/DeletedEvents';
import EventDetail from './components/EventDetail';
import EventEdit from './components/EventEdit';
import { googleCalendarService, showGoogleCalendarMessage } from './utils/googleCalendarAPI';
import { emailService } from './services/emailService';

export interface EventData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  location: string;
  team: string;
  guests: string[];
  rsvpRequired: boolean;
  notifications: {
    email: boolean;
  };
  privacy: 'team-only' | 'public';
  createdAt: string;
  deletedAt?: string;
  googleCalendarEventId?: string;
}

const STORAGE_KEY = 'eventScopeEvents';

// Helper functions for localStorage
const saveEventsToStorage = (events: EventData[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to save events to localStorage:', error);
  }
};

const loadEventsFromStorage = (): EventData[] => {
  try {
    const storedEvents = localStorage.getItem(STORAGE_KEY);
    if (storedEvents) {
      return JSON.parse(storedEvents);
    }
  } catch (error) {
    console.error('Failed to load events from localStorage:', error);
  }
  return [];
};

const clearAllStoredEvents = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('All stored events cleared from localStorage');
  } catch (error) {
    console.error('Failed to clear events from localStorage:', error);
  }
};

// Make clearAllStoredEvents available globally for development
(window as any).clearAllEvents = clearAllStoredEvents;

function App() {
  const [events, setEvents] = useState<EventData[]>([]);

  // Load events from localStorage on app initialization
  useEffect(() => {
    const savedEvents = loadEventsFromStorage();
    setEvents(savedEvents);
  }, []);

  // Save events to localStorage whenever events change
  useEffect(() => {
    saveEventsToStorage(events);
  }, [events]);

  const addEvent = async (eventData: Omit<EventData, 'id' | 'createdAt' | 'deletedAt'>) => {
    try {
      console.log('Creating new event:', eventData);
      console.log('Event startDate:', eventData.startDate);
      console.log('Event endDate:', eventData.endDate);
      
      const newEvent: EventData = {
        ...eventData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      console.log('New event created:', newEvent);
      console.log('New event startDate:', newEvent.startDate);
      console.log('New event endDate:', newEvent.endDate);
      console.log('New event createdAt:', newEvent.createdAt);

      // Add event locally first
      console.log('Adding event locally...');
      setEvents(prev => [...prev, newEvent]);
      console.log('Event added locally successfully');

      // Try to create in Google Calendar
      try {
        console.log('Attempting Google Calendar sync...');
        const googleEventId = await googleCalendarService.createEvent(newEvent);
        if (googleEventId) {
          // Update the event with the Google Calendar ID
          setEvents(prev => prev.map(event => 
            event.id === newEvent.id 
              ? { ...event, googleCalendarEventId: googleEventId }
              : event
          ));
          console.log('✅ Event synced with Google Calendar successfully!');
        } else {
          console.log('Google Calendar sync skipped (not configured or failed)');
        }
      } catch (calendarError) {
        console.error('Failed to sync new event with Google Calendar:', calendarError);
        console.warn('⚠️ Event created locally, but failed to sync with Google Calendar.');
      }

      // Send email notifications if enabled and guests exist
      if (newEvent.notifications.email && newEvent.guests.length > 0) {
        try {
          console.log('Sending email invitations to guests...');
          const emailResult = await emailService.sendEventInvitation(
            {
              title: newEvent.title,
              description: newEvent.description,
              startDate: newEvent.startDate,
              endDate: newEvent.endDate,
              startTime: newEvent.startTime,
              endTime: newEvent.endTime,
              location: newEvent.location,
            },
            newEvent.guests,
            'Event Organizer' // You can customize this or get it from user context
          );

          if (emailResult.success) {
            console.log('✅ Email invitations sent successfully!');
          } else {
            console.warn('⚠️ Failed to send email invitations:', emailResult.error);
          }
        } catch (emailError) {
          console.error('Failed to send email invitations:', emailError);
          console.warn('⚠️ Event created successfully, but email invitations failed to send.');
        }
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      // Re-throw the error so it can be handled by the form
      throw error;
    }
  };

  const updateEvent = async (id: string, eventData: Omit<EventData, 'id' | 'createdAt' | 'deletedAt'>) => {
    // Find the existing event to get Google Calendar ID
    const existingEvent = events.find(event => event.id === id);
    const updatedEvent = { ...existingEvent, ...eventData } as EventData;
    
    // Update locally first
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? updatedEvent
        : event
    ));

    // Sync with Google Calendar if event has Google Calendar ID
    if (existingEvent?.googleCalendarEventId) {
      try {
        const success = await googleCalendarService.updateEvent(updatedEvent, existingEvent.googleCalendarEventId);
        showGoogleCalendarMessage('updated', success);
      } catch (error) {
        console.error('Failed to sync event update with Google Calendar:', error);
        showGoogleCalendarMessage('updated', false);
      }
    }
  };

  const deleteEvent = async (id: string) => {
    // Find the existing event to get Google Calendar ID
    const existingEvent = events.find(event => event.id === id);
    
    // Mark as deleted locally first
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { ...event, deletedAt: new Date().toISOString() }
        : event
    ));

    // Sync with Google Calendar if event has Google Calendar ID
    if (existingEvent?.googleCalendarEventId) {
      try {
        const success = await googleCalendarService.deleteEvent(existingEvent.googleCalendarEventId);
        showGoogleCalendarMessage('deleted', success);
      } catch (error) {
        console.error('Failed to sync event deletion with Google Calendar:', error);
        showGoogleCalendarMessage('deleted', false);
      }
    }
  };

  const recoverEvent = (id: string) => {
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { ...event, deletedAt: undefined }
        : event
    ));
  };

  const permanentlyDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  // Filter active events (not deleted)
  const activeEvents = events.filter(event => !event.deletedAt);
  
  // Filter deleted events (with 24-hour recovery window)
  const deletedEvents = events.filter(event => {
    if (!event.deletedAt) return false;
    const deletedTime = new Date(event.deletedAt);
    const now = new Date();
    const hoursSinceDeleted = (now.getTime() - deletedTime.getTime()) / (1000 * 60 * 60);
    return hoursSinceDeleted < 24;
  });

  // Auto-cleanup: permanently delete events older than 24 hours
  useEffect(() => {
    const cleanup = () => {
      setEvents(prev => {
        const filteredEvents = prev.filter(event => {
          if (!event.deletedAt) return true;
          const deletedTime = new Date(event.deletedAt);
          const now = new Date();
          const hoursSinceDeleted = (now.getTime() - deletedTime.getTime()) / (1000 * 60 * 60);
          return hoursSinceDeleted < 24;
        });
        
        // Only update if something was actually removed
        if (filteredEvents.length !== prev.length) {
          return filteredEvents;
        }
        return prev;
      });
    };

    // Run cleanup on app start
    cleanup();

    // Run cleanup every hour
    const interval = setInterval(cleanup, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard onCreateEvent={addEvent} />} />
          <Route path="/events" element={
            <EventsList 
              events={activeEvents} 
              onUpdateEvent={updateEvent}
              onDeleteEvent={deleteEvent}
            />
          } />
          <Route path="/events/:id" element={
            <EventDetail 
              events={activeEvents}
              onUpdateEvent={updateEvent}
              onDeleteEvent={deleteEvent}
            />
          } />
          <Route path="/events/:id/edit" element={
            <EventEdit 
              events={activeEvents}
              onUpdateEvent={updateEvent}
            />
          } />
          <Route path="/deleted-events" element={
            <DeletedEvents 
              events={deletedEvents}
              onRecoverEvent={recoverEvent}
              onPermanentlyDeleteEvent={permanentlyDeleteEvent}
            />
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;