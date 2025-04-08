const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// All routes require admin authentication
router.use(authenticate, isAdmin);

// Admin dashboard endpoints
router.get('/stats', adminController.getStats);
router.get('/users/pending', adminController.getPendingTrainerVerifications);
router.post('/users/:id/verify', adminController.verifyTrainer);
router.get('/reports', adminController.getReportedContent);
router.post('/reports/:id/resolve', adminController.resolveReport);
router.get('/transactions', adminController.getAllTransactions);
router.get('/payouts/pending', adminController.getPendingPayouts);
router.post('/payouts/:id/process', adminController.processPayout);
router.get('/settings', adminController.getPlatformSettings);
router.put('/settings', adminController.updatePlatformSettings);

module.exports = router;
