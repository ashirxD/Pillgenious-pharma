const express = require('express');
const router = express.Router();

// Mount API routes
const authRouter = require('./api/auth');
const protectedRouter = require('./api/protected');
const chatbotRouter = require('./api/chatbot');

router.use('/auth', authRouter);
router.use('/protected', protectedRouter);
router.use('/chatbot', chatbotRouter);

module.exports = router;
