const { check } = require('express-validator');

exports.createReviewValidator = [
  check('eventId', 'Event ID is required').isMongoId(),
  check('bookingId', 'Booking ID is required').isMongoId(),
  check('rating', 'Rating must be an integer between 1 and 5').isInt({ min: 1, max: 5 }),
  check('comment', 'Comment cannot exceed 1000 characters').optional().isString().isLength({ max: 1000 })
];

exports.updateReviewValidator = [
  check('rating', 'Rating must be an integer between 1 and 5').optional().isInt({ min: 1, max: 5 }),
  check('comment', 'Comment cannot exceed 1000 characters').optional().isString().isLength({ max: 1000 })
];

exports.updateReviewStatusValidator = [
  check('isVisible', 'isVisible must be a boolean').isBoolean()
];
