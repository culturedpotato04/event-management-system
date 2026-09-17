const express = require('express');
const {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking
} = require('../controllers/bookingController');
const {
  createBookingValidator,
  cancelBookingValidator
} = require('../validators/bookingValidators');
const { validate } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createBookingValidator, validate, createBooking)
  .get(getBookings);

router.route('/:id')
  .get(getBooking);

router.route('/:id/cancel')
  .patch(cancelBookingValidator, validate, cancelBooking);

module.exports = router;
