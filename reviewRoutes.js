const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');

// Protected routes
router.get('/', authenticate, reviewController.getReviews);
router.post('/', authenticate, reviewController.createReview);
router.get('/:id', authenticate, reviewController.getReviewDetails);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);
router.post('/:id/report', authenticate, reviewController.reportReview);

module.exports = router;
