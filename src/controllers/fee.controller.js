import { Fee } from '../models/fee.model.js';
import { Student } from '../models/student.model.js';
import { AppError } from '../utils/appError.js';
import { NotificationService } from '../services/notification.service.js';
import { generateReceipt } from '../utils/receiptGenerator.js';

export const feeController = {
  async addFee(req, res, next) {
    try {
      const {
        studentId,
        type,
        amount,
        dueDate,
        semester,
        academicYear,
        description,
        discount
      } = req.body;

      const student = await Student.findById(studentId).populate('userId');
      if (!student) {
        throw new AppError('Student not found', 404);
      }

      const fee = await Fee.create({
        student: studentId,
        type,
        amount,
        dueDate,
        semester,
        academicYear,
        description,
        discount
      });

      // Send notification to student and parent
      await NotificationService.sendNotification(student.userId._id, {
        title: 'New Fee Added',
        message: `A new ${type} fee of ${amount} has been added to your account`,
        type: 'FEE',
        priority: 'HIGH',
        relatedTo: {
          model: 'Fee',
          id: fee._id
        }
      });

      res.status(201).json({
        success: true,
        data: fee
      });
    } catch (error) {
      next(error);
    }
  },

  async recordPayment(req, res, next) {
    try {
      const { feeId } = req.params;
      const { amount, paymentMethod, transactionId } = req.body;

      const fee = await Fee.findById(feeId);
      if (!fee) {
        throw new AppError('Fee record not found', 404);
      }

      const payment = {
        amount,
        paymentDate: new Date(),
        paymentMethod,
        transactionId
      };

      fee.payments.push(payment);
      
      // Update fee status
      const totalPaid = fee.payments.reduce((sum, p) => sum + p.amount, 0);
      if (totalPaid >= fee.amount) {
        fee.status = 'PAID';
      } else if (totalPaid > 0) {
        fee.status = 'PARTIAL';
      }

      await fee.save();

      // Generate receipt
      const receipt = await generateReceipt(fee, payment);
      
      // Send notification
      const student = await Student.findById(fee.student).populate('userId');
      await NotificationService.sendNotification(student.userId._id, {
        title: 'Payment Recorded',
        message: `Your payment of ${amount} for ${fee.type} has been recorded`,
        type: 'FEE',
        priority: 'MEDIUM',
        relatedTo: {
          model: 'Fee',
          id: fee._id
        }
      });

      res.json({
        success: true,
        data: {
          fee,
          receipt
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async getFeeDetails(req, res, next) {
    try {
      const { studentId } = req.params;
      const { semester, academicYear, status } = req.query;

      const query = { student: studentId };
      if (semester) query.semester = semester;
      if (academicYear) query.academicYear = academicYear;
      if (status) query.status = status;

      const fees = await Fee.find(query).sort({ dueDate: 1 });

      // Calculate summary
      const summary = fees.reduce((acc, fee) => {
        acc.totalAmount += fee.amount;
        acc.totalPaid += fee.payments.reduce((sum, payment) => sum + payment.amount, 0);
        acc.totalPending = acc.totalAmount - acc.totalPaid;
        return acc;
      }, { totalAmount: 0, totalPaid: 0, totalPending: 0 });

      res.json({
        success: true,
        data: {
          fees,
          summary
        }
      });
    } catch (error) {
      next(error);
    }
  },

  async updateFee(req, res, next) {
    try {
      const { feeId } = req.params;
      const updateData = req.body;

      const fee = await Fee.findByIdAndUpdate(
        feeId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      if (!fee) {
        throw new AppError('Fee record not found', 404);
      }

      res.json({
        success: true,
        data: fee
      });
    } catch (error) {
      next(error);
    }
  }
};