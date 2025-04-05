import express from 'express';
import { loginDonor, registerDonor, getDonorProfile } from '../controllers/donorController.js';

const router = express.Router();

router.post('/login', loginDonor);
router.post('/register', registerDonor);
router.get('/profile/:id', getDonorProfile);

export default router;