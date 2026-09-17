const bookingService = require('../services/bookingService');
const Event = require('../models/Event');
const ErrorResponse = require('../utils/errorResponse');

exports.createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.body, req.user);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    
    if (req.query.eventId) {
      // Validate organizer ownership if not admin/user
      if (req.user.role === 'organizer') {
        const event = await Event.findById(req.query.eventId);
        if (event && event.organizer.toString() !== req.user.id) {
          return next(new ErrorResponse('Not authorized to view bookings for this event', 403, 'BOOKING_NOT_OWNED'));
        }
      }
      query.event = req.query.eventId;
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await bookingService.getBookings(query, { page, limit }, req.user);

    res.status(200).json({
      success: true,
      data: result.bookings,
      pagination: result.pagination
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

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.body.reason, req.user);
    res.status(200).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};
