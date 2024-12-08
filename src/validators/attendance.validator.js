import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const markAttendanceSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  status: z.enum(['present', 'absent', 'late', 'excused'], {
    errorMap: () => ({ message: 'Invalid attendance status' })
  }),
  date: z.string().datetime({ message: 'Invalid date format' }),
  remarks: z.string().optional()
});

const getAttendanceQuerySchema = z.object({
  startDate: z.string().datetime({ message: 'Invalid start date format' }).optional(),
  endDate: z.string().datetime({ message: 'Invalid end date format' }).optional()
});

const getBulkAttendanceQuerySchema = z.object({
  class: z.string().min(1, 'Class is required'),
  section: z.string().min(1, 'Section is required'),
  date: z.string().datetime({ message: 'Invalid date format' })
});

export const validateMarkAttendance = (req, res, next) => {
  try {
    markAttendanceSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};

export const validateGetAttendanceQuery = (req, res, next) => {
  try {
    getAttendanceQuerySchema.parse(req.query);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};

export const validateBulkAttendanceQuery = (req, res, next) => {
  try {
    getBulkAttendanceQuerySchema.parse(req.query);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};