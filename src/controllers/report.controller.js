import { ReportGenerator } from '../utils/reportGenerator.js';
import { AppError } from '../utils/appError.js';
import { logActivity } from '../utils/activityLogger.js';

export const reportController = {
  async generateStudentReport(req, res, next) {
    try {
      const { studentId } = req.params;
      const { semester, academicYear } = req.query;

      // Check access permissions
      if (req.user.role === 'student' && req.user.id !== studentId) {
        throw new AppError('Unauthorized access', 403);
      }

      const reportGenerator = new ReportGenerator();
      const doc = await reportGenerator.generateStudentReport(studentId, semester, academicYear);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=student_report_${studentId}.pdf`);

      // Stream the PDF
      doc.pipe(res);
      doc.end();

      await logActivity({
        user: req.user,
        action: 'READ',
        resourceType: 'REPORT',
        resourceId: studentId,
        details: `Generated student report for ${studentId}`,
        req
      });
    } catch (error) {
      next(error);
    }
  },

  async generateClassReport(req, res, next) {
    try {
      const { classId } = req.params;
      const { semester, academicYear } = req.query;

      const reportGenerator = new ReportGenerator();
      const doc = await reportGenerator.generateClassReport(classId, semester, academicYear);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=class_report_${classId}.pdf`);

      // Stream the PDF
      doc.pipe(res);
      doc.end();

      await logActivity({
        user: req.user,
        action: 'READ',
        resourceType: 'REPORT',
        resourceId: classId,
        details: `Generated class report for ${classId}`,
        req
      });
    } catch (error) {
      next(error);
    }
  }
};