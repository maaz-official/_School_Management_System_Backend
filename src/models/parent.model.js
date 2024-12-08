import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  occupation: String,
  workPhone: String,
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  }
}, {
  timestamps: true
});

export const Parent = mongoose.model('Parent', parentSchema);