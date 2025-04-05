import express from 'express';
import { loginHospital, registerHospital, updateBloodInventory } from '../controllers/hospitalController.js';

const router = express.Router();

router.post('/login', loginHospital);
router.post('/register', registerHospital);
router.put('/inventory/:id', updateBloodInventory);

export default router;