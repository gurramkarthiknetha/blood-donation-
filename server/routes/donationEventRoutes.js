const express = require('express');
const router = express.Router();
const donationEventController = require('../controllers/donationEventController');
const { verifyToken, authorize } = require('../middleware/authMiddleware');
const { validateDonationEvent } = require('../middleware/validateRequest');

// Public routes
router.get('/upcoming', donationEventController.getUpcomingEvents);
router.get('/:eventId', donationEventController.getEventDetails);

// Protected routes
router.use(verifyToken);

// Hospital routes
router.post(
  '/',
  authorize('hospital'),
  validateDonationEvent,
  donationEventController.createEvent
);

router.post(
  '/:eventId/cancel',
  authorize('hospital'),
  donationEventController.cancelEvent
);

// Donor routes
router.post(
  '/:eventId/register',
  authorize('donor'),
  donationEventController.registerForEvent
);

// Hospital staff routes
router.patch(
  '/:eventId/donors/:donorId/status',
  authorize('hospital'),
  donationEventController.updateDonorStatus
);

module.exports = router;