import { Fee } from '../../models/fee.model.js';
import PDFDocument from 'pdfkit-table';

export class FeeReportService {
  static async generateCollectionReport(filters) {
    const { startDate, endDate, feeType, class: className } = filters;
    
    const query = {};
    if (startDate && endDate) {
      query.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (feeType) query.type = feeType;

    const fees = await Fee.find(query)
      .populate('student', 'class section rollNumber')
      .populate({
        path: 'student',
        populate: {
          path: 'userId',
          select: 'firstName lastName'
        }
      });

    // Generate summary statistics
    const summary = this.calculateSummary(fees);
    
    // Generate PDF report
    const doc = new PDFDocument();
    
    // Add report header
    this.addReportHeader(doc, filters);
    
    // Add summary section
    this.addSummarySection(doc, summary);
    
    // Add detailed collection table
    await this.addCollectionTable(doc, fees);
    
    // Add charts and graphs
    this.addVisualization(doc, summary);
    
    return doc;
  }

  static calculateSummary(fees) {
    return fees.reduce((summary, fee) => {
      summary.totalAmount += fee.amount;
      summary.totalCollected += fee.payments.reduce((sum, payment) => sum + payment.amount, 0);
      summary.totalPending = summary.totalAmount - summary.totalCollected;
      summary.byType[fee.type] = (summary.byType[fee.type] || 0) + fee.amount;
      return summary;
    }, {
      totalAmount: 0,
      totalCollected: 0,
      totalPending: 0,
      byType: {}
    });
  }

  static async addCollectionTable(doc, fees) {
    const table = {
      headers: ['Student', 'Class', 'Fee Type', 'Amount', 'Paid', 'Status'],
      rows: fees.map(fee => [
        `${fee.student.userId.firstName} ${fee.student.userId.lastName}`,
        `${fee.student.class}-${fee.student.section}`,
        fee.type,
        fee.amount,
        fee.payments.reduce((sum, payment) => sum + payment.amount, 0),
        fee.status
      ])
    };

    await doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
      prepareRow: () => doc.font('Helvetica').fontSize(10)
    });
  }
}