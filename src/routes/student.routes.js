import express from 'express';
import { studentController } from '../controllers/student.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin', 'teacher'), studentController.getAllStudents);
router.get('/:id', authorize('admin', 'teacher', 'student'), studentController.getStudent);
router.post('/', authorize('admin'), studentController.createStudent);
router.put('/:id', authorize('admin'), studentController.updateStudent);
router.delete('/:id', authorize('admin'), studentController.deleteStudent);

export { router as studentRoutes };