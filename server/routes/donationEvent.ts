import express from 'express';
import { hospitalAuth } from '../middleware/hospitalAuth';
import {
  createDonationEvent,
  getHospitalEvents,
  updateEventStatus,
  registerDonor,
  updateDonorStatus
} from '../controllers/donationEventController';

const router = express.Router();

router.post('/', hospitalAuth, createDonationEvent);
router.get('/', hospitalAuth, getHospitalEvents);
router.put('/:eventId/status', hospitalAuth, updateEventStatus);
router.post('/:eventId/register', registerDonor);
router.put('/:eventId/donors/:donorId', hospitalAuth, updateDonorStatus);

export default router;