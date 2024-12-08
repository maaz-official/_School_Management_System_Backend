import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const teacherSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  classes: z.array(z.object({
    class: z.string().min(1, 'Class is required'),
    section: z.string().min(1, 'Section is required')
  })).min(1, 'At least one class is required'),
  qualification: z.string().min(1, 'Qualification is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  experience: z.number().min(0, 'Experience must be a positive number'),
  contactNumber: z.string().min(10, 'Invalid contact number'),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional()
  }).optional()
});

export const validateTeacher = (req, res, next) => {
  try {
    teacherSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};