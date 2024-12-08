import express from 'express';
import { feeController } from '../controllers/fee.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('admin'), feeController.addFees);
router.get('/:studentId', authorize('admin', 'student'), feeController.getFees);

export { router as feeRoutes };