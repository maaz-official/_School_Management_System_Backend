import express from 'express';
import { teacherController } from '../controllers/teacher.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateTeacher } from '../validators/teacher.validator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', authorize('admin'), teacherController.getAllTeachers);
router.get('/classes', authorize('teacher'), teacherController.getTeacherClasses);
router.get('/:id', authorize('admin', 'teacher'), teacherController.getTeacher);
router.post('/', authorize('admin'), validateTeacher, teacherController.createTeacher);
router.put('/:id', authorize('admin'), validateTeacher, teacherController.updateTeacher);
router.delete('/:id', authorize('admin'), teacherController.deleteTeacher);

export { router as teacherRoutes };