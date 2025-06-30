# Google Calendar Integration Setup

Your event management system now automatically syncs with Google Calendar when you update or delete events! Here's how to set it up:

## Features Added

✅ **Automatic Sync**: Events are automatically created, updated, and deleted in Google Calendar  
✅ **Seamless Integration**: Works in the background - no additional steps needed  
✅ **Error Handling**: Graceful fallback if Google Calendar is unavailable  
✅ **Event Tracking**: Each event stores its Google Calendar ID for proper sync  

## Setup Instructions

### 1. Get Google API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Configure OAuth consent screen if prompted
   - Choose "Web application"
   - Add your domain to authorized origins (e.g., `http://localhost:3000` for development)
   - Copy your Client ID

### 2. Configure Your App

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```
   REACT_APP_GOOGLE_API_KEY=your_actual_google_api_key_here
   REACT_APP_GOOGLE_CLIENT_ID=your_actual_google_client_id_here
   ```

3. Restart your development server:
   ```bash
   npm start
   ```

### 3. First-Time Authentication

When you first create, update, or delete an event, you'll be prompted to:
1. Sign in to your Google account
2. Grant permission for the app to manage your calendar

## How It Works

- **Creating Events**: New events are automatically added to your Google Calendar
- **Updating Events**: Changes are synced to the corresponding Google Calendar event
- **Deleting Events**: Events are removed from Google Calendar when deleted locally
- **Error Handling**: If Google Calendar is unavailable, events still work locally

## Troubleshooting

### Events Not Syncing?
- Check that your API credentials are correct in `.env`
- Ensure you've granted calendar permissions
- Check browser console for error messages

### Permission Denied?
- Verify your OAuth 2.0 client ID is configured correctly
- Make sure your domain is in the authorized origins
- Try signing out and signing back in

### API Quota Exceeded?
- Google Calendar API has daily quotas
- For high-volume usage, consider upgrading your Google Cloud plan

## Security Notes

- Never commit your `.env` file to version control
- Keep your API credentials secure
- The app only requests calendar permissions (no access to other Google services)

## Development vs Production

For production deployment:
1. Update OAuth authorized origins with your production domain
2. Use production environment variables
3. Consider implementing additional error handling and user feedback

---

Your events will now automatically stay in sync with Google Calendar! 🎉