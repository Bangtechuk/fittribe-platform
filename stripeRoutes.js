const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Create a payment intent
router.post(
  '/create-payment-intent',
  authenticateToken,
  stripeController.createPaymentIntent
);

// Confirm payment intent (capture funds)
router.post(
  '/confirm-payment',
  authenticateToken,
  stripeController.confirmPaymentIntent
);

// Cancel payment intent (release hold)
router.post(
  '/cancel-payment',
  authenticateToken,
  stripeController.cancelPaymentIntent
);

// Create a refund
router.post(
  '/refund',
  authenticateToken,
  authorizeRole(['admin']),
  stripeController.createRefund
);

// Create a payout to a trainer
router.post(
  '/payout',
  authenticateToken,
  authorizeRole(['admin']),
  stripeController.createPayout
);

// Webhook handler for Stripe events
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeController.handleWebhook
);

module.exports = router;
