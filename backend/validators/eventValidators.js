const { check } = require('express-validator');

exports.createEventValidator = [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('category', 'Valid category ID is required').isMongoId(),
  check('venue', 'Valid venue ID is required').isMongoId(),
  check('startDateTime', 'Valid start date is required').isISO8601(),
  check('endDateTime', 'Valid end date is required').isISO8601(),
  check('maxAttendees', 'Max attendees must be a positive number').isInt({ min: 1 }),
  check('imageUrl', 'Valid URL required').optional().isURL()
];

exports.updateEventValidator = [
  check('title', 'Title cannot be empty').optional().not().isEmpty(),
  check('description', 'Description cannot be empty').optional().not().isEmpty(),
  check('category', 'Valid category ID is required').optional().isMongoId(),
  check('venue', 'Valid venue ID is required').optional().isMongoId(),
  check('startDateTime', 'Valid start date is required').optional().isISO8601(),
  check('endDateTime', 'Valid end date is required').optional().isISO8601(),
  check('maxAttendees', 'Max attendees must be a positive number').optional().isInt({ min: 1 }),
  check('imageUrl', 'Valid URL required').optional().isURL()
];

exports.updateEventStatusValidator = [
  check('status', 'Invalid status').isIn(['draft', 'published', 'cancelled', 'completed'])
];
