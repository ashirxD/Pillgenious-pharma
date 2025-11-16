const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { hashPassword } = require('../../utils/password');
const { ADMIN_CREDENTIALS } = require('../../config/adminCredentials');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function signToken(user) {
  const payload = { sub: user._id || user.id, iat: Date.now() };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    // Hash password here instead of using a pre-save hook
    const hashed = await hashPassword(password);
    const user = new User({ name, email, password: hashed, role: role || 'user' });
    await user.save();

    const token = signToken(user);
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    // Check for hard-coded admin credentials first
    const adminUser = ADMIN_CREDENTIALS.find(admin => admin.email === email.toLowerCase());
    if (adminUser) {
      // Check if password matches (plain text comparison for hard-coded admins)
      if (adminUser.password === password) {
        const token = signToken(adminUser);
        return res.json({ 
          user: { 
            id: adminUser.id, 
            name: adminUser.name, 
            email: adminUser.email,
            role: adminUser.role 
          }, 
          token 
        });
      }
      // If admin email found but password wrong
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // If not admin, check regular users in database
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.isActive === false) {
      return res.status(403).json({ error: 'This user has been blocked' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    res.json({ 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        role: user.role || 'user'
      }, 
      token 
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
