import { io } from '../socket.js';
import { User } from '../models/user.model.js';
import { sendEmail } from '../utils/email.js';
import { logger } from '../utils/logger.js';

export class NotificationService {
  static async sendNotification(userId, notification) {
    try {
      // Send real-time notification via Socket.io
      io.to(userId.toString()).emit('notification', notification);

      // Store notification in database
      await Notification.create({
        user: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        relatedTo: notification.relatedTo
      });

      // Send email notification if enabled
      const user = await User.findById(userId);
      if (user && user.emailNotifications) {
        await sendEmail({
          to: user.email,
          subject: notification.title,
          text: notification.message
        });
      }
    } catch (error) {
      logger.error('Notification sending failed:', error);
    }
  }

  static async sendBulkNotification(userIds, notification) {
    try {
      for (const userId of userIds) {
        await this.sendNotification(userId, notification);
      }
    } catch (error) {
      logger.error('Bulk notification sending failed:', error);
    }
  }

  static async markAsRead(userId, notificationId) {
    try {
      await Notification.findByIdAndUpdate(notificationId, {
        read: true,
        readAt: new Date()
      });
    } catch (error) {
      logger.error('Marking notification as read failed:', error);
    }
  }
}