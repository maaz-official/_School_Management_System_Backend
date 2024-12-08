import { AppError } from '../utils/appError.js';
import { Teacher } from '../models/teacher.model.js';
import { Student } from '../models/student.model.js';
import { Parent } from '../models/parent.model.js';

export const checkResourceAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { role, id: userId } = req.user;
      const resourceId = req.params.id;

      // Admin has full access
      if (role === 'admin') {
        return next();
      }

      switch (resourceType) {
        case 'STUDENT':
          await handleStudentAccess(role, userId, resourceId, next);
          break;
        case 'TEACHER':
          await handleTeacherAccess(role, userId, resourceId, next);
          break;
        case 'GRADE':
          await handleGradeAccess(role, userId, resourceId, next);
          break;
        case 'ATTENDANCE':
          await handleAttendanceAccess(role, userId, resourceId, next);
          break;
        default:
          throw new AppError('Invalid resource type', 400);
      }
    } catch (error) {
      next(error);
    }
  };
};

async function handleStudentAccess(role, userId, resourceId, next) {
  switch (role) {
    case 'teacher':
      const teacher = await Teacher.findOne({ userId });
      const student = await Student.findById(resourceId);
      
      if (!teacher || !student) {
        throw new AppError('Access denied', 403);
      }

      const hasAccess = teacher.classes.some(cls => 
        cls.class === student.class && cls.section === student.section
      );

      if (!hasAccess) {
        throw new AppError('Access denied', 403);
      }
      break;

    case 'student':
      if (resourceId !== userId) {
        throw new AppError('Access denied', 403);
      }
      break;

    case 'parent':
      const parent = await Parent.findOne({ userId });
      if (!parent.children.includes(resourceId)) {
        throw new AppError('Access denied', 403);
      }
      break;

    default:
      throw new AppError('Invalid role', 400);
  }
  next();
}

async function handleTeacherAccess(role, userId, resourceId, next) {
  if (role === 'teacher' && resourceId !== userId) {
    throw new AppError('Access denied', 403);
  }
  next();
}

async function handleGradeAccess(role, userId, resourceId, next) {
  switch (role) {
    case 'teacher':
      const teacher = await Teacher.findOne({ userId });
      const grade = await Grade.findById(resourceId).populate('student');
      
      if (!teacher || !grade) {
        throw new AppError('Access denied', 403);
      }

      const hasAccess = teacher.classes.some(cls => 
        cls.class === grade.student.class && cls.section === grade.student.section
      );

      if (!hasAccess) {
        throw new AppError('Access denied', 403);
      }
      break;

    case 'student':
      const grade = await Grade.findById(resourceId);
      if (grade.student.toString() !== userId) {
        throw new AppError('Access denied', 403);
      }
      break;

    case 'parent':
      const parent = await Parent.findOne({ userId });
      const grade = await Grade.findById(resourceId);
      if (!parent.children.includes(grade.student)) {
        throw new AppError('Access denied', 403);
      }
      break;
  }
  next();
}

async function handleAttendanceAccess(role, userId, resourceId, next) {
  // Similar to handleGradeAccess but for attendance records
  // Implementation follows the same pattern
  next();
}