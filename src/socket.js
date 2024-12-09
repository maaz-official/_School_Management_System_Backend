import { Server } from 'socket.io';
import { verifyToken } from './utils/jwt.js';
import { logger } from './utils/logger.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = await verifyToken(token);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.id}`);
    
    // Join user to their personal room
    socket.join(socket.user.id.toString());
    
    // Update online status
    onlineUsers.set(socket.user.id, true);
    io.emit('userStatus', {
      userId: socket.user.id,
      status: 'online'
    });

    // Handle typing indicators
    socket.on('typing', ({ recipientId, groupId }) => {
      if (recipientId) {
        io.to(recipientId).emit('userTyping', {
          userId: socket.user.id,
          typing: true
        });
      } else if (groupId) {
        socket.to(groupId).emit('userTyping', {
          userId: socket.user.id,
          typing: true
        });
      }
    });

    socket.on('stopTyping', ({ recipientId, groupId }) => {
      if (recipientId) {
        io.to(recipientId).emit('userTyping', {
          userId: socket.user.id,
          typing: false
        });
      } else if (groupId) {
        socket.to(groupId).emit('userTyping', {
          userId: socket.user.id,
          typing: false
        });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.user.id);
      io.emit('userStatus', {
        userId: socket.user.id,
        status: 'offline'
      });
      logger.info(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

export { io };