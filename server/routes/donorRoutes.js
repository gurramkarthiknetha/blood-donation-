import express from 'express';
import { loginDonor, getDonorProfile } from '../controllers/donorController.js';

const router = express.Router();

router.post('/login', loginDonor);
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, bloodGroup, phoneNumber, address, location } = req.body;
    
    // Basic validation
    if (!fullName || !email || !password || !bloodGroup || !phoneNumber || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // TODO: Add proper user creation in database
    // For now, just return success
    res.status(201).json({ message: 'Donor registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/profile/:id', getDonorProfile);

export default router;