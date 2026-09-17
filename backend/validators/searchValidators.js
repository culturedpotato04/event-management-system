const { check } = require('express-validator');

exports.searchEventValidator = [
  check('q').optional().isString().trim(),
  check('category').optional().isMongoId(),
  check('venue').optional().isMongoId(),
  check('organizer').optional().custom(val => val === 'me' || val.match(/^[0-9a-fA-F]{24}$/)),
  check('city').optional().isString().trim(),
  check('minPrice').optional().isFloat({ min: 0 }),
  check('maxPrice').optional().isFloat({ min: 0 }),
  check('startDate').optional().isISO8601(),
  check('endDate').optional().isISO8601(),
  check('sort').optional().isIn(['newest', 'oldest', 'price_asc', 'price_desc', 'event_date_asc', 'event_date_desc']),
  check('page').optional().isInt({ min: 1 }),
  check('limit').optional().isInt({ min: 1 })
];
