import { Assignment } from '../models/assignment.model.js';
import { Classroom } from '../models/classroom.model.js';
import { AppError } from '../utils/appError.js';
import { logActivity } from '../utils/activityLogger.js';
import { sendEmail } from '../utils/email.js';

export const assignmentController = {
  async createAssignment(req, res, next) {
    try {
      const {
        title,
        description,
        classroomId,
        subject,
        dueDate,
        totalMarks,
        attachments
      } = req.body;

      const classroom = await Classroom.findById(classroomId)
        .populate('students', 'userId');

      if (!classroom) {
        throw new AppError('Classroom not found', 404);
      }

      const assignment = await Assignment.create({
        title,
        description,
        classroom: classroomId,
        subject,
        teacher: req.user.id,
        dueDate,
        totalMarks,
        attachments
      });

      // Notify students
      for (const student of classroom.students) {
        await sendEmail({
          to: student.userId.email,
          subject: `New Assignment: ${title}`,
          text: `A new assignment "${title}" has been posted.\n\nDue Date: ${new Date(dueDate).toLocaleDateString()}\nTotal Marks: ${totalMarks}\n\nDescription: ${description}`
        });
      }

      await logActivity({
        user: req.user,
        action: 'CREATE',
        resourceType: 'ASSIGNMENT',
        resourceId: assignment._id,
        details: `Created assignment ${title}`,
        req
      });

      res.status(201).json({
        success: true,
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  },

  async submitAssignment(req, res, next) {
    try {
      const { assignmentId } = req.params;
      const { attachments } = req.body;

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new AppError('Assignment not found', 404);
      }

      const submission = {
        student: req.user.id,
        submittedAt: new Date(),
        attachments,
        status: new Date() > assignment.dueDate ? 'late' : 'submitted'
      };

      assignment.submissions.push(submission);
      await assignment.save();

      await logActivity({
        user: req.user,
        action: 'UPDATE',
        resourceType: 'ASSIGNMENT',
        resourceId: assignment._id,
        details: `Submitted assignment ${assignment.title}`,
        req
      });

      res.json({
        success: true,
        data: submission
      });
    } catch (error) {
      next(error);
    }
  },

  async gradeSubmission(req, res, next) {
    try {
      const { assignmentId, submissionId } = req.params;
      const { marks, feedback } = req.body;

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new AppError('Assignment not found', 404);
      }

      const submission = assignment.submissions.id(submissionId);
      if (!submission) {
        throw new AppError('Submission not found', 404);
      }

      submission.marks = marks;
      submission.feedback = feedback;
      submission.status = 'graded';
      await assignment.save();

      // Notify student
      const student = await Student.findById(submission.student).populate('userId');
      await sendEmail({
        to: student.userId.email,
        subject: `Assignment Graded: ${assignment.title}`,
        text: `Your submission for "${assignment.title}" has been graded.\n\nMarks: ${marks}/${assignment.totalMarks}\nFeedback: ${feedback}`
      });

      await logActivity({
        user: req.user,
        action: 'UPDATE',
        resourceType: 'ASSIGNMENT',
        resourceId: assignment._id,
        details: `Graded submission for ${assignment.title}`,
        req
      });

      res.json({
        success: true,
        data: submission
      });
    } catch (error) {
      next(error);
    }
  }
};