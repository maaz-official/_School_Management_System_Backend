import { Attendance } from '../models/attendance.model.js';
import { Student } from '../models/student.model.js';
import { Teacher } from '../models/teacher.model.js';
import { AppError } from '../utils/appError.js';
import { sendEmail } from '../utils/email.js';

export const attendanceController = {
  async markAttendance(req, res, next) {
    try {
      const { studentId, status, date, remarks } = req.body;

      // Verify the student exists
      const student = await Student.findById(studentId).populate('userId');
      if (!student) {
        throw new AppError('Student not found', 404);
      }

      // Get teacher information
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) {
        throw new AppError('Teacher not found', 404);
      }

      // Verify teacher teaches this student's class
      const teachesClass = teacher.classes.some(
        cls => cls.class === student.class && cls.section === student.section
      );
      if (!teachesClass) {
        throw new AppError('Unauthorized to mark attendance for this student', 403);
      }

      // Create or update attendance record
      const attendance = await Attendance.findOneAndUpdate(
        {
          student: studentId,
          date: new Date(date)
        },
        {
          student: studentId,
          class: student.class,
          section: student.section,
          date: new Date(date),
          status,
          markedBy: teacher._id,
          remarks
        },
        { new: true, upsert: true, runValidators: true }
      );

      // If student is absent, send notification email
      if (status === 'absent') {
        await sendEmail({
          to: student.userId.email,
          subject: 'Attendance Notification',
          text: `Dear ${student.userId.firstName} ${student.userId.lastName},\n\nThis is to inform you that you were marked absent on ${new Date(date).toLocaleDateString()}.\n\nRemarks: ${remarks || 'No remarks provided'}\n\nBest regards,\nSchool Management Team`
        });
      }

      res.status(201).json({
        success: true,
        data: attendance
      });
    } catch (error) {
      next(error);
    }
  },

  async getAttendance(req, res, next) {
    try {
      const { studentId } = req.params;
      const { startDate, endDate } = req.query;

      // Verify authorization
      if (req.user.role === 'student' && req.user.id !== studentId) {
        throw new AppError('Unauthorized access', 403);
      }

      // Build query
      const query = { student: studentId };
      if (startDate && endDate) {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const attendance = await Attendance.find(query)
        .populate('markedBy', 'userId')
        .populate('student', 'userId class section')
        .sort({ date: -1 });

      // Calculate attendance statistics
      const stats = attendance.reduce((acc, curr) => {
        acc.total++;
        acc[curr.status]++;
        return acc;
      }, { total: 0, present: 0, absent: 0, late: 0, excused: 0 });

      res.json({
        success: true,
        data: {
          attendance,
          stats,
          attendancePercentage: ((stats.present + stats.late) / stats.total * 100).toFixed(2)
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getBulkAttendance(req, res, next) {
    try {
      const { class: className, section, date } = req.query;

      // Verify teacher teaches this class
      if (req.user.role === 'teacher') {
        const teacher = await Teacher.findOne({ userId: req.user.id });
        const teachesClass = teacher.classes.some(
          cls => cls.class === className && cls.section === section
        );
        if (!teachesClass) {
          throw new AppError('Unauthorized to view attendance for this class', 403);
        }
      }

      const attendance = await Attendance.find({
        class: className,
        section,
        date: new Date(date)
      })
        .populate('student', 'userId class section')
        .populate('markedBy', 'userId');

      res.json({
        success: true,
        data: attendance
      });
    } catch (error) {
      next(error);
    }
  }
};