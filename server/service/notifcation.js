const Notification = require('../models/Notifications');
const User = require('../models/User');
const { getIO, emitUserNotification, emitAdminNotification, emitPharmacyNotification } = require('../utils/socket');


async function notifyAllUsers({ type = 'system', message, payload = {} }) {
  try {
    // Get all active users (excluding admins, or including them based on your needs)
    const users = await User.find({ isActive: true, role: { $ne: 'admin' } })
      .select('_id')
      .lean();

    if (!users || users.length === 0) {
      console.log('No users found to notify');
      return;
    }

    // Create notifications for all users
    const notifications = users.map(user => ({
      user: user._id,
      type,
      message,
      payload,
      isRead: false,
    }));

    // Bulk insert notifications
    await Notification.insertMany(notifications);

    // Emit socket notification to all users
    emitUserNotification('notification:new', {
      type,
      message,
      payload,
      createdAt: new Date().toISOString(),
    });

    console.log(`Notifications sent to ${users.length} users`);
  } catch (error) {
    console.error('Error sending notifications to all users:', error);
    throw error;
  }
}


async function notifyUser({ userId, type = 'system', message, payload = {} }) {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      message,
      payload,
      isRead: false,
    });

    // Emit socket notification to specific user
    const io = getIO();
    if (io) {
      io.to(`user:${userId.toString()}`).emit('notification:new', {
        type,
        message,
        payload,
        createdAt: notification.createdAt.toISOString(),
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification for user:', error);
    throw error;
  }
}


async function notifyUsers({ userIds, type = 'system', message, payload = {} }) {
  try {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    // Create notifications for specified users
    const notifications = userIds.map(userId => ({
      user: userId,
      type,
      message,
      payload,
      isRead: false,
    }));

    // Bulk insert notifications
    const createdNotifications = await Notification.insertMany(notifications);

    // Emit socket notification to all specified users
    const io = getIO();
    if (io) {
      const notificationPayload = {
        type,
        message,
        payload,
        createdAt: new Date().toISOString(),
      };

      userIds.forEach(userId => {
        io.to(`user:${userId.toString()}`).emit('notification:new', notificationPayload);
      });
    }

    return createdNotifications;
  } catch (error) {
    console.error('Error creating notifications for users:', error);
    throw error;
  }
}


async function notifyAdminsAndPharmacy({ type = 'payment', message, payload = {} }) {
  try {
    // Get all admins and pharmacy users
    const adminsAndPharmacy = await User.find({ 
      isActive: true, 
      role: { $in: ['admin', 'pharmacyUser'] } 
    })
      .select('_id')
      .lean();

    if (!adminsAndPharmacy || adminsAndPharmacy.length === 0) {
      console.log('No admins or pharmacy users found to notify');
      return;
    }

    // Create notifications for all admins and pharmacy users
    const notifications = adminsAndPharmacy.map(user => ({
      user: user._id,
      type,
      message,
      payload,
      isRead: false,
    }));

    // Bulk insert notifications
    await Notification.insertMany(notifications);

    // Emit socket notification to admins
    emitAdminNotification('notification:new', {
      type,
      message,
      payload,
      createdAt: new Date().toISOString(),
    });

    // Emit socket notification to pharmacy users
    emitPharmacyNotification('notification:new', {
      type,
      message,
      payload,
      createdAt: new Date().toISOString(),
    });

    console.log(`Notifications sent to ${adminsAndPharmacy.length} admins and pharmacy users`);
  } catch (error) {
    console.error('Error sending notifications to admins and pharmacy:', error);
    throw error;
  }
}

module.exports = {
  notifyAllUsers,
  notifyUser,
  notifyUsers,
  notifyAdminsAndPharmacy,
};

