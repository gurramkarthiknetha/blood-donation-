import { Router } from 'express';
import { login, registerDonor, registerHospital } from '../controllers/authController';

const router = Router();

router.post('/donor/register', registerDonor);
router.post('/hospital/register', registerHospital);
router.post('/:role/login', login);

export default router;