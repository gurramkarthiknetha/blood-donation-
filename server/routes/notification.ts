import express from 'express';
import { hospitalAuth } from '../middleware/hospitalAuth';
import {
  getHospitalNotifications,
  markNotificationsAsRead
} from '../controllers/notificationController';

const router = express.Router();

router.get('/', hospitalAuth, getHospitalNotifications);
router.put('/mark-read', hospitalAuth, markNotificationsAsRead);

export default router;