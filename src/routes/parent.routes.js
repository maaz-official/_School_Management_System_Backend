import express from 'express';
import { parentController } from '../controllers/parent.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validateParent } from '../validators/parent.validator.js';

const router = express.Router();

router.use(authenticate);

router.post('/register', authorize('admin'), validateParent, parentController.registerParent);
router.get('/dashboard', authorize('parent'), parentController.getParentDashboard);
router.put('/profile', authorize('parent'), validateParent, parentController.updateParentProfile);

export { router as parentRoutes };