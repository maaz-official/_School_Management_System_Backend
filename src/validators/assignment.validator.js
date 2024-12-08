import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const assignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  classroomId: z.string().min(1, 'Classroom ID is required'),
  subject: z.string().min(1, 'Subject is required'),
  dueDate: z.string().datetime({ message: 'Invalid due date format' }),
  totalMarks: z.number().min(0, 'Total marks must be non-negative'),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string()
  })).optional()
});

const submissionSchema = z.object({
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string().url(),
    type: z.string()
  })).min(1, 'At least one attachment is required')
});

export const validateAssignment = (req, res, next) => {
  try {
    assignmentSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};

export const validateSubmission = (req, res, next) => {
  try {
    submissionSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};