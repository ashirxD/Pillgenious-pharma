const express = require('express');
const router = express.Router();

// Mount API routes
const authRouter = require('./api/auth');
const protectedRouter = require('./api/protected');

router.use('/auth', authRouter);
router.use('/protected', protectedRouter);

module.exports = router;
