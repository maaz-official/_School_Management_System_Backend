import express from 'express';
import { feeController } from '../controllers/fee.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('admin'), feeController.addFee);
router.post('/:feeId/payment', authorize('admin'), feeController.recordPayment);
router.get('/:studentId', authorize('admin', 'student'), feeController.getFeeDetails);
router.put('/:feeId', authorize('admin'), feeController.updateFee);

export { router as feeRoutes };