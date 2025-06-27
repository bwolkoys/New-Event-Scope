import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventData } from '../App';
import './EventsList.css';

interface EventsListProps {
  events: EventData[];
  onUpdateEvent: (id: string, eventData: Omit<EventData, 'id' | 'createdAt' | 'deletedAt'>) => void;
  onDeleteEvent: (id: string) => void;
}

interface FilterState {
  searchTerm: string;
  selectedTeam: string;
  eventType: string;
  dateRange: {
    start: string;
    end: string;
  };
  viewMode: 'all' | 'my';
}

const EventsList: React.FC<EventsListProps> = ({ events, onUpdateEvent, onDeleteEvent }) => {
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    selectedTeam: '',
    eventType: '',
    dateRange: {
      start: '',
      end: ''
    },
    viewMode: 'all'
  });

  // Available teams for filtering (should match the teams from EventCreationForm)
  const availableTeams = [
    { id: 'engineering', name: 'Engineering' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'sales', name: 'Sales' },
    { id: 'design', name: 'Design' },
    { id: 'product', name: 'Product' }
  ];

  // Filter events based on current filter state
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Search by title
      if (filters.searchTerm && !event.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
        return false;
      }

      // Filter by team
      if (filters.selectedTeam && event.team !== filters.selectedTeam) {
        return false;
      }

      // Filter by event type (privacy)
      if (filters.eventType && event.privacy !== filters.eventType) {
        return false;
      }

      // Filter by date range
      if (filters.dateRange.start && event.startDate < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && event.startDate > filters.dateRange.end) {
        return false;
      }

      // For "my events" vs "all events" - since we don't have user auth,
      // we'll simulate this by showing events created in the last day for "my events"
      if (filters.viewMode === 'my') {
        const eventCreatedDate = new Date(event.createdAt);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        if (eventCreatedDate < oneDayAgo) {
          return false;
        }
      }

      return true;
    });
  }, [events, filters]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateRangeChange = (key: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value
      }
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      selectedTeam: '',
      eventType: '',
      dateRange: {
        start: '',
        end: ''
      },
      viewMode: 'all'
    });
  };

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

  return (
    <div className="events-list-container">
      <div className="events-header">
        <button className="back-button" onClick={handleBackToDashboard}>
          ← Back to Dashboard
        </button>
        <h1>All Events</h1>
      </div>

      {/* Search and Filters */}
      <div className="filters-container">
        <div className="filters-row">
          {/* Search Input */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search events by title..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              className="search-input"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button
              className={`toggle-btn ${filters.viewMode === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('viewMode', 'all')}
            >
              All Events
            </button>
            <button
              className={`toggle-btn ${filters.viewMode === 'my' ? 'active' : ''}`}
              onClick={() => handleFilterChange('viewMode', 'my')}
            >
              My Events
            </button>
          </div>
        </div>

        <div className="filters-row">
          {/* Team Filter */}
          <select
            value={filters.selectedTeam}
            onChange={(e) => handleFilterChange('selectedTeam', e.target.value)}
            className="filter-select"
          >
            <option value="">All Teams</option>
            {availableTeams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>

          {/* Event Type Filter */}
          <select
            value={filters.eventType}
            onChange={(e) => handleFilterChange('eventType', e.target.value)}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="team-only">Team Only</option>
            <option value="public">Public</option>
          </select>

          {/* Date Range Filters */}
          <div className="date-range-container">
            <input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="date-input"
              placeholder="Start date"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="date-input"
              placeholder="End date"
            />
          </div>

          {/* Clear Filters Button */}
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>

        {/* Results Count */}
        <div className="results-info">
          Showing {filteredEvents.length} of {events.length} events
        </div>
      </div>

      {events.length === 0 ? (
        <div className="no-events">
          <p>No events created yet.</p>
          <button className="create-event-button" onClick={handleBackToDashboard}>
            Create Your First Event
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="no-events">
          <p>No events match your current filters.</p>
          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div className="event-card-header">
                <h3 className="event-title">{event.title}</h3>
                <span className={`privacy-badge ${event.privacy}`}>
                  {event.privacy === 'team-only' ? 'Team Only' : 'Public'}
                </span>
              </div>
              
              {event.description && (
                <p className="event-description">{event.description}</p>
              )}
              
              <div className="event-details">
                <div className="event-detail">
                  <strong>Date:</strong> {formatDate(event.startDate)}
                  {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
                </div>
                
                <div className="event-detail">
                  <strong>Time:</strong> {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </div>
                
                {event.location && (
                  <div className="event-detail">
                    <strong>Location:</strong> {event.location}
                  </div>
                )}
                
                {event.team && (
                  <div className="event-detail">
                    <strong>Team:</strong> {getTeamName(event.team)}
                  </div>
                )}
                
                <div className="event-detail">
                  <strong>Timezone:</strong> {event.timezone}
                </div>
              </div>
              
              {event.guests.length > 0 && (
                <div className="event-guests">
                  <strong>Guests ({event.guests.length}):</strong>
                  <div className="guests-list">
                    {event.guests.slice(0, 3).map((guest, index) => (
                      <span key={index} className="guest-badge">
                        {guest.split('@')[0]}
                      </span>
                    ))}
                    {event.guests.length > 3 && (
                      <span className="guest-badge more">+{event.guests.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
              
              <div className="event-settings">
                {event.rsvpRequired && (
                  <span className="setting-badge">RSVP Required</span>
                )}
                {event.notifications.email && (
                  <span className="setting-badge">Email Notifications</span>
                )}
                {event.notifications.push && (
                  <span className="setting-badge">Push Notifications</span>
                )}
                {event.notifications.sms && (
                  <span className="setting-badge">SMS Notifications</span>
                )}
              </div>
              
              <div className="event-actions">
                <button 
                  className="action-btn view-btn"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  View Event
                </button>
                <button 
                  className="action-btn edit-btn"
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                >
                  Edit
                </button>
                <button 
                  className="action-btn delete-btn"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this event? You can recover it within 24 hours.')) {
                      onDeleteEvent(event.id);
                    }
                  }}
                >
                  Delete
                </button>
              </div>
              
              <div className="event-footer">
                <small>Created: {new Date(event.createdAt).toLocaleString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList;