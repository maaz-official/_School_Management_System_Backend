import { Parent } from '../models/parent.model.js';
import { Student } from '../models/student.model.js';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/appError.js';
import { logActivity } from '../utils/activityLogger.js';

export const parentController = {
  async registerParent(req, res, next) {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        children,
        occupation,
        workPhone,
        emergencyContact,
        address
      } = req.body;

      // Create user account
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        role: 'parent'
      });

      // Verify children exist
      for (const childId of children) {
        const student = await Student.findById(childId);
        if (!student) {
          throw new AppError(`Student with ID ${childId} not found`, 404);
        }
      }

      // Create parent profile
      const parent = await Parent.create({
        userId: user._id,
        children,
        occupation,
        workPhone,
        emergencyContact,
        address
      });

      await logActivity({
        user: req.user,
        action: 'CREATE',
        resourceType: 'PARENT',
        resourceId: parent._id,
        details: `Registered parent account for ${firstName} ${lastName}`,
        req
      });

      res.status(201).json({
        success: true,
        data: {
          ...parent.toObject(),
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

  async getParentDashboard(req, res, next) {
    try {
      const parent = await Parent.findOne({ userId: req.user.id })
        .populate({
          path: 'children',
          populate: [
            {
              path: 'userId',
              select: 'firstName lastName email'
            },
            {
              path: 'grades',
              select: 'subject marks examType semester academicYear'
            },
            {
              path: 'attendance',
              select: 'date status remarks'
            }
          ]
        });

      if (!parent) {
        throw new AppError('Parent profile not found', 404);
      }

      const childrenData = await Promise.all(parent.children.map(async child => {
        const recentGrades = await Grade.find({ student: child._id })
          .sort({ createdAt: -1 })
          .limit(5);

        const recentAttendance = await Attendance.find({ student: child._id })
          .sort({ date: -1 })
          .limit(5);

        const upcomingAssignments = await Assignment.find({
          'submissions.student': child._id,
          dueDate: { $gte: new Date() }
        }).sort({ dueDate: 1 });

        return {
          studentInfo: {
            id: child._id,
            name: `${child.userId.firstName} ${child.userId.lastName}`,
            class: child.class,
            section: child.section
          },
          recentGrades,
          recentAttendance,
          upcomingAssignments
        };
      }));

      res.json({
        success: true,
        data: {
          parentInfo: {
            name: `${req.user.firstName} ${req.user.lastName}`,
            email: req.user.email,
            workPhone: parent.workPhone
          },
          children: childrenData
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async updateParentProfile(req, res, next) {
    try {
      const parent = await Parent.findOneAndUpdate(
        { userId: req.user.id },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!parent) {
        throw new AppError('Parent profile not found', 404);
      }

      await logActivity({
        user: req.user,
        action: 'UPDATE',
        resourceType: 'PARENT',
        resourceId: parent._id,
        details: 'Updated parent profile',
        req
      });

      res.json({
        success: true,
        data: parent
      });
    } catch (error) {
      next(error);
    }
  }
};