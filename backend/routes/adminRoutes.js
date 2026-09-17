const express = require('express');
const {
  getDashboard,
  getEvents,
  getEvent,
  updateEventStatus,
  deleteEvent,
  getBookings,
  getBooking,
  getPayments,
  getPayment,
  broadcastNotification,
  getAnalyticsBookings,
  getAnalyticsRevenue
} = require('../controllers/adminController');
const { broadcastValidator } = require('../validators/adminValidators');
const { validate } = require('../middleware/validateMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);

router.route('/events')
  .get(getEvents);
router.route('/events/:id')
  .get(getEvent)
  .delete(deleteEvent);
router.route('/events/:id/status')
  .patch(updateEventStatus);

router.route('/bookings')
  .get(getBookings);
router.route('/bookings/:id')
  .get(getBooking);

router.route('/payments')
  .get(getPayments);
router.route('/payments/:id')
  .get(getPayment);

router.post('/notifications/broadcast', broadcastValidator, validate, broadcastNotification);

router.get('/analytics/bookings', getAnalyticsBookings);
router.get('/analytics/revenue', getAnalyticsRevenue);

module.exports = router;
