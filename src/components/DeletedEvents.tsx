import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EventData } from '../App';
import './DeletedEvents.css';

interface DeletedEventsProps {
  events: EventData[];
  onRecoverEvent: (id: string) => void;
  onPermanentlyDeleteEvent: (id: string) => void;
}

const DeletedEvents: React.FC<DeletedEventsProps> = ({ 
  events, 
  onRecoverEvent, 
  onPermanentlyDeleteEvent 
}) => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTeamName = (teamId: string) => {
    const teamNames: { [key: string]: string } = {
      engineering: 'Engineering',
      marketing: 'Marketing',
      sales: 'Sales',
      design: 'Design',
      product: 'Product'
    };
    return teamNames[teamId] || teamId;
  };

  const getTimeUntilPermanentDeletion = (deletedAt: string) => {
    const deletedTime = new Date(deletedAt);
    const now = new Date();
    const hoursSinceDeleted = (now.getTime() - deletedTime.getTime()) / (1000 * 60 * 60);
    const hoursRemaining = Math.max(0, 24 - hoursSinceDeleted);
    
    if (hoursRemaining < 1) {
      const minutesRemaining = Math.max(0, (24 * 60) - ((now.getTime() - deletedTime.getTime()) / (1000 * 60)));
      return `${Math.floor(minutesRemaining)} minutes`;
    }
    
    return `${Math.floor(hoursRemaining)} hours`;
  };

  const handleRecover = (eventId: string) => {
    if (window.confirm('Are you sure you want to recover this event?')) {
      onRecoverEvent(eventId);
    }
  };

  const handlePermanentDelete = (eventId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this event? This action cannot be undone.')) {
      onPermanentlyDeleteEvent(eventId);
    }
  };

  return (
    <div className="deleted-events-container">
      <div className="deleted-events-header">
        <button className="back-button" onClick={handleBackToDashboard}>
          ← Back to Dashboard
        </button>
        <h1>Deleted Events</h1>
      </div>

      <div className="deleted-events-info">
        <div className="info-card">
          <h3>Recovery Information</h3>
          <p>Deleted events are kept for 24 hours and can be recovered during this time. After 24 hours, they are permanently deleted and cannot be recovered.</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="no-deleted-events">
          <p>No deleted events found.</p>
          <button className="back-to-dashboard-btn" onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      ) : (
        <div className="deleted-events-grid">
          {events.map((event) => (
            <div key={event.id} className="deleted-event-card">
              <div className="deleted-event-header">
                <h3 className="deleted-event-title">{event.title}</h3>
                <div className="deletion-info">
                  <span className="deleted-badge">DELETED</span>
                  <span className="time-remaining">
                    {getTimeUntilPermanentDeletion(event.deletedAt!)} left
                  </span>
                </div>
              </div>
              
              {event.description && (
                <p className="deleted-event-description">{event.description}</p>
              )}
              
              <div className="deleted-event-details">
                <div className="deleted-event-detail">
                  <strong>Date:</strong> {formatDate(event.startDate)}
                  {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
                </div>
                
                <div className="deleted-event-detail">
                  <strong>Time:</strong> {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>
                
                {event.location && (
                  <div className="deleted-event-detail">
                    <strong>Location:</strong> {event.location}
                  </div>
                )}
                
                {event.team && (
                  <div className="deleted-event-detail">
                    <strong>Team:</strong> {getTeamName(event.team)}
                  </div>
                )}
                
                <div className="deleted-event-detail">
                  <strong>Guests:</strong> {event.guests.length} invited
                </div>
              </div>
              
              <div className="deletion-meta">
                <div className="deletion-meta-item">
                  <strong>Deleted:</strong> {new Date(event.deletedAt!).toLocaleString()}
                </div>
                <div className="deletion-meta-item">
                  <strong>Originally Created:</strong> {new Date(event.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div className="deleted-event-actions">
                <button 
                  className="recover-btn"
                  onClick={() => handleRecover(event.id)}
                >
                  Recover Event
                </button>
                <button 
                  className="permanent-delete-btn"
                  onClick={() => handlePermanentDelete(event.id)}
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeletedEvents;