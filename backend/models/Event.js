const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  organizer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: true
  },
  venue: {
    type: mongoose.Schema.ObjectId,
    ref: 'Venue',
    required: true
  },
  startDateTime: {
    type: Date,
    required: [true, 'Please add a start date and time']
  },
  endDateTime: {
    type: Date,
    required: [true, 'Please add an end date and time']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  imageUrl: {
    type: String
  },
  maxAttendees: {
    type: Number,
    required: [true, 'Please add max attendees'],
    min: [1, 'Must allow at least 1 attendee']
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);
