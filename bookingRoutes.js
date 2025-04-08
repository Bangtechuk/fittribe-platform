const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, isTrainer } = require('../middleware/authMiddleware');

// Protected routes - all authenticated users
router.get('/', authenticate, bookingController.getUserBookings);
router.post('/', authenticate, bookingController.createBooking);
router.get('/:id', authenticate, bookingController.getBookingDetails);
router.put('/:id', authenticate, bookingController.updateBooking);
router.delete('/:id', authenticate, bookingController.cancelBooking);

// Protected routes - trainer only
router.post('/:id/confirm', authenticate, isTrainer, bookingController.confirmBooking);
router.post('/:id/decline', authenticate, isTrainer, bookingController.declineBooking);
router.post('/:id/complete', authenticate, isTrainer, bookingController.completeBooking);
router.post('/:id/no-show', authenticate, isTrainer, bookingController.markNoShow);

module.exports = router;
