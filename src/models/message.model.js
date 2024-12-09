import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: String,
  mimeType: String,
  size: Number,
  path: String
});

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['TEXT', 'FILE', 'ANNOUNCEMENT'],
    default: 'TEXT'
  },
  attachments: [attachmentSchema],
  read: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: Date
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }
}, {
  timestamps: true
});

// Ensure message has either recipient or group
messageSchema.pre('save', function(next) {
  if (!this.recipient && !this.group) {
    next(new Error('Message must have either a recipient or a group'));
  }
  next();
});

export const Message = mongoose.model('Message', messageSchema);