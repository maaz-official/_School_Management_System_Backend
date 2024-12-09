import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const messageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  content: z.string().min(1, 'Message content is required'),
  type: z.enum(['TEXT', 'FILE']).default('TEXT')
});

export const validateMessage = (req, res, next) => {
  try {
    messageSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};