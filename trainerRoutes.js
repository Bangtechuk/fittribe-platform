const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const { authenticate, isTrainer } = require('../middleware/authMiddleware');

// Public routes
router.get('/', trainerController.getAllTrainers);
router.get('/:id', trainerController.getTrainerById);
router.get('/:id/reviews', trainerController.getTrainerReviews);
router.get('/:id/availability', trainerController.getTrainerAvailability);
router.get('/:id/services', trainerController.getTrainerServices);

// Protected routes - trainer only
router.post('/', authenticate, isTrainer, trainerController.createTrainerProfile);
router.put('/:id', authenticate, isTrainer, trainerController.updateTrainerProfile);
router.put('/:id/availability', authenticate, isTrainer, trainerController.updateTrainerAvailability);
router.post('/:id/certifications', authenticate, isTrainer, trainerController.addCertification);
router.delete('/:id/certifications/:certId', authenticate, isTrainer, trainerController.deleteCertification);
router.post('/:id/services', authenticate, isTrainer, trainerController.addTrainerService);
router.put('/:id/services/:serviceId', authenticate, isTrainer, trainerController.updateTrainerService);
router.delete('/:id/services/:serviceId', authenticate, isTrainer, trainerController.deleteTrainerService);

module.exports = router;
