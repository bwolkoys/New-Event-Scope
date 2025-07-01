import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventData } from '../App';
import { generateGoogleCalendarUrl } from '../utils/googleCalendar';
import './EventDetail.css';

interface EventDetailProps {
  events: EventData[];
  onUpdateEvent: (id: string, eventData: Omit<EventData, 'id' | 'createdAt' | 'deletedAt'>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
}

const EventDetail: React.FC<EventDetailProps> = ({ events, onUpdateEvent, onDeleteEvent }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const event = events.find(e => e.id === id);

  if (!event) {
    return (
      <div className="event-detail-container">
        <div className="event-not-found">
          <h2>Event Not Found</h2>
          <p>The event you're looking for doesn't exist or has been deleted.</p>
          <button onClick={() => navigate('/events')} className="back-to-events-btn">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string, timezone: string) => {
    const dateTime = new Date(`${event.startDate}T${timeString}`);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    }).format(dateTime);
  };

  const getTeamName = (teamId: string) => {
    const teamNames: { [key: string]: string } = {
      WestHamUnited: 'West Ham United',
      Arsenal: 'Arsenal',
      Brentford: 'Brentford',
      Chelsea: 'Chelsea',
      Liverpool: 'Liverpool'
    };
    return teamNames[teamId] || teamId;
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event? You can recover it within 24 hours.')) {
      await onDeleteEvent(event.id);
      navigate('/events');
    }
  };

  const handleAddToGoogleCalendar = () => {
    const googleCalendarUrl = generateGoogleCalendarUrl(event);
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="event-detail-container">
      <div className="event-detail-header">
        <button onClick={() => navigate('/events')} className="back-to-events-btn">
          ← Back to Events
        </button>
        <div className="header-actions">
          <button 
            onClick={handleAddToGoogleCalendar}
            className="detail-action-btn calendar-btn"
          >
            📅 Add to Google Calendar
          </button>
          <button 
            onClick={() => navigate(`/events/${event.id}/edit`)}
            className="detail-action-btn edit-btn"
          >
            Edit Event
          </button>
          <button 
            onClick={handleDelete}
            className="detail-action-btn delete-btn"
          >
            Delete Event
          </button>
        </div>
      </div>

      <div className="event-detail-content">
        <div className="event-detail-main">
          <div className="event-title-section">
            <h1 className="event-detail-title">{event.title}</h1>
            <span className={`privacy-badge ${event.privacy}`}>
              {event.privacy === 'team-only' ? 'Team Only' : 'Public'}
            </span>
          </div>

          {event.description && (
            <div className="event-description-section">
              <h3>Description</h3>
              <p className="event-description">{event.description}</p>
            </div>
          )}

          <div className="event-details-grid">
            <div className="detail-section">
              <h3>Event Date & Time</h3>
              <div className="detail-item">
                <strong>Start:</strong> {formatDate(event.startDate)} at {formatTime(event.startTime, event.timezone)}
              </div>
              <div className="detail-item">
                <strong>End:</strong> {formatDate(event.endDate)} at {formatTime(event.endTime, event.timezone)}
              </div>
              <div className="detail-item">
                <strong>Timezone:</strong> {event.timezone}
              </div>
            </div>

            {event.location && (
              <div className="detail-section">
                <h3>Location</h3>
                <div className="detail-item">{event.location}</div>
              </div>
            )}

            {event.team && (
              <div className="detail-section">
                <h3>Team</h3>
                <div className="detail-item">{getTeamName(event.team)}</div>
              </div>
            )}

            <div className="detail-section">
              <h3>Settings</h3>
              <div className="detail-item">
                <strong>RSVP Required:</strong> {event.rsvpRequired ? 'Yes' : 'No'}
              </div>
              <div className="detail-item">
                <strong>Privacy:</strong> {event.privacy === 'team-only' ? 'Team Only' : 'Public'}
              </div>
            </div>

            <div className="detail-section">
              <h3>Notifications</h3>
              <div className="notification-settings">
                <div className={`notification-item ${event.notifications.email ? 'enabled' : 'disabled'}`}>
                  <span>📧</span> Email Notifications
                </div>
              </div>
            </div>
          </div>

          {event.guests.length > 0 && (
            <div className="guests-section">
              <h3>Guests ({event.guests.length})</h3>
              <div className="guests-detail-list">
                {event.guests.map((guest, index) => (
                  <div key={index} className="guest-detail-item">
                    <span className="guest-avatar">{guest.charAt(0).toUpperCase()}</span>
                    <span className="guest-email">{guest}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="event-meta">
            <p><strong>Created:</strong> {new Date(event.createdAt).toLocaleString()}</p>
            <p><strong>Event ID:</strong> {event.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;