const express = require('express');
const { searchEvents } = require('../controllers/searchController');
const { searchEventValidator } = require('../validators/searchValidators');
const { validate } = require('../middleware/validateMiddleware');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/events')
  .get(optionalAuth, searchEventValidator, validate, searchEvents);

module.exports = router;
