import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  subjects: [{
    name: String,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher'
    },
    schedule: [{
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      },
      startTime: String,
      endTime: String
    }]
  }],
  academicYear: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const Classroom = mongoose.model('Classroom', classroomSchema);