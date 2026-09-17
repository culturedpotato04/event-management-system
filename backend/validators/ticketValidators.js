const { check } = require('express-validator');

exports.createTicketTypeValidator = [
  check('event', 'Valid event ID is required').isMongoId(),
  check('name', 'Name is required').not().isEmpty().trim(),
  check('price', 'Price must be a positive number or 0').isFloat({ min: 0 }),
  check('totalQuantity', 'Total quantity must be a positive integer').isInt({ min: 1 }),
  check('minPerBooking', 'minPerBooking must be an integer >= 1').optional().isInt({ min: 1 }),
  check('maxPerBooking', 'maxPerBooking must be an integer >= 1').optional().isInt({ min: 1 }),
  check('saleStart', 'Valid sale start date is required').optional({ nullable: true }).isISO8601(),
  check('saleEnd', 'Valid sale end date is required').optional({ nullable: true }).isISO8601()
];

exports.updateTicketTypeValidator = [
  check('name', 'Name cannot be empty').optional().trim().not().isEmpty(),
  check('price', 'Price must be a positive number or 0').optional().isFloat({ min: 0 }),
  check('totalQuantity', 'Total quantity must be a positive integer').optional().isInt({ min: 1 }),
  check('minPerBooking', 'minPerBooking must be an integer >= 1').optional().isInt({ min: 1 }),
  check('maxPerBooking', 'maxPerBooking must be an integer >= 1').optional().isInt({ min: 1 }),
  check('saleStart', 'Valid sale start date is required').optional({ nullable: true }).isISO8601(),
  check('saleEnd', 'Valid sale end date is required').optional({ nullable: true }).isISO8601()
];

exports.updateTicketTypeStatusValidator = [
  check('isActive', 'isActive must be a boolean').isBoolean()
];
