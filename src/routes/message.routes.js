import express from 'express';
import multer from 'multer';
import { messageController } from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateMessage } from '../validators/message.validator.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.use(authenticate);

router.post('/', upload.array('files', 5), validateMessage, messageController.sendMessage);
router.get('/conversation/:userId', messageController.getConversation);
router.get('/group/:groupId', messageController.getGroupMessages);
router.post('/:messageId/read', messageController.markAsRead);

export { router as messageRoutes };