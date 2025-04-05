import express from 'express';
import { donorAuth } from '../middleware/donorAuth';
import {
  getAvailableEvents,
  registerForEvent,
  getRegisteredEvents
} from '../controllers/donorEventController';

const router = express.Router();

router.get('/events', donorAuth, getAvailableEvents);
router.post('/events/:eventId/register', donorAuth, registerForEvent);
router.get('/events/registered', donorAuth, getRegisteredEvents);

export default router;