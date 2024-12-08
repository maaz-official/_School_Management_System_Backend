import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['quiz', 'midterm', 'final', 'assignment', 'project'],
    required: true
  },
  marks: {
    obtained: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  semester: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  remarks: String,
  submissionDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique grade entries
gradeSchema.index(
  { student: 1, subject: 1, examType: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

export const Grade = mongoose.model('Grade', gradeSchema);