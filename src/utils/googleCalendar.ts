import { EventData } from '../App';

export const generateGoogleCalendarUrl = (event: EventData): string => {
  // Base Google Calendar URL
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  
  // Format dates for Google Calendar (YYYYMMDDTHHMMSS format)
  const formatDateTimeForGoogle = (date: string, time: string): string => {
    // Format as local time string for Google Calendar URL
    // Google Calendar will interpret this based on the ctz parameter
    const dateTimeString = `${date}T${time}`;
    return dateTimeString.replace(/[-:]/g, '');
  };
  
  const startDateTime = formatDateTimeForGoogle(event.startDate, event.startTime);
  const endDateTime = formatDateTimeForGoogle(event.endDate, event.endTime);
  
  // Create URL parameters
  const params = new URLSearchParams({
    text: event.title,
    dates: `${startDateTime}/${endDateTime}`,
    ctz: event.timezone,
    details: event.description || '',
    location: event.location || '',
  });
  
  // Add guests if they exist
  if (event.guests.length > 0) {
    params.append('add', event.guests.join(','));
  }
  
  return `${baseUrl}&${params.toString()}`;
};