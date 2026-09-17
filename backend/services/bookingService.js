const Booking = require('../models/Booking');
const Event = require('../models/Event');
const TicketType = require('../models/TicketType');
const Payment = require('../models/Payment');
const { reserveInventory, releaseInventory, isPurchasable } = require('./ticketService');
const { createNotification } = require('./notificationService');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');

// Generate unique booking number
const generateBookingNumber = () => {
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  const year = new Date().getFullYear();
  return `EVT-${year}-${randomPart}`;
};

exports.createBooking = async (data, user) => {
  const { eventId, tickets } = data;

  // Verify Event
  const event = await Event.findById(eventId);
  if (!event) throw new ErrorResponse('Event not found', 404, 'EVENT_NOT_FOUND');
  if (event.status !== 'published') throw new ErrorResponse('Event is not bookable', 400, 'EVENT_NOT_BOOKABLE');
  if (event.endDateTime && new Date() > event.endDateTime) throw new ErrorResponse('Event has already ended', 400, 'EVENT_NOT_BOOKABLE');

  // Verify tickets and calculate total
  let totalAmount = 0;
  const processedTickets = [];
  const ticketIdSet = new Set();

  for (const tReq of tickets) {
    if (ticketIdSet.has(tReq.ticketTypeId)) {
      throw new ErrorResponse('Duplicate ticket type entries not allowed', 400, 'TICKET_INVALID_QUANTITY');
    }
    ticketIdSet.add(tReq.ticketTypeId);

    const ticketType = await TicketType.findById(tReq.ticketTypeId);
    if (!ticketType) throw new ErrorResponse(`Ticket type not found`, 404, 'TICKET_TYPE_NOT_FOUND');
    if (ticketType.event.toString() !== eventId) throw new ErrorResponse('Ticket type does not belong to this event', 400, 'TICKET_TYPE_WRONG_EVENT');

    if (!isPurchasable(ticketType, event)) {
      throw new ErrorResponse(`Ticket ${ticketType.name} is not currently purchasable`, 400, 'TICKET_SALE_NOT_STARTED');
    }

    if (tReq.quantity < ticketType.minPerBooking || tReq.quantity > ticketType.maxPerBooking) {
      throw new ErrorResponse(`Quantity for ${ticketType.name} must be between ${ticketType.minPerBooking} and ${ticketType.maxPerBooking}`, 400, 'INVALID_TICKET_QUANTITY');
    }

    const subtotal = Number((ticketType.price * tReq.quantity).toFixed(2));
    totalAmount += subtotal;

    processedTickets.push({
      ticketType: ticketType._id,
      nameSnapshot: ticketType.name,
      priceSnapshot: ticketType.price,
      quantity: tReq.quantity,
      subtotal
    });
  }

  // Reserve inventory synchronously/atomically for each ticket to prevent overbooking
  const reservations = [];
  try {
    for (const pt of processedTickets) {
      await reserveInventory(pt.ticketType, pt.quantity);
      reservations.push(pt);
    }
  } catch (err) {
    // If any reservation fails, rollback the ones that succeeded so far
    for (const reserved of reservations) {
      await releaseInventory(reserved.ticketType, reserved.quantity);
    }
    throw err;
  }

  // Create Booking
  try {
    const booking = await Booking.create({
      bookingNumber: generateBookingNumber(),
      user: user.id,
      event: eventId,
      status: 'pending',
      totalAmount: Number(totalAmount.toFixed(2)),
      tickets: processedTickets
    });

    // Fire & Forget Notification
    createNotification({
      user: user.id,
      type: 'booking_created',
      title: 'Booking Initiated',
      message: `Your booking for event has been initiated. Please complete your payment.`,
      referenceType: 'Booking',
      referenceId: booking._id
    });

    return booking;
  } catch (error) {
    // Rollback inventory if DB failed to create booking
    for (const reserved of reservations) {
      await releaseInventory(reserved.ticketType, reserved.quantity);
    }
    throw error;
  }
};

exports.getBookings = async (query, pagination, user) => {
  const { page, limit } = pagination;
  const startIndex = (page - 1) * limit;

  // Security constraint: Normal user can only see their own
  let safeQuery = { ...query };
  if (user.role === 'user') {
    safeQuery.user = user.id;
  } else if (user.role === 'organizer') {
    // If organizer is fetching generic list without specifying event, 
    // restrict to events they own (not trivially possible with simple query without lookup, 
    // but we can let them query specific eventIds which we validate).
    // For simplicity, if they want to see "my bookings", we restrict to their user ID.
    // If they specify eventId, we check ownership in controller.
    if (!safeQuery.event) {
      safeQuery.user = user.id;
    }
  }

  const dbQuery = Booking.find(safeQuery)
    .populate('event', 'title startDateTime')
    .skip(startIndex)
    .limit(limit)
    .sort('-createdAt');

  const bookings = await dbQuery;
  const total = await Booking.countDocuments(safeQuery);

  return {
    bookings,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

exports.getBookingById = async (id, user) => {
  const booking = await Booking.findById(id)
    .populate('event')
    .populate('user', 'name email');

  if (!booking) throw new ErrorResponse('Booking not found', 404, 'BOOKING_NOT_FOUND');

  // Authorization check
  const isOwner = booking.user._id.toString() === user.id;
  const isEventOrganizer = booking.event.organizer.toString() === user.id;
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isEventOrganizer && !isAdmin) {
    throw new ErrorResponse('Not authorized to access this booking', 403, 'BOOKING_NOT_OWNED');
  }

  return booking;
};

exports.cancelBooking = async (id, reason, user) => {
  const booking = await this.getBookingById(id, user); // reuses auth logic

  if (booking.status === 'cancelled') {
    throw new ErrorResponse('Booking is already cancelled', 400, 'BOOKING_ALREADY_CANCELLED');
  }

  if (booking.status === 'failed') {
    throw new ErrorResponse('Failed bookings cannot be cancelled', 400, 'BOOKING_NOT_CANCELLABLE');
  }

  if (booking.status === 'completed') {
    throw new ErrorResponse('Completed bookings cannot be cancelled', 400, 'BOOKING_NOT_CANCELLABLE');
  }

  // Prevent cancellation if event has started
  if (new Date() > booking.event.startDateTime) {
    throw new ErrorResponse('Cannot cancel booking after the event has started', 400, 'BOOKING_NOT_CANCELLABLE');
  }

  // Handle Refund if confirmed
  if (booking.status === 'confirmed') {
    if (booking.payment) {
      await Payment.findByIdAndUpdate(booking.payment, {
        status: 'refunded',
        refundDate: new Date()
      });
    }
  }

  // Release inventory
  for (const ticket of booking.tickets) {
    await releaseInventory(ticket.ticketType, ticket.quantity);
  }

  booking.status = 'cancelled';
  booking.cancellationDate = new Date();
  booking.cancellationReason = reason || 'User requested cancellation';
  
  await booking.save();

  // Fire & Forget Notification
  createNotification({
    user: booking.user._id,
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: `Your booking ${booking.bookingNumber} has been successfully cancelled.`,
    referenceType: 'Booking',
    referenceId: booking._id
  });

  return booking;
};
