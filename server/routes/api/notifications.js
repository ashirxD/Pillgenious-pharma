const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Notification = require('../../models/Notifications');
const getServerSession = require('../../middleware/serverSession');
const { ADMIN_CREDENTIALS } = require('../../config/adminCredentials');

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 */
router.get('/', getServerSession, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const userRole = req.user.role;
    
    console.log(`[Notifications] Request from user: ${userId}, role: ${userRole}`);
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user is a hardcoded admin (has non-ObjectId ID)
    const isAdmin = ADMIN_CREDENTIALS.some(admin => admin.id === userId);
    if (isAdmin) {
      console.log(`[Notifications] User ${userId} is an admin, returning empty array`);
      // Admins don't have notifications in the database
      return res.json([]);
    }

    // Only proceed if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`[Notifications] User ID ${userId} is not a valid ObjectId, returning empty array`);
      return res.json([]);
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Check total notifications for this user
    const totalCount = await Notification.countDocuments({ user: userObjectId });
    console.log(`[Notifications] Total notifications in DB for user ${userId}: ${totalCount}`);
    
    const notifications = await Notification.find({ user: userObjectId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    console.log(`[Notifications] Fetched ${notifications.length} notifications for user ${userId}`);
    if (notifications.length > 0) {
      console.log(`[Notifications] Sample notification:`, {
        id: notifications[0]._id,
        message: notifications[0].message,
        user: notifications[0].user
      });
    }
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    next(err);
  }
});

/**
 * GET /api/notifications/unread
 * Get unread notifications for the authenticated user
 */
router.get('/unread', getServerSession, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user is a hardcoded admin
    const isAdmin = ADMIN_CREDENTIALS.some(admin => admin.id === userId);
    if (isAdmin || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json([]);
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const notifications = await Notification.find({ 
      user: userObjectId,
      isRead: false 
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json(notifications);
  } catch (err) {
    console.error('Error fetching unread notifications:', err);
    next(err);
  }
});

/**
 * GET /api/notifications/count
 * Get unread notification count for the authenticated user
 */
router.get('/count', getServerSession, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user is a hardcoded admin
    const isAdmin = ADMIN_CREDENTIALS.some(admin => admin.id === userId);
    if (isAdmin || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ count: 0 });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const count = await Notification.countDocuments({ 
      user: userObjectId,
      isRead: false 
    });

    res.json({ count });
  } catch (err) {
    console.error('Error counting notifications:', err);
    next(err);
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a specific notification as read
 */
router.put('/:id/read', getServerSession, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const notificationId = req.params.id;

    // Check if user is a hardcoded admin
    const isAdmin = ADMIN_CREDENTIALS.some(admin => admin.id === userId);
    if (isAdmin || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId,
        user: userObjectId 
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(notification);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Notification not found' });
    }
    next(err);
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the authenticated user
 */
router.put('/read-all', getServerSession, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    // Check if user is a hardcoded admin
    const isAdmin = ADMIN_CREDENTIALS.some(admin => admin.id === userId);
    if (isAdmin || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.json({ 
        message: 'All notifications marked as read',
        updatedCount: 0 
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const result = await Notification.updateMany(
      { 
        user: userObjectId,
        isRead: false 
      },
      { isRead: true }
    );

    res.json({ 
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount 
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/notifications/:id
 * Delete a specific notification
 */
router.delete('/:id', getServerSession, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const notificationId = req.params.id;

    // Check if user is a hardcoded admin
    const isAdmin = ADMIN_CREDENTIALS.some(admin => admin.id === userId);
    if (isAdmin || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userObjectId
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ error: 'Notification not found' });
    }
    next(err);
  }
});

module.exports = router;

