const { check } = require('express-validator');

exports.createBookingValidator = [
  check('eventId', 'Valid event ID is required').isMongoId(),
  check('tickets', 'Tickets must be an array and cannot be empty').isArray({ min: 1 }),
  check('tickets.*.ticketTypeId', 'Valid ticket type ID is required').isMongoId(),
  check('tickets.*.quantity', 'Quantity must be a positive integer').isInt({ min: 1 })
];

exports.cancelBookingValidator = [
  check('reason', 'Cancellation reason is required').optional().isString().trim()
];
