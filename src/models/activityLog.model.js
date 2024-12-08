import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']
  },
  resourceType: {
    type: String,
    required: true,
    enum: ['USER', 'STUDENT', 'TEACHER', 'GRADE', 'ATTENDANCE', 'FEE', 'ASSIGNMENT']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: String
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);