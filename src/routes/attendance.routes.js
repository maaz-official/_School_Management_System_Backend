import express from 'express';
import { attendanceController } from '../controllers/attendance.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import {
  validateMarkAttendance,
  validateGetAttendanceQuery,
  validateBulkAttendanceQuery
} from '../validators/attendance.validator.js';

const router = express.Router();

router.use(authenticate);

// Mark attendance for a student
router.post('/',
  authorize('teacher'),
  validateMarkAttendance,
  attendanceController.markAttendance
);

// Get attendance for a specific student
router.get('/:studentId',
  authorize('admin', 'teacher', 'student'),
  validateGetAttendanceQuery,
  attendanceController.getAttendance
);

// Get bulk attendance for a class
router.get('/class/bulk',
  authorize('admin', 'teacher'),
  validateBulkAttendanceQuery,
  attendanceController.getBulkAttendance
);

export { router as attendanceRoutes };