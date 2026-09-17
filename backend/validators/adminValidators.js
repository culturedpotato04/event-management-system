const { check } = require('express-validator');

exports.broadcastValidator = [
  check('title', 'Title is required').not().isEmpty().trim(),
  check('message', 'Message is required').not().isEmpty().trim(),
  check('type', 'Type must be system').optional().equals('system')
];
