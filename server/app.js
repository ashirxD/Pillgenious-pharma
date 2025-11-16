require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const http = require('http');
const { initSocket } = require('./utils/socket');

const app = express();

// Settings
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

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

// Create HTTP server to attach Socket.IO
const server = http.createServer(app);
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

module.exports = app;
