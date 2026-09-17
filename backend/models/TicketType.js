const mongoose = require('mongoose');

const TicketTypeSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a ticket name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  totalQuantity: {
    type: Number,
    required: [true, 'Please add total quantity'],
    min: [1, 'Quantity must be at least 1']
  },
  soldQuantity: {
    type: Number,
    default: 0,
    min: [0, 'Sold quantity cannot be negative']
  },
  minPerBooking: {
    type: Number,
    default: 1,
    min: [1, 'Must allow at least 1 per booking']
  },
  maxPerBooking: {
    type: Number,
    default: 10,
    min: [1, 'Max per booking must be at least 1']
  },
  saleStart: {
    type: Date
  },
  saleEnd: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for event + name uniqueness
TicketTypeSchema.index({ event: 1, name: 1 }, { unique: true });

// Virtual for available quantity
TicketTypeSchema.virtual('availableQuantity').get(function() {
  return this.totalQuantity - this.soldQuantity;
});

module.exports = mongoose.model('TicketType', TicketTypeSchema);
