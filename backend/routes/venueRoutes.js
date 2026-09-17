const express = require('express');
const {
  createVenue,
  getVenues,
  getVenue,
  updateVenue,
  updateVenueStatus,
  deleteVenue
} = require('../controllers/venueController');
const {
  createVenueValidator,
  updateVenueValidator,
  updateVenueStatusValidator
} = require('../validators/venueValidators');
const { validate } = require('../middleware/validateMiddleware');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('organizer', 'admin'), createVenueValidator, validate, createVenue)
  .get(optionalAuth, getVenues);

router.route('/:id')
  .get(optionalAuth, getVenue)
  .put(protect, authorize('organizer', 'admin'), updateVenueValidator, validate, updateVenue)
  .delete(protect, authorize('organizer', 'admin'), deleteVenue);

router.route('/:id/status')
  .patch(protect, authorize('organizer', 'admin'), updateVenueStatusValidator, validate, updateVenueStatus);

module.exports = router;
