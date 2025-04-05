import express from 'express';
import { 
  registerDonor, 
  loginDonor, 
  updateDonorProfile, 
  getDonorProfile,
  recordDonation 
} from '../controllers/donorController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.post('/register', registerDonor);
router.post('/login', loginDonor);
router.get('/profile/:id', authMiddleware, getDonorProfile);
router.put('/profile/:id', authMiddleware, updateDonorProfile);
router.post('/donation/:id', authMiddleware, recordDonation);

export default router;