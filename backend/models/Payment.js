const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  method: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'demo'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'successful', 'failed', 'refunded'],
    default: 'pending'
  },
  gateway: {
    type: String,
    default: 'demo'
  },
  paidAt: {
    type: Date
  },
  failureReason: {
    type: String
  },
  refundDate: {
    type: Date
  }
}, {
  timestamps: true
});

PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ booking: 1 });
PaymentSchema.index({ user: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
