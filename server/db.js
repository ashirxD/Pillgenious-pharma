const mongoose = require('mongoose');

/**
 * Connect to MongoDB using environment variable MONGO_URI or a local fallback.
 */
async function connectDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pillgenious';

  try {
    // Use mongoose's new connection API
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message || err);
    // Exit process if DB connection fails in production
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
}

module.exports = connectDB;
