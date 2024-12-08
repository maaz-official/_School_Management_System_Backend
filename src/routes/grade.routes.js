import express from 'express';
import { gradeController } from '../controllers/grade.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateGrade, validateGetGradesQuery } from '../validators/grade.validator.js';

const router = express.Router();

router.use(authenticate);

// Add grades for a student
router.post('/',
  authorize('teacher'),
  validateGrade,
  gradeController.addGrades
);

// Get grades for a student
router.get('/:studentId',
  authorize('admin', 'teacher', 'student'),
  validateGetGradesQuery,
  gradeController.getGrades
);

export { router as gradeRoutes };