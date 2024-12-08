import { z } from 'zod';
import { AppError } from '../utils/appError.js';

const classroomSchema = z.object({
  name: z.string().min(1, 'Classroom name is required'),
  grade: z.string().min(1, 'Grade is required'),
  section: z.string().min(1, 'Section is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  subjects: z.array(z.object({
    name: z.string().min(1, 'Subject name is required'),
    teacher: z.string().min(1, 'Subject teacher ID is required'),
    schedule: z.array(z.object({
      day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']),
      startTime: z.string(),
      endTime: z.string()
    }))
  })).min(1, 'At least one subject is required'),
  academicYear: z.string().min(1, 'Academic year is required')
});

export const validateClassroom = (req, res, next) => {
  try {
    classroomSchema.parse(req.body);
    next();
  } catch (error) {
    next(new AppError(error.errors[0].message, 400));
  }
};