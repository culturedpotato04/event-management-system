const { check } = require('express-validator');

exports.createVenueValidator = [
  check('name', 'Venue name is required').not().isEmpty(),
  check('name', 'Name must not consist only of whitespace').trim().isLength({ min: 1 }),
  check('address', 'Address is required').not().isEmpty(),
  check('city', 'City is required').not().isEmpty(),
  check('capacity', 'Capacity must be a positive number').isInt({ min: 1 })
];

exports.updateVenueValidator = [
  check('name', 'Venue name cannot be empty').optional().trim().not().isEmpty(),
  check('address', 'Address cannot be empty').optional().not().isEmpty(),
  check('city', 'City cannot be empty').optional().not().isEmpty(),
  check('capacity', 'Capacity must be a positive number').optional().isInt({ min: 1 })
];

exports.updateVenueStatusValidator = [
  check('isActive', 'isActive must be a boolean').isBoolean()
];
