import { Grade } from '../models/grade.model.js';
import { Student } from '../models/student.model.js';
import { Teacher } from '../models/teacher.model.js';
import { AppError } from '../utils/appError.js';
import { sendEmail } from '../utils/email.js';

export const gradeController = {
  async addGrades(req, res, next) {
    try {
      const {
        studentId,
        subject,
        examType,
        marks,
        semester,
        academicYear,
        remarks
      } = req.body;

      // Verify student exists
      const student = await Student.findById(studentId).populate('userId');
      if (!student) {
        throw new AppError('Student not found', 404);
      }

      // Get teacher information
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) {
        throw new AppError('Teacher not found', 404);
      }

      // Verify teacher teaches this subject
      if (!teacher.subjects.includes(subject)) {
        throw new AppError('Unauthorized to grade this subject', 403);
      }

      // Create grade entry
      const grade = await Grade.create({
        student: studentId,
        subject,
        examType,
        marks,
        semester,
        academicYear,
        gradedBy: teacher._id,
        remarks
      });

      // Send email notification
      await sendEmail({
        to: student.userId.email,
        subject: 'New Grade Posted',
        text: `Dear ${student.userId.firstName} ${student.userId.lastName},

A new grade has been posted for ${subject}.

Exam Type: ${examType}
Marks: ${marks.obtained}/${marks.total}
Semester: ${semester}
Academic Year: ${academicYear}
Remarks: ${remarks || 'No remarks provided'}

Best regards,
School Management Team`
      });

      res.status(201).json({
        success: true,
        data: grade
      });
    } catch (error) {
      next(error);
    }
  },

  async getGrades(req, res, next) {
    try {
      const { studentId } = req.params;
      const { semester, academicYear, subject } = req.query;

      // Verify authorization
      if (req.user.role === 'student' && req.user.id !== studentId) {
        throw new AppError('Unauthorized access', 403);
      }

      // Build query
      const query = { student: studentId };
      if (semester) query.semester = semester;
      if (academicYear) query.academicYear = academicYear;
      if (subject) query.subject = subject;

      const grades = await Grade.find(query)
        .populate('gradedBy', 'userId')
        .populate('student', 'userId class section')
        .sort({ submissionDate: -1 });

      // Calculate statistics
      const statistics = grades.reduce((acc, grade) => {
        const percentage = (grade.marks.obtained / grade.marks.total) * 100;
        
        if (!acc.subjects[grade.subject]) {
          acc.subjects[grade.subject] = {
            total: 0,
            count: 0,
            highest: 0,
            lowest: 100
          };
        }

        const subjectStats = acc.subjects[grade.subject];
        subjectStats.total += percentage;
        subjectStats.count++;
        subjectStats.highest = Math.max(subjectStats.highest, percentage);
        subjectStats.lowest = Math.min(subjectStats.lowest, percentage);
        
        return acc;
      }, { subjects: {} });

      // Calculate averages
      Object.keys(statistics.subjects).forEach(subject => {
        const subjectStats = statistics.subjects[subject];
        subjectStats.average = subjectStats.total / subjectStats.count;
      });

      res.json({
        success: true,
        data: {
          grades,
          statistics
        }
      });
    } catch (error) {
      next(error);
    }
  }
};