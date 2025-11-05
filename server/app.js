require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');

const app = express();

// Settings
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Passport (JWT)
const passport = require('./utils/passport');
app.use(passport.initialize());

// Connect to DB
connectDB();

// Mount routes
const routes = require('./routes');
app.use('/api', routes);



// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
