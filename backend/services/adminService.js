const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');

exports.getDashboardMetrics = async () => {
  const [
    userStats,
    eventStats,
    bookingStats,
    paymentStats,
    reviewStats,
    revenueStats
  ] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } }
        }
      }
    ]),
    Event.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } },
          draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      }
    ]),
    Booking.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
        }
      }
    ]),
    Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          successful: { $sum: { $cond: [{ $eq: ['$status', 'successful'] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
          refunded: { $sum: { $cond: [{ $eq: ['$status', 'refunded'] }, 1, 0] } }
        }
      }
    ]),
    Review.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]),
    Payment.aggregate([
      { $match: { status: 'successful' } },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$amount' }
        }
      }
    ])
  ]);

  return {
    users: userStats[0] || { total: 0, active: 0, inactive: 0 },
    events: eventStats[0] || { total: 0, published: 0, draft: 0, cancelled: 0, completed: 0 },
    bookings: bookingStats[0] || { total: 0, pending: 0, confirmed: 0, cancelled: 0, failed: 0 },
    payments: {
      ...(paymentStats[0] || { total: 0, successful: 0, failed: 0, refunded: 0 }),
      revenue: revenueStats[0] ? revenueStats[0].revenue : 0
    },
    reviews: {
      total: reviewStats[0] ? reviewStats[0].total : 0,
      averageRating: reviewStats[0] && reviewStats[0].averageRating ? Number(reviewStats[0].averageRating.toFixed(1)) : 0
    }
  };
};

exports.getAnalyticsBookings = async () => {
  // Simple grouping of bookings by status for analytics
  const byStatus = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  return { byStatus };
};

exports.getAnalyticsRevenue = async () => {
  const revenueByMethod = await Payment.aggregate([
    { $match: { status: 'successful' } },
    {
      $group: {
        _id: '$method',
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return { revenueByMethod };
};
