const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Send booking confirmation email
router.post(
  '/booking-confirmation',
  authenticateToken,
  emailController.sendBookingConfirmation
);

// Send booking reminder email
router.post(
  '/booking-reminder',
  authenticateToken,
  emailController.sendBookingReminder
);

// Send payment receipt email
router.post(
  '/payment-receipt',
  authenticateToken,
  emailController.sendPaymentReceipt
);

// Send admin notification email
router.post(
  '/admin-notification',
  authenticateToken,
  authorizeRole(['admin']),
  emailController.sendAdminNotification
);

module.exports = router;
