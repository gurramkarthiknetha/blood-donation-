import express from 'express';
import { 
  loginHospital,
  registerHospital,
  getHospitalProfile,
  updateHospitalProfile
} from '../controllers/hospitalController';

const router = express.Router();

router.post('/register', registerHospital);
router.post('/login', loginHospital);
router.get('/:id', getHospitalProfile);
router.put('/:id', updateHospitalProfile);

export default router;