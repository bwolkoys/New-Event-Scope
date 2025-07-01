const generateEventInvitationHTML = (eventData) => {
  const {
    title,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
    location,
    organizer = 'Event Organizer'
  } = eventData;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Event Invitation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f4f4f4;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #007bff;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .event-title {
          color: #007bff;
          font-size: 28px;
          margin: 0;
        }
        .event-details {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          margin: 10px 0;
          align-items: center;
        }
        .detail-label {
          font-weight: bold;
          min-width: 100px;
          color: #495057;
        }
        .detail-value {
          margin-left: 15px;
        }
        .description {
          background: white;
          padding: 15px;
          border-left: 4px solid #007bff;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #dee2e6;
          color: #6c757d;
          font-size: 14px;
        }
        .icon {
          width: 16px;
          height: 16px;
          margin-right: 8px;
          vertical-align: middle;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="event-title">You're Invited!</h1>
          <h2 style="margin: 10px 0; color: #495057;">${title}</h2>
        </div>

        <div class="event-details">
          <div class="detail-row">
            <span class="detail-label">📅 Date:</span>
            <span class="detail-value">
              ${formatDate(startDate)}
              ${startDate !== endDate ? ` - ${formatDate(endDate)}` : ''}
            </span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">🕐 Time:</span>
            <span class="detail-value">
              ${formatTime(startTime)}${endTime ? ` - ${formatTime(endTime)}` : ''}
            </span>
          </div>
          
          ${location ? `
          <div class="detail-row">
            <span class="detail-label">📍 Location:</span>
            <span class="detail-value">${location}</span>
          </div>
          ` : ''}
          
          <div class="detail-row">
            <span class="detail-label">👤 Organizer:</span>
            <span class="detail-value">${organizer}</span>
          </div>
        </div>

        ${description ? `
        <div class="description">
          <h3 style="margin-top: 0; color: #495057;">Event Description</h3>
          <p style="margin-bottom: 0;">${description}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p>This invitation was sent through Event Scope.</p>
          <p>Please mark your calendar and we look forward to seeing you there!</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  generateEventInvitationHTML
};