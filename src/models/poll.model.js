import mongoose from 'mongoose';

const pollOptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

const pollSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  options: [pollOptionSchema],
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  allowMultipleVotes: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'CLOSED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

// Automatically close expired polls
pollSchema.pre('save', function(next) {
  if (this.expiresAt < new Date()) {
    this.status = 'EXPIRED';
  }
  next();
});

export const Poll = mongoose.model('Poll', pollSchema);