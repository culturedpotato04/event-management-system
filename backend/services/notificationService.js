const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

exports.createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    // Suppress error so it doesn't break main workflows
    return null;
  }
};

exports.createBulkNotifications = async (notifications) => {
  try {
    const result = await Notification.insertMany(notifications, { ordered: false });
    return result;
  } catch (error) {
    console.error('Failed to create bulk notifications:', error.message);
    return null;
  }
};

exports.getUserNotifications = async (userId, pagination) => {
  const { page, limit } = pagination;
  const startIndex = (page - 1) * limit;

  const notifications = await Notification.find({ user: userId })
    .sort('-createdAt')
    .skip(startIndex)
    .limit(limit);

  const total = await Notification.countDocuments({ user: userId });

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

exports.getUnreadCount = async (userId) => {
  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
  return unreadCount;
};

exports.markAsRead = async (id, userId) => {
  const notification = await Notification.findById(id);
  if (!notification) throw new ErrorResponse('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');

  if (notification.user.toString() !== userId) {
    throw new ErrorResponse('Not authorized to update this notification', 403, 'NOTIFICATION_NOT_OWNED');
  }

  notification.isRead = true;
  await notification.save();
  return notification;
};

exports.markAllAsRead = async (userId) => {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
  return true;
};

exports.deleteNotification = async (id, userId) => {
  const notification = await Notification.findById(id);
  if (!notification) throw new ErrorResponse('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');

  if (notification.user.toString() !== userId) {
    throw new ErrorResponse('Not authorized to delete this notification', 403, 'NOTIFICATION_NOT_OWNED');
  }

  await Notification.findByIdAndDelete(id);
  return notification;
};
