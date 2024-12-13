import PDFDocument from 'pdfkit';
import { createHash } from 'crypto';

export const generateReceipt = async (fee, payment) => {
  const doc = new PDFDocument();
  
  // Add school header
  doc.fontSize(20)
    .text('School Management System', { align: 'center' })
    .moveDown();

  // Receipt details
  doc.fontSize(16)
    .text('Payment Receipt')
    .moveDown();

  doc.fontSize(12);

  // Payment details
  doc.text(`Receipt No: ${createHash('sha256').update(payment._id.toString()).digest('hex').substring(0, 8)}`)
    .text(`Date: ${payment.paymentDate.toLocaleDateString()}`)
    .text(`Payment Method: ${payment.paymentMethod}`)
    .text(`Transaction ID: ${payment.transactionId || 'N/A'}`)
    .moveDown();

  // Fee details
  doc.text(`Fee Type: ${fee.type}`)
    .text(`Semester: ${fee.semester}`)
    .text(`Academic Year: ${fee.academicYear}`)
    .moveDown();

  // Amount details
  doc.text(`Amount Paid: ${payment.amount}`)
    .text(`Total Fee Amount: ${fee.amount}`)
    .text(`Remaining Balance: ${fee.remainingBalance}`)
    .moveDown();

  // Footer
  doc.fontSize(10)
    .text('This is a computer generated receipt', { align: 'center' })
    .text('Thank you for your payment', { align: 'center' });

  return doc;
};