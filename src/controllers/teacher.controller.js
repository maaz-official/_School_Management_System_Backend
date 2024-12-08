import { Teacher } from '../models/teacher.model.js';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/appError.js';
import { sendEmail } from '../utils/email.js';

export const teacherController = {
  async getAllTeachers(req, res, next) {
    try {
      const teachers = await Teacher.find()
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: teachers
      });
    } catch (error) {
      next(error);
    }
  },

  async getTeacher(req, res, next) {
    try {
      const teacher = await Teacher.findById(req.params.id)
        .populate('userId', 'firstName lastName email');

      if (!teacher) {
        throw new AppError('Teacher not found', 404);
      }

      // Check if the requesting teacher can only access their own information
      if (req.user.role === 'teacher' && req.user.id !== teacher.userId.toString()) {
        throw new AppError('Unauthorized access', 403);
      }

      res.json({
        success: true,
        data: teacher
      });
    } catch (error) {
      next(error);
    }
  },

  async createTeacher(req, res, next) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        employeeId,
        subjects,
        classes,
        qualification,
        specialization,
        experience,
        contactNumber,
        address
      } = req.body;

      // Create user account
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: 'teacher'
      });

      // Create teacher profile
      const teacher = await Teacher.create({
        userId: user._id,
        employeeId,
        subjects,
        classes,
        qualification,
        specialization,
        experience,
        contactNumber,
        address
      });

      // Send welcome email
      await sendEmail({
        to: email,
        subject: 'Welcome to Our School',
        text: `Dear ${firstName} ${lastName},\n\nWelcome to our school! Your account has been created successfully.\n\nBest regards,\nSchool Management Team`
      });

      res.status(201).json({
        success: true,
        data: {
          ...teacher.toObject(),
          user: {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTeacher(req, res, next) {
    try {
      const teacher = await Teacher.findById(req.params.id);
      
      if (!teacher) {
        throw new AppError('Teacher not found', 404);
      }

      const updatedTeacher = await Teacher.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate('userId', 'firstName lastName email');

      res.json({
        success: true,
        data: updatedTeacher
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteTeacher(req, res, next) {
    try {
      const teacher = await Teacher.findById(req.params.id);
      
      if (!teacher) {
        throw new AppError('Teacher not found', 404);
      }

      // Delete user account
      await User.findByIdAndDelete(teacher.userId);
      
      // Delete teacher profile
      await teacher.deleteOne();

      res.json({
        success: true,
        message: 'Teacher deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  async getTeacherClasses(req, res, next) {
    try {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      
      if (!teacher) {
        throw new AppError('Teacher not found', 404);
      }

      res.json({
        success: true,
        data: teacher.classes
      });
    } catch (error) {
      next(error);
    }
  }
};