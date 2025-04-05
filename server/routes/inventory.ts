import express from 'express';
import { hospitalAuth } from '../middleware/hospitalAuth';
import {
  getInventoryHistory,
  getUsageStats,
  recordBloodUsage,
  updateInventory
} from '../controllers/inventoryController';

const router = express.Router();

router.get('/history', hospitalAuth, getInventoryHistory);
router.get('/usage', hospitalAuth, getUsageStats);
router.post('/usage', hospitalAuth, recordBloodUsage);
router.put('/', hospitalAuth, updateInventory);

export default router;