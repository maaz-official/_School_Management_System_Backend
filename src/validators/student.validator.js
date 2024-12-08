import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const studentSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  class: z.string().min(1, 'Class is required'),
  section: z.string().min(1, 'Section is required'),
  dateOfBirth: z.string().datetime({ message: 'Invalid date format' }),
  guardianName: z.string().min(2, 'Guardian name must be at least 2 characters'),
  guardianContact: z.string().min(10, 'Invalid contact number'),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional()
  }).optional()
});

export const validateStudent = (req, res, next) => {
  try {
    studentSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};