import { Classroom } from '../models/classroom.model.js';
import { Teacher } from '../models/teacher.model.js';
import { AppError } from '../utils/appError.js';
import { logActivity } from '../utils/activityLogger.js';

export const classroomController = {
  async createClassroom(req, res, next) {
    try {
      const { name, grade, section, teacherId, subjects, academicYear } = req.body;

      const classroom = await Classroom.create({
        name,
        grade,
        section,
        teacher: teacherId,
        subjects,
        academicYear
      });

      await logActivity({
        user: req.user,
        action: 'CREATE',
        resourceType: 'CLASSROOM',
        resourceId: classroom._id,
        details: `Created classroom ${name}`,
        req
      });

      res.status(201).json({
        success: true,
        data: classroom
      });
    } catch (error) {
      next(error);
    }
  },

  async getClassrooms(req, res, next) {
    try {
      const { role, id: userId } = req.user;
      let query = {};

      if (role === 'teacher') {
        const teacher = await Teacher.findOne({ userId });
        query = { teacher: teacher._id };
      }

      const classrooms = await Classroom.find(query)
        .populate('teacher', 'userId')
        .populate('students', 'userId')
        .populate('subjects.teacher', 'userId');

      res.json({
        success: true,
        data: classrooms
      });
    } catch (error) {
      next(error);
    }
  },

  async getClassroom(req, res, next) {
    try {
      const classroom = await Classroom.findById(req.params.id)
        .populate('teacher', 'userId')
        .populate('students', 'userId')
        .populate('subjects.teacher', 'userId');

      if (!classroom) {
        throw new AppError('Classroom not found', 404);
      }

      res.json({
        success: true,
        data: classroom
      });
    } catch (error) {
      next(error);
    }
  },

  async updateClassroom(req, res, next) {
    try {
      const classroom = await Classroom.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!classroom) {
        throw new AppError('Classroom not found', 404);
      }

      await logActivity({
        user: req.user,
        action: 'UPDATE',
        resourceType: 'CLASSROOM',
        resourceId: classroom._id,
        details: `Updated classroom ${classroom.name}`,
        req
      });

      res.json({
        success: true,
        data: classroom
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteClassroom(req, res, next) {
    try {
      const classroom = await Classroom.findByIdAndDelete(req.params.id);

      if (!classroom) {
        throw new AppError('Classroom not found', 404);
      }

      await logActivity({
        user: req.user,
        action: 'DELETE',
        resourceType: 'CLASSROOM',
        resourceId: classroom._id,
        details: `Deleted classroom ${classroom.name}`,
        req
      });

      res.json({
        success: true,
        message: 'Classroom deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};