import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'GRADE',
      'ATTENDANCE',
      'ASSIGNMENT',
      'FEE',
      'MESSAGE',
      'ANNOUNCEMENT',
      'EVENT',
      'EXAM',
      'HOMEWORK',
      'GENERAL'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'MEDIUM'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Grade', 'Attendance', 'Assignment', 'Fee', 'Message', 'Event', 'Exam']
    },
    id: mongoose.Schema.Types.ObjectId
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for expired notifications cleanup
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Notification = mongoose.model('Notification', notificationSchema);