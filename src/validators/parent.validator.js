import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const parentSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  children: z.array(z.string()).min(1, 'At least one child must be specified'),
  occupation: z.string().optional(),
  workPhone: z.string().min(10, 'Invalid work phone number'),
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name must be at least 2 characters'),
    relationship: z.string().min(2, 'Relationship must be specified'),
    phone: z.string().min(10, 'Invalid emergency contact phone number')
  }),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional()
  }).optional()
});

export const validateParent = (req, res, next) => {
  try {
    parentSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};