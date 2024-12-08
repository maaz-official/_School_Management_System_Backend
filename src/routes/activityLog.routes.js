import express from 'express';
import { activityLogController } from '../controllers/activityLog.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin'), activityLogController.getActivityLogs);
router.get('/my-activities', activityLogController.getUserActivityLogs);

export { router as activityLogRoutes };