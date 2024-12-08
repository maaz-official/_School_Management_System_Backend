import { getActivityLogs } from '../utils/activityLogger.js';
import { AppError } from '../utils/appError.js';

export const activityLogController = {
  async getActivityLogs(req, res, next) {
    try {
      const { userId, action, resourceType, startDate, endDate } = req.query;
      
      // Only admin can view all logs
      if (req.user.role !== 'admin') {
        throw new AppError('Unauthorized access', 403);
      }

      const logs = await getActivityLogs({
        userId,
        action,
        resourceType,
        startDate,
        endDate
      });

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  },

  async getUserActivityLogs(req, res, next) {
    try {
      const logs = await getActivityLogs({
        userId: req.user.id
      });

      res.json({
        success: true,
        data: logs
      });
    } catch (error) {
      next(error);
    }
  }
};