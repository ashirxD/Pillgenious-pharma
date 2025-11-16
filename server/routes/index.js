const express = require('express');
const router = express.Router();

// Mount API routes
const authRouter = require('./api/auth');
const protectedRouter = require('./api/protected');
const chatbotRouter = require('./api/chatbot');
const drugRouter = require('./api/drug');
const cartRouter = require('./api/cart');
const orderRouter = require('./api/order');
const userRouter = require('./api/user');
const dashboardRouter = require('./api/dashboard');
const notificationsRouter = require('./api/notifications');

router.use('/auth', authRouter);
router.use('/protected', protectedRouter);
router.use('/chatbot', chatbotRouter);
router.use('/drugs', drugRouter);
router.use('/cart', cartRouter);
router.use('/orders', orderRouter);
router.use('/user', userRouter);
router.use('/dashboard', dashboardRouter);
router.use('/notifications', notificationsRouter);

module.exports = router;
