import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const gradeSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  subject: z.string().min(1, 'Subject is required'),
  examType: z.enum(['quiz', 'midterm', 'final', 'assignment', 'project'], {
    errorMap: () => ({ message: 'Invalid exam type' })
  }),
  marks: z.object({
    obtained: z.number().min(0, 'Obtained marks must be non-negative'),
    total: z.number().min(1, 'Total marks must be positive')
  }).refine(data => data.obtained <= data.total, {
    message: 'Obtained marks cannot exceed total marks'
  }),
  semester: z.string().min(1, 'Semester is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  remarks: z.string().optional()
});

const getGradesQuerySchema = z.object({
  semester: z.string().optional(),
  academicYear: z.string().optional(),
  subject: z.string().optional()
});

export const validateGrade = (req, res, next) => {
  try {
    gradeSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};

export const validateGetGradesQuery = (req, res, next) => {
  try {
    getGradesQuerySchema.parse(req.query);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};