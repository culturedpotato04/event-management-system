const adminService = require('../services/adminService');
const eventService = require('../services/eventService');
const bookingService = require('../services/bookingService');
const paymentService = require('../services/paymentService');
const { createBulkNotifications } = require('../services/notificationService');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');

exports.getDashboard = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardMetrics();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    
    const eventsData = await eventService.getEvents({}, { page, limit }, req.user);
    res.status(200).json({ success: true, ...eventsData });
  } catch (err) {
    next(err);
  }
};

exports.getEvent = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

exports.updateEventStatus = async (req, res, next) => {
  try {
    const event = await eventService.updateEventStatus(req.params.id, req.body.status, req.user);
    res.status(200).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id, req.user);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.eventId) query.event = req.query.eventId;
    if (req.query.userId) query.user = req.query.userId;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('event', 'title')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

exports.getBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.bookingId) query.booking = req.query.bookingId;
    if (req.query.userId) query.user = req.query.userId;

    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('booking', 'bookingNumber status')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: payments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    next(err);
  }
};

exports.getPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.user);
    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};

exports.broadcastNotification = async (req, res, next) => {
  try {
    const { title, message } = req.body;
    
    // Fetch all active users
    const users = await User.find({ status: 'active' }).select('_id');
    
    const notifications = users.map(user => ({
      user: user._id,
      type: 'system',
      title,
      message
    }));

    await createBulkNotifications(notifications);

    res.status(200).json({ success: true, message: `Broadcasted to ${users.length} active users.` });
  } catch (err) {
    next(err);
  }
};

exports.getAnalyticsBookings = async (req, res, next) => {
  try {
    const data = await adminService.getAnalyticsBookings();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getAnalyticsRevenue = async (req, res, next) => {
  try {
    const data = await adminService.getAnalyticsRevenue();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
