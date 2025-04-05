import express from 'express';
import { login, register } from '../controllers/authController';

const router = express.Router();

// Login routes for all user types
router.post('/:role/login', login);

// Registration routes (except admin)
router.post('/:role/register', register);

export default router;