const express = require('express');
const router = express.Router();
const getServerSession = require('../../middleware/serverSession');
const User = require('../../models/User');

router.get('/me', getServerSession, (req, res) => {
  res.json({ user: req.user });
});

// Get all pharmacy users
router.get('/pharmacy-users', getServerSession, async (req, res, next) => {
  try {
    // Only fetch users with role 'pharmacyUser'
    const users = await User.find({ role: 'pharmacyUser' })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Delete a pharmacy user
router.delete('/pharmacy-users/:id', getServerSession, async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
