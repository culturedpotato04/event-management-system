const { check } = require('express-validator');

exports.updateProfileValidator = [
  check('name', 'Name cannot be empty').optional().not().isEmpty(),
  check('email', 'Please include a valid email').optional().isEmail()
];

exports.changePasswordValidator = [
  check('currentPassword', 'Current password is required').not().isEmpty(),
  check('newPassword', 'Please enter a new password with 6 or more characters').isLength({ min: 6 })
];

exports.updateUserValidator = [
  check('name', 'Name cannot be empty').optional().not().isEmpty(),
  check('email', 'Please include a valid email').optional().isEmail(),
  check('role', 'Invalid role').optional().isIn(['user', 'organizer', 'admin'])
];

exports.updateStatusValidator = [
  check('status', 'Status is required').not().isEmpty(),
  check('status', 'Invalid status').isIn(['active', 'inactive'])
];
