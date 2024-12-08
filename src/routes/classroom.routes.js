import express from 'express';
import { classroomController } from '../controllers/classroom.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateClassroom } from '../validators/classroom.validator.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('admin'), validateClassroom, classroomController.createClassroom);
router.get('/', classroomController.getClassrooms);
router.get('/:id', classroomController.getClassroom);
router.put('/:id', authorize('admin'), validateClassroom, classroomController.updateClassroom);
router.delete('/:id', authorize('admin'), classroomController.deleteClassroom);

export { router as classroomRoutes };