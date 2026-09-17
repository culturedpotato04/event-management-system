const express = require('express');
const {
  createTicketType,
  getTicketTypesByEvent,
  getTicketType,
  updateTicketType,
  updateTicketTypeStatus,
  deleteTicketType,
  getAvailability
} = require('../controllers/ticketController');
const {
  createTicketTypeValidator,
  updateTicketTypeValidator,
  updateTicketTypeStatusValidator
} = require('../validators/ticketValidators');
const { validate } = require('../middleware/validateMiddleware');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/types')
  .post(protect, authorize('organizer', 'admin'), createTicketTypeValidator, validate, createTicketType);

router.route('/types/event/:eventId')
  .get(optionalAuth, getTicketTypesByEvent);

router.route('/types/:id')
  .get(optionalAuth, getTicketType)
  .put(protect, authorize('organizer', 'admin'), updateTicketTypeValidator, validate, updateTicketType)
  .delete(protect, authorize('organizer', 'admin'), deleteTicketType);

router.route('/types/:id/status')
  .patch(protect, authorize('organizer', 'admin'), updateTicketTypeStatusValidator, validate, updateTicketTypeStatus);

router.route('/types/:id/availability')
  .get(optionalAuth, getAvailability);

module.exports = router;
