import express from 'express';
import {
  createDonationEvent,
  getHospitalEvents,
  updateEventStatus,
  registerDonor,
  updateDonorStatus
} from '../controllers/donationEventController';

const router = express.Router();

router.post('/', createDonationEvent);
router.get('/hospital', getHospitalEvents);
router.put('/:eventId/status', updateEventStatus);
router.post('/:eventId/register', registerDonor);
router.put('/:eventId/donors/:donorId', updateDonorStatus);

export default router;