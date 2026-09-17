const { check } = require('express-validator');

exports.processPaymentValidator = [
  check('bookingId', 'Valid booking ID is required').isMongoId(),
  check('method', 'Unsupported payment method').isIn(['card', 'credit_card', 'debit_card', 'upi', 'netbanking', 'wallet', 'demo']),
  check('simulate', 'Demo simulation requires success or failure').optional().isIn(['success', 'failure'])
];
