import express from 'express';
import { assignmentController } from '../controllers/assignment.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateAssignment, validateSubmission } from '../validators/assignment.validator.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('teacher'), validateAssignment, assignmentController.createAssignment);
router.post('/:assignmentId/submit', authorize('student'), validateSubmission, assignmentController.submitAssignment);
router.post('/:assignmentId/submissions/:submissionId/grade', authorize('teacher'), assignmentController.gradeSubmission);

export { router as assignmentRoutes };