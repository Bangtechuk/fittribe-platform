const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// Protected routes - all authenticated users
router.post('/create-payment-intent', authenticate, paymentController.createPaymentIntent);
router.post('/confirm-payment', authenticate, paymentController.confirmPayment);
router.get('/history', authenticate, paymentController.getPaymentHistory);
router.get('/:id', authenticate, paymentController.getPaymentDetails);

// Protected routes - admin only
router.post('/refund/:id', authenticate, isAdmin, paymentController.processRefund);

// Payout routes - trainer only
router.get('/payouts', authenticate, paymentController.getPayoutHistory);
router.post('/payouts/request', authenticate, paymentController.requestPayout);

module.exports = router;
