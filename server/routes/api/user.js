const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { hashPassword } = require('../../utils/password');
const { ADMIN_CREDENTIALS } = require('../../config/adminCredentials');
const getServerSession = require('../../middleware/serverSession');
const requireAdmin = require('../../middleware/adminAuth');

/**
 * GET /api/user
 * Admin only - Get all users (excluding hardcoded admins)
 */
router.get('/', requireAdmin, async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/user/:id/status
 * Admin only - Activate or block user
 */
router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be provided as a boolean.' });
    }

    if (userId === req.user.id?.toString()) {
      return res.status(400).json({ error: 'You cannot change your own status.' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot change status of admin users.' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      message: `User ${isActive ? 'activated' : 'blocked'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/user/profile
 * Get current user's profile
 */
router.get('/profile', getServerSession, async (req, res, next) => {
  try {
    const user = req.user;
    
    // Check if it's a hardcoded admin (admin users have id matching ADMIN_CREDENTIALS)
    const adminUser = ADMIN_CREDENTIALS.find(admin => admin.id === user.id || admin.id === user._id);
    if (adminUser) {
      return res.json({
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
        role: adminUser.role,
        isActive: true
        }
      });
    }

    // For database users, fetch from database (serverSession already provides user, but we fetch full details)
    const dbUser = await User.findById(user._id || user.id).select('-password');
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        isActive: dbUser.isActive
      }
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/user/profile
 * Update current user's profile
 */
router.put('/profile', getServerSession, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = req.user;

    // Check if it's a hardcoded admin (admin users have id matching ADMIN_CREDENTIALS)
    const adminUser = ADMIN_CREDENTIALS.find(admin => admin.id === user.id || admin.id === user._id);
    if (adminUser) {
      return res.status(403).json({ 
        error: 'Admin profile updates are not allowed through this endpoint' 
      });
    }

    // For database users, update their profile
    const dbUser = await User.findById(user._id || user.id);
    if (!dbUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update name if provided
    if (name !== undefined) {
      dbUser.name = name;
    }

    // Update email if provided (check for uniqueness)
    if (email !== undefined && email !== dbUser.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      const userId = (user._id || user.id).toString();
      if (emailExists && emailExists._id.toString() !== userId) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      dbUser.email = email.toLowerCase();
    }

    // Update password if provided
    if (password !== undefined && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      dbUser.password = await hashPassword(password);
    }

    await dbUser.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: dbUser._id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        isActive: dbUser.isActive
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(err);
  }
});

module.exports = router;

