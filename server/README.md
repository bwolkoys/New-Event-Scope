# Event Scope Email Server

Backend server for handling email notifications when creating events in Event Scope.

## Features

- Send beautiful HTML email invitations to event guests
- Email templates with event details, dates, times, and locations
- Test email functionality
- Health check endpoint
- CORS configured for frontend integration

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure your email settings:

```bash
cp .env.example .env
```

Edit `.env` file with your email configuration:

```env
# Email Service Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### 3. Gmail App Password Setup

For Gmail users, you'll need to generate an App Password:

1. Go to your [Google Account settings](https://myaccount.google.com/)
2. Navigate to Security > 2-Step Verification
3. At the bottom, select "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password as your `EMAIL_PASSWORD`

### 4. Start the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Send Event Invitation
```
POST /api/email/send-event-invitation
```

Request body:
```json
{
  "eventData": {
    "title": "Team Meeting",
    "description": "Weekly team sync",
    "startDate": "2024-01-15",
    "endDate": "2024-01-15",
    "startTime": "14:00",
    "endTime": "15:00",
    "location": "Conference Room A"
  },
  "guests": ["guest1@example.com", "guest2@example.com"],
  "organizer": "John Doe"
}
```

### Test Email
```
POST /api/email/test-email
```

Request body:
```json
{
  "to": "test@example.com"
}
```

## Frontend Integration

The frontend automatically calls the email API when:
1. Creating a new event
2. Email notifications are enabled (checkbox checked)
3. Guest list contains email addresses

## Troubleshooting

### Common Issues

1. **"Authentication failed" error**
   - Make sure you're using an App Password, not your regular Gmail password
   - Verify 2-Factor Authentication is enabled on your Google account

2. **"Connection refused" error**
   - Ensure the server is running on port 3001
   - Check firewall settings

3. **CORS errors**
   - Verify `FRONTEND_URL` in `.env` matches your frontend URL
   - Default is `http://localhost:3000`

### Testing Email Functionality

Use the test endpoint to verify email configuration:

```bash
curl -X POST http://localhost:3001/api/email/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@example.com"}'
```

## Email Template

The email template includes:
- Event title and description
- Formatted date and time
- Location information
- Organizer details
- Professional styling with responsive design

## Security Notes

- Never commit your `.env` file to version control
- Use App Passwords instead of regular passwords
- Keep your email credentials secure
- Consider using environment variables in production