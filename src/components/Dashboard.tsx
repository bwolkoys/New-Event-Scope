import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import EventCreationForm from './EventCreationForm';
import { EventData } from '../App';

interface DashboardProps {
  onCreateEvent: (eventData: Omit<EventData, 'id' | 'createdAt'>) => Promise<void>;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateEvent }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreateEvent = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  const handleSubmitEvent = async (eventData: Omit<EventData, 'id' | 'createdAt'>) => {
    try {
      console.log('Dashboard handling event submission:', eventData);
      await onCreateEvent(eventData);
      console.log('Event created successfully');
    } catch (error) {
      console.error('Dashboard: Error creating event:', error);
      throw error; // Re-throw so the form can handle it
    }
  };

  const handleViewEvents = () => {
    navigate('/events');
  };

  const handleDeletedEvents = () => {
    navigate('/deleted-events');
  };

  return (
    <div className="dashboard">
      <h1>Event Dashboard</h1>
      <div className="button-container">
        <button className="dashboard-button" onClick={handleCreateEvent}>
          Create Event
        </button>
        <button className="dashboard-button" onClick={handleViewEvents}>
          View Events
        </button>
        <button className="dashboard-button" onClick={handleDeletedEvents}>
          Deleted Events
        </button>
      </div>
      
      <EventCreationForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitEvent}
      />
    </div>
  );
};

export default Dashboard;