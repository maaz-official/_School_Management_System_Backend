import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  type: {
    type: String,
    enum: ['TUITION', 'EXAM', 'TRANSPORT', 'LIBRARY', 'LABORATORY', 'OTHER'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PARTIAL', 'PAID', 'OVERDUE'],
    default: 'PENDING'
  },
  payments: [{
    amount: Number,
    paymentDate: Date,
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'CHEQUE']
    },
    transactionId: String,
    receipt: String
  }],
  semester: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  description: String,
  lateFee: {
    type: Number,
    default: 0
  },
  discount: {
    amount: Number,
    reason: String
  }
}, {
  timestamps: true
});

// Calculate total paid amount
feeSchema.virtual('paidAmount').get(function() {
  return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
});

// Calculate remaining balance
feeSchema.virtual('remainingBalance').get(function() {
  return this.amount + this.lateFee - this.paidAmount;
});

export const Fee = mongoose.model('Fee', feeSchema);