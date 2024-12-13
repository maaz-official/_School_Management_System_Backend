import PDFDocument from 'pdfkit';
import { createHash } from 'crypto';
import { formatCurrency } from '../formatters.js';
import QRCode from 'qrcode';

export class ReceiptGenerator {
  static async generate(fee, payment, options = {}) {
    const doc = new PDFDocument({ size: 'A4' });
    
    // Add school logo and header
    await this.addHeader(doc, options);
    
    // Add receipt details
    this.addReceiptDetails(doc, fee, payment);
    
    // Add payment breakdown
    this.addPaymentBreakdown(doc, fee, payment);
    
    // Add terms and conditions
    this.addTerms(doc);
    
    // Add QR code for digital verification
    await this.addQRCode(doc, fee, payment);
    
    // Add footer
    this.addFooter(doc);
    
    return doc;
  }

  static async addQRCode(doc, fee, payment) {
    const verificationData = {
      receiptNo: payment._id.toString(),
      amount: payment.amount,
      date: payment.paymentDate,
      transactionId: payment.transactionId
    };

    const qrCodeData = await QRCode.toDataURL(JSON.stringify(verificationData));
    doc.image(qrCodeData, 450, 50, { width: 100 });
  }

  static addPaymentBreakdown(doc, fee, payment) {
    const table = {
      headers: ['Description', 'Amount'],
      rows: [
        ['Fee Amount', formatCurrency(fee.amount)],
        ['Late Fee', formatCurrency(fee.lateFee || 0)],
        ['Discount', formatCurrency(fee.discount?.amount || 0)],
        ['Amount Paid', formatCurrency(payment.amount)],
        ['Balance', formatCurrency(fee.remainingBalance)]
      ]
    };

    doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(10),
      prepareRow: () => doc.font('Helvetica').fontSize(10)
    });
  }

  static addTerms(doc) {
    doc.fontSize(8)
      .text('Terms and Conditions:', { underline: true })
      .text('1. This receipt is valid subject to realization of payment.')
      .text('2. Please retain this receipt for future reference.')
      .text('3. For any queries, please contact the accounts department.');
  }
}