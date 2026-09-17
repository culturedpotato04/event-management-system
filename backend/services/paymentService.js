const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { releaseInventory } = require('./ticketService');
const { createNotification } = require('./notificationService');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');

const generateTransactionId = () => {
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TXN-${randomPart}`;
};

exports.processDemoPayment = async (data, user) => {
  const { bookingId, method, simulate } = data;

  const booking = await Booking.findById(bookingId);
  
  if (!booking) {
    throw new ErrorResponse('Booking not found', 404, 'BOOKING_NOT_FOUND');
  }

  if (booking.user.toString() !== user.id) {
    throw new ErrorResponse('Not authorized to pay for this booking', 403, 'BOOKING_NOT_OWNED');
  }

  if (booking.status === 'confirmed') {
    throw new ErrorResponse('Booking is already confirmed and paid', 400, 'PAYMENT_ALREADY_PROCESSED');
  }

  if (booking.status === 'cancelled' || booking.status === 'failed') {
    throw new ErrorResponse('Cannot process payment for a cancelled or failed booking', 400, 'PAYMENT_NOT_ALLOWED');
  }

  // Create payment record
  const payment = await Payment.create({
    transactionId: generateTransactionId(),
    booking: booking._id,
    user: user.id,
    amount: booking.totalAmount,
    method,
    status: 'pending'
  });

  // Link payment to booking
  booking.payment = payment._id;
  await booking.save();

  // Simulate gateway processing
  const isSuccess = simulate ? (simulate === 'success') : true;

  if (isSuccess) {
    payment.status = 'successful';
    payment.paidAt = new Date();
    await payment.save();

    booking.status = 'confirmed';
    await booking.save();

    createNotification({
      user: user.id,
      type: 'payment_success',
      title: 'Payment Successful',
      message: `Payment of ${booking.totalAmount} for booking ${booking.bookingNumber} was successful. Your booking is confirmed.`,
      referenceType: 'Booking',
      referenceId: booking._id
    });

    return { payment, bookingStatus: booking.status };
  } else {
    payment.status = 'failed';
    payment.failureReason = 'Demo simulated failure';
    await payment.save();

    booking.status = 'failed';
    await booking.save();

    // Release inventory upon failure
    for (const ticket of booking.tickets) {
      await releaseInventory(ticket.ticketType, ticket.quantity);
    }

    createNotification({
      user: user.id,
      type: 'payment_failed',
      title: 'Payment Failed',
      message: `Your payment for booking ${booking.bookingNumber} failed. The booking has been marked as failed.`,
      referenceType: 'Booking',
      referenceId: booking._id
    });

    return { payment, bookingStatus: booking.status };
  }
};

exports.getPaymentById = async (id, user) => {
  const payment = await Payment.findById(id).populate('booking', 'bookingNumber status');
  
  if (!payment) {
    throw new ErrorResponse('Payment not found', 404, 'PAYMENT_NOT_FOUND');
  }

  if (payment.user.toString() !== user.id && user.role !== 'admin') {
    throw new ErrorResponse('Not authorized to access this payment', 403, 'BOOKING_NOT_OWNED');
  }

  return payment;
};
