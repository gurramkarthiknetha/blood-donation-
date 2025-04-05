import express from 'express';
import {
  loginAdmin,
  createAdmin,
  getDashboardStats,
  getHospitalStats,
  getDonorStats,
  getAllBloodRequests,
  approveBloodRequest,
  rejectBloodRequest,
  manageHospital,
  manageDonor
} from '../controllers/adminController';

const router = express.Router();

router.post('/login', loginAdmin);
router.post('/create', createAdmin);
router.get('/dashboard', getDashboardStats);
router.get('/hospitals', getHospitalStats);
router.get('/donors', getDonorStats);
router.get('/requests', getAllBloodRequests);
router.put('/requests/:requestId/approve', approveBloodRequest);
router.put('/requests/:requestId/reject', rejectBloodRequest);
router.put('/hospitals/:hospitalId', manageHospital);
router.put('/donors/:donorId', manageDonor);

export default router;