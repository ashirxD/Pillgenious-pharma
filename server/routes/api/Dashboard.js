const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const getServerSession = require('../../middleware/serverSession');
const User = require('../../models/User');
const Order = require('../../models/Order');
const Drug = require('../../models/Drug');
const CartItem = require('../../models/CartItem');

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

/**
 * GET /api/dashboard/user-stats
 * Regular users - Get user-specific statistics for dashboard
 */
router.get('/user-stats', getServerSession, async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if user is a hardcoded admin
    const { ADMIN_CREDENTIALS } = require('../../config/adminCredentials');
    const isAdmin = ADMIN_CREDENTIALS.some(admin => admin.id === userId);
    
    if (isAdmin || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(403).json({ error: 'This endpoint is for regular users only' });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get user-specific statistics
    const [
      totalOrders,
      pendingPaymentOrders,
      completedOrders,
      itemsInCart,
      availableDrugs,
      pendingOrders
    ] = await Promise.all([
      // Total orders placed by user
      Order.countDocuments({ user: userObjectId }),
      
      // Orders with pending payment
      Order.countDocuments({ 
        user: userObjectId,
        paymentStatus: 'Pending'
      }),
      
      // Completed/delivered orders
      Order.countDocuments({ 
        user: userObjectId,
        status: 'Delivered'
      }),
      
      // Items in cart (status 1 means in cart) - sum of quantities
      CartItem.find({ 
        user: userObjectId,
        status: 1
      })
        .select('quantity')
        .lean()
        .then(items => items.reduce((sum, item) => sum + (item.quantity || 0), 0))
        .catch(() => 0),
      
      // Available drugs (active and in stock)
      Drug.countDocuments({ 
        isActive: true,
        stockQuantity: { $gt: 0 }
      }),
      
      // Pending orders (not delivered or cancelled)
      Order.countDocuments({ 
        user: userObjectId,
        status: { $nin: ['Delivered', 'Cancelled', 'Refunded'] }
      })
    ]);

    // Calculate total spent (from completed orders)
    const completedOrdersData = await Order.find({ 
      user: userObjectId,
      status: 'Delivered',
      paymentStatus: 'Paid'
    }).select('total').lean();
    
    const totalSpent = completedOrdersData.reduce((sum, order) => sum + (order.total || 0), 0);

    res.json({
      totalOrders,
      pendingPaymentOrders,
      completedOrders,
      itemsInCart,
      availableDrugs,
      pendingOrders,
      totalSpent: parseFloat(totalSpent.toFixed(2))
    });
  } catch (err) {
    console.error('Error fetching user stats:', err);
    next(err);
  }
});

/**
 * GET /api/dashboard/ads
 * Public - Get promotional medicine ads for banner display
 */
router.get('/ads', async (req, res, next) => {
  try {
    // Hardcoded promotional ads - featuring real app features
    const ads = [
      {
        id: 1,
        title: 'AI Consultant',
        subtitle: 'Free AI Consultant for Your Health Queries',
        description: 'Get instant answers about medications, health tips, and wellness advice from our AI-powered medical assistant',
        gradient: 'from-teal-500 to-teal-700',
        icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z',
        textColor: 'text-white'
      },
      {
        id: 2,
        title: 'Smart Search',
        subtitle: 'Find Your Medicines Easily',
        description: 'Search through our extensive catalog of medicines with AI-powered search for quick results',
        gradient: 'from-blue-500 to-blue-700',
        icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
        textColor: 'text-white'
      },
      {
        id: 3,
        title: 'Order Tracking',
        subtitle: 'Track Your Orders in Real-Time',
        description: 'Monitor your medication orders from placement to delivery with real-time updates',
        gradient: 'from-purple-500 to-purple-700',
        icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
        textColor: 'text-white'
      },
      {
        id: 4,
        title: 'Secure Payments',
        subtitle: 'Safe and Secure Payment Options',
        description: 'Complete your purchases with confidence using our secure payment gateway',
        gradient: 'from-green-500 to-green-700',
        icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
        textColor: 'text-white'
      },
      {
        id: 5,
        title: 'Stay Informed',
        subtitle: 'Get Notified About New Medicines',
        description: 'Receive instant notifications when new medicines are added to our pharmacy',
        gradient: 'from-orange-500 to-orange-700',
        icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
        textColor: 'text-white'
      },
      {
        id: 6,
        title: 'Medication Info',
        subtitle: 'Comprehensive Drug Information',
        description: 'Access detailed information about medications, dosages, and safety guidelines',
        gradient: 'from-indigo-500 to-indigo-700',
        icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 008 10.172V5L7 4z',
        textColor: 'text-white'
      }
    ];

    res.json(ads);
  } catch (err) {
    console.error('Error fetching ads:', err);
    next(err);
  }
});

module.exports = router;

