const express = require('express');
const router = express.Router();

// Mount API routes
const authRouter = require('./api/auth');
const protectedRouter = require('./api/protected');
const chatbotRouter = require('./api/chatbot');
const drugRouter = require('./api/drug');

router.use('/auth', authRouter);
router.use('/protected', protectedRouter);
router.use('/chatbot', chatbotRouter);
router.use('/drugs', drugRouter);

module.exports = router;
