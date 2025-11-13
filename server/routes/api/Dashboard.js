const express = require('express');
const router = express.Router();
const getServerSession = require('../../middleware/serverSession');
const User = require('../../models/User');
const Order = require('../../models/Order');
const Drug = require('../../models/Drug');

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

/**
 * GET /api/dashboard/stats
 * Admin & Pharmacy users - Get overview statistics for dashboard cards
 */
router.get('/stats', getServerSession, allowRoles('admin', 'pharmacyUser'), async (req, res, next) => {
  try {
    const [totalUsers, totalPharmacyUsers, totalOrders, totalMedicines] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'pharmacyUser' }),
      Order.countDocuments({}),
      Drug.countDocuments({})
    ]);

    res.json({
      totalUsers,
      totalPharmacyUsers,
      totalOrders,
      totalMedicines
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/dashboard/recent-activity
 * Admin only - Get recent activity details for dashboard feed
 */
router.get('/recent-activity', getServerSession, allowRoles('admin', 'pharmacyUser'), async (req, res, next) => {
  try {
    const includePharmacyUserActivity = req.user.role === 'admin';

    const queries = [
      includePharmacyUserActivity
        ? User.findOne({ role: 'pharmacyUser' }).sort({ createdAt: -1 }).lean()
        : Promise.resolve(null),
      Drug.findOne({}).sort({ createdAt: -1 }).lean(),
      Order.findOne({ status: 'Delivered' }).sort({ deliveredAt: -1 }).populate('user', 'name email').lean()
    ];

    const [latestPharmacyUser, latestDrug, latestCompletedOrder] = await Promise.all(queries);

    const response = {
      latestPharmacyUser: includePharmacyUserActivity && latestPharmacyUser
        ? {
            id: latestPharmacyUser._id,
            name: latestPharmacyUser.name,
            email: latestPharmacyUser.email,
            createdAt: latestPharmacyUser.createdAt
          }
        : null,
      latestDrug: latestDrug
        ? {
            id: latestDrug._id,
            drugName: latestDrug.drugName,
            type: latestDrug.type,
            createdAt: latestDrug.createdAt
          }
        : null,
      latestCompletedOrder: latestCompletedOrder
        ? {
            id: latestCompletedOrder._id,
            orderNumber: latestCompletedOrder.orderNumber,
            total: latestCompletedOrder.total,
            deliveredAt: latestCompletedOrder.deliveredAt,
            customer: latestCompletedOrder.user
              ? {
                  id: latestCompletedOrder.user._id,
                  name: latestCompletedOrder.user.name,
                  email: latestCompletedOrder.user.email
                }
              : null
          }
        : null
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

