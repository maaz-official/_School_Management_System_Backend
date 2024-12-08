import { ActivityLog } from '../models/activityLog.model.js';

export const logActivity = async ({
  user,
  action,
  resourceType,
  resourceId,
  details,
  req
}) => {
  try {
    await ActivityLog.create({
      user: user._id,
      action,
      resourceType,
      resourceId,
      details,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
  } catch (error) {
    console.error('Activity logging failed:', error);
  }
};

export const getActivityLogs = async (filters = {}) => {
  try {
    const query = {};
    
    if (filters.userId) {
      query.user = filters.userId;
    }
    
    if (filters.action) {
      query.action = filters.action;
    }
    
    if (filters.resourceType) {
      query.resourceType = filters.resourceType;
    }
    
    if (filters.startDate && filters.endDate) {
      query.createdAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }

    return await ActivityLog.find(query)
      .populate('user', 'firstName lastName email role')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error('Failed to retrieve activity logs');
  }
};