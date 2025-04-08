const express = require('express');
const router = express.Router();
const zoomController = require('../controllers/zoomController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Create a Zoom meeting
router.post(
  '/meetings',
  authenticateToken,
  authorizeRole(['trainer', 'admin']),
  zoomController.createZoomMeeting
);

// Update a Zoom meeting
router.patch(
  '/meetings/:meetingId',
  authenticateToken,
  authorizeRole(['trainer', 'admin']),
  zoomController.updateZoomMeeting
);

// Delete a Zoom meeting
router.delete(
  '/meetings/:meetingId',
  authenticateToken,
  authorizeRole(['trainer', 'admin']),
  zoomController.deleteZoomMeeting
);

// Get Zoom meeting details
router.get(
  '/meetings/:meetingId',
  authenticateToken,
  zoomController.getZoomMeeting
);

module.exports = router;
