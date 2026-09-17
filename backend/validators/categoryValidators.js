const { check } = require('express-validator');

exports.createCategoryValidator = [
  check('name', 'Category name is required').not().isEmpty(),
  check('name', 'Name must not consist only of whitespace').trim().isLength({ min: 1 }),
  check('description', 'Description cannot be more than 500 characters').optional().isLength({ max: 500 })
];

exports.updateCategoryValidator = [
  check('name', 'Category name cannot be empty').optional().trim().not().isEmpty(),
  check('description', 'Description cannot be more than 500 characters').optional().isLength({ max: 500 })
];

exports.updateCategoryStatusValidator = [
  check('isActive', 'isActive must be a boolean').isBoolean()
];
