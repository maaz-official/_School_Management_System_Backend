import express from 'express';
import { pollController } from '../controllers/poll.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { validatePoll } from '../validators/poll.validator.js';

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('teacher', 'admin'), validatePoll, pollController.createPoll);
router.post('/:pollId/vote/:optionId', pollController.vote);
router.get('/:pollId/results', pollController.getPollResults);

export { router as pollRoutes };