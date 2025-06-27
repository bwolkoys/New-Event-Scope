import React, { useState, useEffect } from 'react';
import './EventCreationForm.css';
import { EventData } from '../App';

interface EventCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: Omit<EventData, 'id' | 'createdAt'>) => void;
}

interface TeamMember {
  email: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}


// Mock team data - in a real app, this would come from an API
const MOCK_TEAMS: Team[] = [
  {
    id: 'West Ham United',
    name: 'West Ham United',
    members: [
      { email: 'john.doe@company.com', name: 'John Doe' },
      { email: 'jane.smith@company.com', name: 'Jane Smith' },
      { email: 'alex.johnson@company.com', name: 'Alex Johnson' },
      { email: 'sarah.wilson@company.com', name: 'Sarah Wilson' }
    ]
  },
  {
    id: 'Arsenal',
    name: 'Arsenal',
    members: [
      { email: 'mike.brown@company.com', name: 'Mike Brown' },
      { email: 'lisa.davis@company.com', name: 'Lisa Davis' },
      { email: 'tom.garcia@company.com', name: 'Tom Garcia' }
    ]
  },
  {
    id: 'Brentford',
    name: 'Brentford',
    members: [
      { email: 'emma.miller@company.com', name: 'Emma Miller' },
      { email: 'david.martinez@company.com', name: 'David Martinez' },
      { email: 'sophie.taylor@company.com', name: 'Sophie Taylor' },
      { email: 'ryan.anderson@company.com', name: 'Ryan Anderson' }
    ]
  },
  {
    id: 'Chelsea',
    name: 'Chelsea',
    members: [
      { email: 'maya.patel@company.com', name: 'Maya Patel' },
      { email: 'chris.lee@company.com', name: 'Chris Lee' }
    ]
  },
  {
    id: 'Liverpool',
    name: 'Liverpool',
    members: [
      { email: 'anna.clark@company.com', name: 'Anna Clark' },
      { email: 'james.white@company.com', name: 'James White' },
      { email: 'olivia.thomas@company.com', name: 'Olivia Thomas' }
    ]
  }
];

const EventCreationForm: React.FC<EventCreationFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<Omit<EventData, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: 'UTC',
    location: '',
    team: '',
    guests: [],
    rsvpRequired: false,
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    privacy: 'team-only',
  });

  const [newGuest, setNewGuest] = useState('');

  // Handle team selection and pre-populate guests
  useEffect(() => {
    if (formData.team) {
      const selectedTeam = MOCK_TEAMS.find(team => team.id === formData.team);
      if (selectedTeam) {
        const teamMemberEmails = selectedTeam.members.map(member => member.email);
        setFormData(prev => ({
          ...prev,
          guests: teamMemberEmails
        }));
      }
    }
  }, [formData.team]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      if (name.startsWith('notifications.')) {
        const notificationKey = name.split('.')[1] as keyof typeof formData.notifications;
        setFormData(prev => ({
          ...prev,
          notifications: {
            ...prev.notifications,
            [notificationKey]: checkbox.checked,
          },
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checkbox.checked,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddGuest = () => {
    if (newGuest.trim() && !formData.guests.includes(newGuest.trim())) {
      setFormData(prev => ({
        ...prev,
        guests: [...prev.guests, newGuest.trim()],
      }));
      setNewGuest('');
    }
  };

  // Get display name for guest (name if available from team data, otherwise just email)
  const getGuestDisplayName = (email: string): string => {
    for (const team of MOCK_TEAMS) {
      const member = team.members.find(m => m.email === email);
      if (member) {
        return `${member.name} (${member.email})`;
      }
    }
    return email;
  };

  const handleRemoveGuest = (guestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter(guest => guest !== guestToRemove),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Create New Event</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-section">
            <h3>Event Details</h3>
            <div className="form-group">
              <label htmlFor="title">Event Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Date & Time</h3>
            <div className="datetime-grid">
              <div className="form-group">
                <label htmlFor="startDate">Start Date *</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="startTime">Start Time *</label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">End Date *</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endTime">End Time *</label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="timezone">Timezone</label>
              <select
                id="timezone"
                name="timezone"
                value={formData.timezone}
                onChange={handleInputChange}
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Location</h3>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter location or address"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Team & Guests</h3>
            <div className="form-group">
              <label htmlFor="team">Team/Group</label>
              <select
                id="team"
                name="team"
                value={formData.team}
                onChange={handleInputChange}
              >
                <option value="">Select team</option>
                {MOCK_TEAMS.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Guests</label>
              {formData.team && (
                <p className="team-info" style={{fontSize: '0.9em', color: '#666', margin: '0 0 10px 0'}}>
                  Team members have been automatically added. You can remove any or add additional guests.
                </p>
              )}
              <div className="guest-input">
                <input
                  type="email"
                  value={newGuest}
                  onChange={(e) => setNewGuest(e.target.value)}
                  placeholder="Enter email address"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGuest())}
                />
                <button type="button" onClick={handleAddGuest}>Add</button>
              </div>
              
              {formData.guests.length > 0 && (
                <div className="guest-list">
                  {formData.guests.map((guest, index) => (
                    <div key={index} className="guest-item">
                      <span>{getGuestDisplayName(guest)}</span>
                      <button type="button" onClick={() => handleRemoveGuest(guest)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Settings</h3>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="rsvpRequired"
                  checked={formData.rsvpRequired}
                  onChange={handleInputChange}
                />
                Require RSVP
              </label>
            </div>
            
            <div className="form-group">
              <label>Notification Preferences</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="notifications.email"
                    checked={formData.notifications.email}
                    onChange={handleInputChange}
                  />
                  Email notifications
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="notifications.push"
                    checked={formData.notifications.push}
                    onChange={handleInputChange}
                  />
                  Push notifications
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="notifications.sms"
                    checked={formData.notifications.sms}
                    onChange={handleInputChange}
                  />
                  SMS notifications
                </label>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="privacy">Privacy Settings</label>
              <select
                id="privacy"
                name="privacy"
                value={formData.privacy}
                onChange={handleInputChange}
              >
                <option value="team-only">Team Only</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventCreationForm;