import { Fee } from '../models/fee.model.js';
import { NotificationService } from './notification.service.js';
import { AppError } from '../utils/appError.js';

export class InstallmentPlanService {
  static async createInstallmentPlan(feeId, { numberOfInstallments, startDate }) {
    const fee = await Fee.findById(feeId);
    if (!fee) {
      throw new AppError('Fee not found', 404);
    }

    const installmentAmount = Math.ceil(fee.amount / numberOfInstallments);
    const installments = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < numberOfInstallments; i++) {
      installments.push({
        amount: i === numberOfInstallments - 1 ? 
          fee.amount - (installmentAmount * (numberOfInstallments - 1)) : 
          installmentAmount,
        dueDate: new Date(currentDate),
        status: 'PENDING'
      });
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    fee.installmentPlan = {
      enabled: true,
      installments,
      createdAt: new Date()
    };

    await fee.save();
    return fee;
  }

  static async scheduleReminders() {
    const upcomingDueDates = await Fee.find({
      'installmentPlan.enabled': true,
      'installmentPlan.installments': {
        $elemMatch: {
          status: 'PENDING',
          dueDate: {
            $gte: new Date(),
            $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
          }
        }
      }
    }).populate('student', 'userId');

    for (const fee of upcomingDueDates) {
      await NotificationService.sendNotification(fee.student.userId, {
        title: 'Upcoming Installment Due',
        message: `Your next installment of ${fee.installmentPlan.installments[0].amount} is due on ${fee.installmentPlan.installments[0].dueDate.toLocaleDateString()}`,
        type: 'FEE_REMINDER',
        priority: 'HIGH',
        expiresAt: fee.installmentPlan.installments[0].dueDate
      });
    }
  }
}