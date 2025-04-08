require('dotenv').config();
const { google } = require('googleapis');
const express = require('express');

// Google Calendar API credentials
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Create OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Generate authorization URL
const getAuthUrl = (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ];
    
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: req.query.userId // Pass user ID to identify the user after auth
    });
    
    return res.status(200).json({
      error: false,
      data: {
        authUrl: url
      }
    });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to generate authorization URL'
    });
  }
};

// Handle OAuth callback
const handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({
        error: true,
        message: 'Authorization code is required'
      });
    }
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // In a real implementation, you would save these tokens to your database
    // associated with the user ID from the state parameter
    
    // For this example, we'll just return success
    return res.status(200).json({
      error: false,
      message: 'Calendar successfully connected',
      data: {
        userId: state
      }
    });
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to connect calendar'
    });
  }
};

// Create a calendar event
const createCalendarEvent = async (req, res) => {
  try {
    const { 
      userId, 
      bookingId, 
      summary, 
      description, 
      startTime, 
      endTime, 
      location,
      attendees = []
    } = req.body;
    
    if (!userId || !bookingId || !summary || !startTime || !endTime) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields'
      });
    }
    
    // In a real implementation, you would retrieve the user's tokens from your database
    // and set them on the OAuth2 client
    // oauth2Client.setCredentials(userTokens);
    
    // For this example, we'll simulate creating an event
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const event = {
      summary,
      description,
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(endTime).toISOString(),
        timeZone: 'UTC'
      },
      attendees: attendees.map(email => ({ email })),
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 10 }
        ]
      },
      extendedProperties: {
        private: {
          bookingId
        }
      }
    };
    
    if (location) {
      event.location = location;
    }
    
    // In a real implementation, you would actually create the event
    // const createdEvent = await calendar.events.insert({
    //   calendarId: 'primary',
    //   resource: event
    // });
    
    // For this example, we'll simulate a successful response
    const simulatedResponse = {
      id: `event_${Date.now()}`,
      htmlLink: `https://calendar.google.com/calendar/event?eid=${Date.now()}`
    };
    
    return res.status(200).json({
      error: false,
      data: {
        eventId: simulatedResponse.id,
        eventUrl: simulatedResponse.htmlLink
      }
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to create calendar event'
    });
  }
};

// Update a calendar event
const updateCalendarEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { 
      userId, 
      summary, 
      description, 
      startTime, 
      endTime, 
      location,
      attendees = []
    } = req.body;
    
    if (!userId || !eventId) {
      return res.status(400).json({
        error: true,
        message: 'User ID and event ID are required'
      });
    }
    
    // In a real implementation, you would retrieve the user's tokens from your database
    // and set them on the OAuth2 client
    // oauth2Client.setCredentials(userTokens);
    
    // For this example, we'll simulate updating an event
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const event = {};
    
    if (summary) event.summary = summary;
    if (description) event.description = description;
    if (startTime) {
      event.start = {
        dateTime: new Date(startTime).toISOString(),
        timeZone: 'UTC'
      };
    }
    if (endTime) {
      event.end = {
        dateTime: new Date(endTime).toISOString(),
        timeZone: 'UTC'
      };
    }
    if (location) event.location = location;
    if (attendees.length > 0) {
      event.attendees = attendees.map(email => ({ email }));
    }
    
    // In a real implementation, you would actually update the event
    // const updatedEvent = await calendar.events.update({
    //   calendarId: 'primary',
    //   eventId,
    //   resource: event
    // });
    
    return res.status(200).json({
      error: false,
      message: 'Calendar event updated successfully'
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to update calendar event'
    });
  }
};

// Delete a calendar event
const deleteCalendarEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { userId } = req.body;
    
    if (!userId || !eventId) {
      return res.status(400).json({
        error: true,
        message: 'User ID and event ID are required'
      });
    }
    
    // In a real implementation, you would retrieve the user's tokens from your database
    // and set them on the OAuth2 client
    // oauth2Client.setCredentials(userTokens);
    
    // For this example, we'll simulate deleting an event
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // In a real implementation, you would actually delete the event
    // await calendar.events.delete({
    //   calendarId: 'primary',
    //   eventId
    // });
    
    return res.status(200).json({
      error: false,
      message: 'Calendar event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to delete calendar event'
    });
  }
};

module.exports = {
  getAuthUrl,
  handleCallback,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
};
