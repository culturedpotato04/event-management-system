const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');
const mongoose = require('mongoose');

exports.createReview = async (data, userId) => {
  const { eventId, bookingId, rating, comment } = data;

  const event = await Event.findById(eventId);
  if (!event) throw new ErrorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
  
  if (new Date() < event.endDateTime && event.status !== 'completed') {
    throw new ErrorResponse('Cannot review an event that has not yet concluded', 400, 'EVENT_NOT_COMPLETED');
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ErrorResponse('Booking not found', 404, 'BOOKING_NOT_FOUND');
  
  if (booking.user.toString() !== userId) {
    throw new ErrorResponse('Booking does not belong to user', 403, 'REVIEW_NOT_ELIGIBLE');
  }

  if (booking.event.toString() !== eventId) {
    throw new ErrorResponse('Booking does not match event', 400, 'REVIEW_NOT_ELIGIBLE');
  }

  if (booking.status !== 'confirmed' && booking.status !== 'completed') {
    throw new ErrorResponse('Only confirmed or completed bookings are eligible for review', 400, 'BOOKING_NOT_ELIGIBLE_FOR_REVIEW');
  }

  try {
    const review = await Review.create({
      user: userId,
      event: eventId,
      booking: bookingId,
      rating,
      comment
    });
    return review;
  } catch (error) {
    if (error.code === 11000) {
      throw new ErrorResponse('You have already reviewed this event', 409, 'REVIEW_ALREADY_EXISTS');
    }
    throw error;
  }
};

exports.getEventReviews = async (eventId) => {
  const aggregation = await Review.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId), isVisible: true } },
    {
      $group: {
        _id: '$event',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  const stats = aggregation.length > 0 ? aggregation[0] : { averageRating: 0, totalReviews: 0 };
  
  const reviews = await Review.find({ event: eventId, isVisible: true })
    .populate('user', 'name')
    .sort('-createdAt');

  return {
    averageRating: Number(stats.averageRating.toFixed(1)),
    totalReviews: stats.totalReviews,
    reviews
  };
};

exports.getReviewById = async (id) => {
  const review = await Review.findById(id).populate('user', 'name');
  if (!review) throw new ErrorResponse('Review not found', 404, 'REVIEW_NOT_FOUND');
  return review;
};

exports.updateReview = async (id, data, user) => {
  let review = await Review.findById(id);
  if (!review) throw new ErrorResponse('Review not found', 404, 'REVIEW_NOT_FOUND');

  if (review.user.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('Not authorized to update this review', 403, 'REVIEW_NOT_OWNED');
  }

  review = await Review.findByIdAndUpdate(id, {
    rating: data.rating || review.rating,
    comment: data.comment || review.comment
  }, { new: true, runValidators: true });

  return review;
};

exports.deleteReview = async (id, user) => {
  const review = await Review.findById(id);
  if (!review) throw new ErrorResponse('Review not found', 404, 'REVIEW_NOT_FOUND');

  if (review.user.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('Not authorized to delete this review', 403, 'REVIEW_NOT_OWNED');
  }

  await Review.findByIdAndDelete(id);
  return review;
};

exports.updateReviewStatus = async (id, isVisible) => {
  const review = await Review.findByIdAndUpdate(id, { isVisible }, { new: true });
  if (!review) throw new ErrorResponse('Review not found', 404, 'REVIEW_NOT_FOUND');
  return review;
};
