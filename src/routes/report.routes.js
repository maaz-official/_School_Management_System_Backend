import express from 'express';
import { reportController } from '../controllers/report.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateReportQuery } from '../validators/report.validator.js';

const router = express.Router();

router.use(authenticate);

// Generate student performance report
router.get(
  '/student/:studentId',
  authorize('admin', 'teacher', 'student', 'parent'),
  validateReportQuery,
  reportController.generateStudentReport
);

// Generate class performance report
router.get(
  '/class/:classId',
  authorize('admin', 'teacher'),
  validateReportQuery,
  reportController.generateClassReport
);

export { router as reportRoutes };