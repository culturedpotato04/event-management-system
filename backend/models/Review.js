const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

ReviewSchema.index({ user: 1, event: 1 }, { unique: true });
ReviewSchema.index({ event: 1, isVisible: 1 });

module.exports = mongoose.model('Review', ReviewSchema);
