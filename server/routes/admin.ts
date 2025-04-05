import express from 'express';
import { adminAuth } from '../middleware/adminAuth';
import {
  loginAdmin,
  createAdmin,
  getDashboardStats,
  approveBloodRequest,
  rejectBloodRequest,
  getAllBloodRequests,
  getHospitalStats,
  getDonorStats,
  manageHospital,
  manageDonor
} from '../controllers/adminController';

const router = express.Router();

// Auth routes
router.post('/login', loginAdmin);
router.post('/create', adminAuth, createAdmin);

// Dashboard routes
router.get('/dashboard/stats', adminAuth, getDashboardStats);
router.get('/dashboard/hospitals', adminAuth, getHospitalStats);
router.get('/dashboard/donors', adminAuth, getDonorStats);

// Blood request management
router.get('/requests', adminAuth, getAllBloodRequests);
router.put('/requests/:requestId/approve', adminAuth, approveBloodRequest);
router.put('/requests/:requestId/reject', adminAuth, rejectBloodRequest);

// Hospital and donor management
router.put('/hospitals/:hospitalId', adminAuth, manageHospital);
router.put('/donors/:donorId', adminAuth, manageDonor);

export default router;