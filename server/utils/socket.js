const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ADMIN_CREDENTIALS } = require('../config/adminCredentials');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

let ioInstance;

const defaultCorsOrigins = process.env.SOCKET_CORS_ORIGINS
  ? process.env.SOCKET_CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['*'];

async function authenticateSocket(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return next(new Error('Unauthorized'));
    }

    const payload = jwt.verify(token, JWT_SECRET);

    if (!payload || typeof payload !== 'object' || !payload.sub) {
      return next(new Error('Unauthorized'));
    }

    const adminUser = ADMIN_CREDENTIALS.find(admin => admin.id === payload.sub);
    if (adminUser) {
      socket.user = {
        _id: adminUser.id,
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
      };
      return next();
    }

    const user = await User.findById(payload.sub).select('_id email role name').lean();
    if (!user) {
      return next(new Error('Unauthorized'));
    }

    socket.user = {
      _id: user._id,
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return next();
  } catch (error) {
    console.error('Socket auth error:', error.message);
    return next(new Error('Unauthorized'));
  }
}

function initSocket(server) {
  if (ioInstance) {
    return ioInstance;
  }

  ioInstance = new Server(server, {
    cors: {
      origin: defaultCorsOrigins,
      credentials: true,
    },
  });

  ioInstance.use(authenticateSocket);

  ioInstance.on('connection', socket => {
    if (socket.user?.role === 'admin') {
      socket.join('admins');
    } else if (socket.user?.role === 'pharmacyUser') {
      socket.join('pharmacy');
      socket.join(`user:${socket.user._id.toString()}`);
    } else if (socket.user?._id) {
      socket.join(`user:${socket.user._id.toString()}`);
    }

    socket.on('disconnect', reason => {
      console.log(`Socket ${socket.id} disconnected: ${reason}`);
    });
  });

  return ioInstance;
}

function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.IO is not initialized. Call initSocket(server) first.');
  }
  return ioInstance;
}

function emitAdminNotification(event, payload) {
  if (!ioInstance) {
    console.warn('emitAdminNotification called before socket initialization');
    return;
  }

  ioInstance.to('admins').emit(event, payload);
}

function emitPharmacyNotification(event, payload) {
  if (!ioInstance) {
    console.warn('emitPharmacyNotification called before socket initialization');
    return;
  }

  ioInstance.to('pharmacy').emit(event, payload);
}

function emitUserNotification(event, payload) {
  if (!ioInstance) {
    console.warn('emitUserNotification called before socket initialization');
    return;
  }

  // Get all connected sockets
  const sockets = ioInstance.sockets.sockets;
  let emittedCount = 0;
  
  // Emit to all sockets that are not admins
  sockets.forEach((socket) => {
    if (socket.user && socket.user.role !== 'admin') {
      socket.emit(event, payload);
      emittedCount++;
    }
  });

  console.log(`Emitted ${event} to ${emittedCount} user(s)`);
}

module.exports = {
  initSocket,
  getIO,
  emitAdminNotification,
  emitPharmacyNotification,
  emitUserNotification,
};

