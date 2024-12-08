import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  classroom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    submittedAt: Date,
    attachments: [{
      name: String,
      url: String,
      type: String
    }],
    marks: Number,
    feedback: String,
    status: {
      type: String,
      enum: ['pending', 'submitted', 'late', 'graded'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

export const Assignment = mongoose.model('Assignment', assignmentSchema);