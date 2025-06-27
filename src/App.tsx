import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EventsList from './components/EventsList';
import DeletedEvents from './components/DeletedEvents';
import EventDetail from './components/EventDetail';
import EventEdit from './components/EventEdit';

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
    push: boolean;
    sms: boolean;
  };
  privacy: 'team-only' | 'public';
  createdAt: string;
  deletedAt?: string;
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
    if (events.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      saveEventsToStorage(events);
    }
  }, [events]);

  const addEvent = (eventData: Omit<EventData, 'id' | 'createdAt' | 'deletedAt'>) => {
    const newEvent: EventData = {
      ...eventData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, eventData: Omit<EventData, 'id' | 'createdAt' | 'deletedAt'>) => {
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { ...event, ...eventData }
        : event
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.map(event => 
      event.id === id 
        ? { ...event, deletedAt: new Date().toISOString() }
        : event
    ));
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