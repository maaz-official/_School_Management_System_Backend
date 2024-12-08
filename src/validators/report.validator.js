import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const reportQuerySchema = z.object({
  semester: z.string().min(1, 'Semester is required'),
  academicYear: z.string().min(1, 'Academic year is required')
});

export const validateReportQuery = (req, res, next) => {
  try {
    reportQuerySchema.parse(req.query);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};