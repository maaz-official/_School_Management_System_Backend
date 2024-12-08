import PDFDocument from 'pdfkit';
import { Student } from '../models/student.model.js';
import { Grade } from '../models/grade.model.js';
import { Attendance } from '../models/attendance.model.js';
import { Assignment } from '../models/assignment.model.js';

export class ReportGenerator {
  constructor() {
    this.doc = new PDFDocument();
  }

  // Header section for all reports
  addHeader(title) {
    this.doc
      .fontSize(20)
      .text('School Management System', { align: 'center' })
      .fontSize(16)
      .text(title, { align: 'center' })
      .moveDown();
  }

  // Footer section with page numbers
  addFooter() {
    const pages = this.doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      this.doc.switchToPage(i);
      this.doc
        .fontSize(8)
        .text(
          `Page ${i + 1} of ${pages.count}`,
          50,
          this.doc.page.height - 50,
          { align: 'center' }
        );
    }
  }

  async generateStudentReport(studentId, semester, academicYear) {
    const student = await Student.findById(studentId).populate('userId');
    const grades = await Grade.find({ 
      student: studentId,
      semester,
      academicYear 
    });
    const attendance = await Attendance.find({ student: studentId });
    const assignments = await Assignment.find({
      'submissions.student': studentId
    });

    // Basic Information
    this.doc
      .fontSize(14)
      .text('Student Information')
      .fontSize(12)
      .text(`Name: ${student.userId.firstName} ${student.userId.lastName}`)
      .text(`Roll Number: ${student.rollNumber}`)
      .text(`Class: ${student.class} - Section: ${student.section}`)
      .moveDown();

    // Academic Performance
    this.doc
      .fontSize(14)
      .text('Academic Performance')
      .moveDown();

    // Create grades table
    const gradesTable = {
      headers: ['Subject', 'Exam Type', 'Marks Obtained', 'Total Marks', 'Percentage'],
      rows: grades.map(grade => [
        grade.subject,
        grade.examType,
        grade.marks.obtained.toString(),
        grade.marks.total.toString(),
        `${((grade.marks.obtained / grade.marks.total) * 100).toFixed(2)}%`
      ])
    };

    this.createTable(gradesTable);
    this.doc.moveDown();

    // Attendance Summary
    const attendanceStats = this.calculateAttendanceStats(attendance);
    this.doc
      .fontSize(14)
      .text('Attendance Summary')
      .fontSize(12)
      .text(`Present: ${attendanceStats.present} days`)
      .text(`Absent: ${attendanceStats.absent} days`)
      .text(`Late: ${attendanceStats.late} days`)
      .text(`Attendance Percentage: ${attendanceStats.percentage}%`)
      .moveDown();

    // Assignment Performance
    this.doc
      .fontSize(14)
      .text('Assignment Performance')
      .moveDown();

    const assignmentStats = this.calculateAssignmentStats(assignments, studentId);
    const assignmentTable = {
      headers: ['Title', 'Status', 'Marks', 'Submission Date'],
      rows: assignmentStats.assignments.map(assignment => [
        assignment.title,
        assignment.status,
        assignment.marks || 'N/A',
        assignment.submissionDate || 'N/A'
      ])
    };

    this.createTable(assignmentTable);
    this.doc.moveDown();

    // Overall Statistics
    this.doc
      .fontSize(14)
      .text('Overall Performance')
      .fontSize(12)
      .text(`Average Grade: ${this.calculateAverageGrade(grades)}%`)
      .text(`Assignments Completed: ${assignmentStats.completed}/${assignmentStats.total}`)
      .text(`On-time Submissions: ${assignmentStats.onTime}/${assignmentStats.total}`);

    return this.doc;
  }

  async generateClassReport(classId, semester, academicYear) {
    const classroom = await Classroom.findById(classId)
      .populate('students')
      .populate('teacher');

    this.addHeader(`Class Report - ${classroom.grade} ${classroom.section}`);

    // Class Information
    this.doc
      .fontSize(14)
      .text('Class Information')
      .fontSize(12)
      .text(`Class Teacher: ${classroom.teacher.userId.firstName} ${classroom.teacher.userId.lastName}`)
      .text(`Total Students: ${classroom.students.length}`)
      .moveDown();

    // Performance Summary
    const performanceData = await this.getClassPerformanceData(classroom.students, semester, academicYear);
    
    this.doc
      .fontSize(14)
      .text('Performance Summary')
      .moveDown();

    const performanceTable = {
      headers: ['Subject', 'Class Average', 'Highest Score', 'Lowest Score'],
      rows: performanceData.map(data => [
        data.subject,
        `${data.average}%`,
        `${data.highest}%`,
        `${data.lowest}%`
      ])
    };

    this.createTable(performanceTable);
    this.doc.moveDown();

    return this.doc;
  }

  createTable({ headers, rows }) {
    const columnWidth = 100;
    const startX = 50;
    let startY = this.doc.y;

    // Draw headers
    headers.forEach((header, i) => {
      this.doc
        .fontSize(10)
        .text(header, startX + (i * columnWidth), startY, {
          width: columnWidth,
          align: 'left'
        });
    });

    startY += 20;

    // Draw rows
    rows.forEach(row => {
      row.forEach((cell, i) => {
        this.doc
          .fontSize(10)
          .text(cell, startX + (i * columnWidth), startY, {
            width: columnWidth,
            align: 'left'
          });
      });
      startY += 20;
    });

    this.doc.y = startY;
  }

  calculateAttendanceStats(attendance) {
    return attendance.reduce((stats, record) => {
      stats[record.status]++;
      stats.total++;
      return stats;
    }, {
      present: 0,
      absent: 0,
      late: 0,
      total: 0,
      get percentage() {
        return ((this.present + this.late) / this.total * 100).toFixed(2);
      }
    });
  }

  calculateAssignmentStats(assignments, studentId) {
    const stats = {
      total: assignments.length,
      completed: 0,
      onTime: 0,
      assignments: []
    };

    assignments.forEach(assignment => {
      const submission = assignment.submissions.find(
        sub => sub.student.toString() === studentId
      );

      if (submission) {
        stats.completed++;
        if (submission.status !== 'late') stats.onTime++;
        
        stats.assignments.push({
          title: assignment.title,
          status: submission.status,
          marks: submission.marks,
          submissionDate: submission.submittedAt
        });
      } else {
        stats.assignments.push({
          title: assignment.title,
          status: 'pending'
        });
      }
    });

    return stats;
  }

  calculateAverageGrade(grades) {
    if (!grades.length) return 'N/A';
    
    const total = grades.reduce((sum, grade) => {
      return sum + (grade.marks.obtained / grade.marks.total * 100);
    }, 0);
    
    return (total / grades.length).toFixed(2);
  }

  async getClassPerformanceData(students, semester, academicYear) {
    const subjectStats = {};

    for (const student of students) {
      const grades = await Grade.find({
        student: student._id,
        semester,
        academicYear
      });

      grades.forEach(grade => {
        if (!subjectStats[grade.subject]) {
          subjectStats[grade.subject] = {
            total: 0,
            count: 0,
            highest: 0,
            lowest: 100
          };
        }

        const percentage = (grade.marks.obtained / grade.marks.total) * 100;
        const stats = subjectStats[grade.subject];

        stats.total += percentage;
        stats.count++;
        stats.highest = Math.max(stats.highest, percentage);
        stats.lowest = Math.min(stats.lowest, percentage);
      });
    }

    return Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      average: (stats.total / stats.count).toFixed(2),
      highest: stats.highest.toFixed(2),
      lowest: stats.lowest.toFixed(2)
    }));
  }
}