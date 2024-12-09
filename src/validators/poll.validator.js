import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const pollSchema = z.object({
  title: z.string().min(1, 'Poll title is required'),
  description: z.string().optional(),
  options: z.array(z.string()).min(2, 'At least two options are required'),
  groupId: z.string().min(1, 'Group ID is required'),
  expiresAt: z.string().datetime('Invalid expiration date'),
  allowMultipleVotes: z.boolean().default(false)
});

export const validatePoll = (req, res, next) => {
  try {
    pollSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};