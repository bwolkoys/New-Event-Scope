const express = require('express');
const router = express.Router();
const { sendEmail } = require('../config/emailConfig');
const { generateEventInvitationHTML } = require('../templates/eventInvitation');

router.post('/send-event-invitation', async (req, res) => {
  try {
    const { eventData, guests, organizer } = req.body;

    if (!eventData || !guests || !Array.isArray(guests) || guests.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Event data and guest list are required'
      });
    }

    const subject = `Event Invitation: ${eventData.title}`;
    const htmlContent = generateEventInvitationHTML({
      ...eventData,
      organizer: organizer || 'Event Organizer'
    });

    const result = await sendEmail(guests, subject, htmlContent);

    if (result.success) {
      res.json({
        success: true,
        message: `Invitations sent to ${guests.length} guest(s)`,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Email route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

router.post('/test-email', async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email is required'
      });
    }

    const testEventData = {
      title: 'Test Event',
      description: 'This is a test email from your Event Scope server.',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:00',
      location: 'Test Location',
      organizer: 'Event Scope System'
    };

    const subject = 'Test Email from Event Scope';
    const htmlContent = generateEventInvitationHTML(testEventData);

    const result = await sendEmail([to], subject, htmlContent);

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;