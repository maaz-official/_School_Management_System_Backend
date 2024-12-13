import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  fee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Fee',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD'
  },
  provider: {
    type: String,
    enum: ['STRIPE', 'PAYPAL', 'RAZORPAY', 'BANK_TRANSFER', 'CASH', 'CHEQUE'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  transactionId: String,
  paymentIntentId: String,
  orderId: String,
  metadata: {
    type: Map,
    of: String
  },
  refundDetails: {
    refundId: String,
    amount: Number,
    reason: String,
    refundedAt: Date
  }
}, {
  timestamps: true
});

export const Payment = mongoose.model('Payment', paymentSchema);