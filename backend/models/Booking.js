const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: true
  },
  payment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Payment'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'failed', 'completed'],
    default: 'pending'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  tickets: [{
    ticketType: {
      type: mongoose.Schema.ObjectId,
      ref: 'TicketType',
      required: true
    },
    nameSnapshot: {
      type: String,
      required: true
    },
    priceSnapshot: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  cancellationDate: {
    type: Date
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for common queries
BookingSchema.index({ user: 1, status: 1 });
BookingSchema.index({ event: 1, status: 1 });
BookingSchema.index({ bookingNumber: 1 });

module.exports = mongoose.model('Booking', BookingSchema);
