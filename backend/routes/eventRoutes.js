const express = require('express');
const {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  updateEventStatus,
  deleteEvent
} = require('../controllers/eventController');
const {
  createEventValidator,
  updateEventValidator,
  updateEventStatusValidator
} = require('../validators/eventValidators');
const { validate } = require('../middleware/validateMiddleware');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('organizer', 'admin'), createEventValidator, validate, createEvent)
  .get(optionalAuth, getEvents);

router.route('/:id')
  .get(optionalAuth, getEvent)
  .put(protect, authorize('organizer', 'admin'), updateEventValidator, validate, updateEvent)
  .delete(protect, authorize('organizer', 'admin'), deleteEvent);

router.route('/:id/status')
  .patch(protect, authorize('organizer', 'admin'), updateEventStatusValidator, validate, updateEventStatus);

module.exports = router;
