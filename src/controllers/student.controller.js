import { Student } from '../models/student.model.js';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/appError.js';

export const studentController = {
  async getAllStudents(req, res, next) {
    try {
      const students = await Student.find()
        .populate('userId', 'firstName lastName email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        data: students
      });
    } catch (error) {
      next(error);
    }
  },

  async getStudent(req, res, next) {
    try {
      const student = await Student.findById(req.params.id)
        .populate('userId', 'firstName lastName email');

      if (!student) {
        throw new AppError('Student not found', 404);
      }

      // Check if the requesting student can only access their own information
      if (req.user.role === 'student' && req.user.id !== student.userId.toString()) {
        throw new AppError('Unauthorized access', 403);
      }

      res.json({
        success: true,
        data: student
      });
    } catch (error) {
      next(error);
    }
  },

  async createStudent(req, res, next) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        rollNumber,
        class: className,
        section,
        dateOfBirth,
        guardianName,
        guardianContact,
        address
      } = req.body;

      // Create user account
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: 'student'
      });

      // Create student profile
      const student = await Student.create({
        userId: user._id,
        rollNumber,
        class: className,
        section,
        dateOfBirth,
        guardianName,
        guardianContact,
        address
      });

      res.status(201).json({
        success: true,
        data: {
          ...student.toObject(),
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

  async updateStudent(req, res, next) {
    try {
      const student = await Student.findById(req.params.id);
      
      if (!student) {
        throw new AppError('Student not found', 404);
      }

      const updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).populate('userId', 'firstName lastName email');

      res.json({
        success: true,
        data: updatedStudent
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteStudent(req, res, next) {
    try {
      const student = await Student.findById(req.params.id);
      
      if (!student) {
        throw new AppError('Student not found', 404);
      }

      // Delete user account
      await User.findByIdAndDelete(student.userId);
      
      // Delete student profile
      await student.deleteOne();

      res.json({
        success: true,
        message: 'Student deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};