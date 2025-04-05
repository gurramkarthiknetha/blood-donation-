import express from 'express';
import { 
  registerDonor, 
  loginDonor, 
  updateDonorProfile, 
  recordDonation,
  getDonorProfile 
} from '../controllers/donorController';

const router = express.Router();

router.post('/register', registerDonor);
router.post('/login', loginDonor);
router.put('/:id', updateDonorProfile);
router.post('/:id/donate', recordDonation);
router.get('/:id', getDonorProfile);

export default router;