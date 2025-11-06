const jwt = require('jsonwebtoken');
const { ADMIN_CREDENTIALS } = require('../config/adminCredentials');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

/**
 * Middleware to authenticate and authorize admin users
 * Handles both hardcoded admins and database admins
 */
async function requireAdmin(req, res, next) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify and decode token
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Check if it's a hardcoded admin
    const adminUser = ADMIN_CREDENTIALS.find(admin => admin.id === payload.sub);
    if (adminUser && adminUser.role === 'admin') {
      req.user = {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      };
      return next();
    }

    // Check if it's a database user with admin role
    const user = await User.findById(payload.sub).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - User not found' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    // Set user in request
    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = requireAdmin;

