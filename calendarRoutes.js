const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get authorization URL
router.get(
  '/auth',
  authenticateToken,
  calendarController.getAuthUrl
);

// Handle OAuth callback
router.get(
  '/callback',
  calendarController.handleCallback
);

// Create a calendar event
router.post(
  '/events',
  authenticateToken,
  calendarController.createCalendarEvent
);

// Update a calendar event
router.patch(
  '/events/:eventId',
  authenticateToken,
  calendarController.updateCalendarEvent
);

// Delete a calendar event
router.delete(
  '/events/:eventId',
  authenticateToken,
  calendarController.deleteCalendarEvent
);

module.exports = router;
