/**
 * WebSocket Handler Module
 * Centralizes all Socket.IO event handling with room-based messaging,
 * user presence tracking, and real-time notifications.
 * 
 * @module websocket/socketHandler
 */

// In-memory presence map: userId -> { socketId, userName, connectedAt }
const connectedUsers = new Map();

/**
 * Initialize WebSocket event handlers on the Socket.IO server instance.
 * @param {import('socket.io').Server} io - The Socket.IO server
 */
function initializeWebSocket(io) {
  // Middleware: extract userId from handshake query or auth
  io.use((socket, next) => {
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
    const userName = socket.handshake.auth?.userName || socket.handshake.query?.userName || 'Anonymous';
    if (userId) {
      socket.userId = userId;
      socket.userName = userName;
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id} (user: ${socket.userId || 'anonymous'})`);

    // ── Welcome message ──────────────────────────────────────
    socket.emit('welcome', {
      message: 'Connected to ApiNote real-time server',
      socketId: socket.id,
      timestamp: new Date().toISOString(),
    });

    // ── User presence tracking ───────────────────────────────
    if (socket.userId) {
      connectedUsers.set(socket.userId, {
        socketId: socket.id,
        userName: socket.userName,
        connectedAt: new Date().toISOString(),
      });

      // Broadcast updated user list
      io.emit('presence:update', {
        online: Array.from(connectedUsers.entries()).map(([id, info]) => ({
          userId: id,
          userName: info.userName,
          connectedAt: info.connectedAt,
        })),
        count: connectedUsers.size,
      });
    }

    // ── Room management (per-apiary rooms) ───────────────────
    socket.on('room:join', (data) => {
      const room = `apiary:${data.apiaryId}`;
      socket.join(room);
      console.log(`📍 ${socket.id} joined room ${room}`);
      socket.emit('room:joined', { room, apiaryId: data.apiaryId });

      // Notify others in the room
      socket.to(room).emit('room:userJoined', {
        userId: socket.userId,
        userName: socket.userName,
        room,
      });
    });

    socket.on('room:leave', (data) => {
      const room = `apiary:${data.apiaryId}`;
      socket.leave(room);
      console.log(`📍 ${socket.id} left room ${room}`);

      socket.to(room).emit('room:userLeft', {
        userId: socket.userId,
        userName: socket.userName,
        room,
      });
    });

    // ── Real-time chat within apiary rooms ────────────────────
    socket.on('chat:message', (data) => {
      const room = `apiary:${data.apiaryId}`;
      const payload = {
        userId: socket.userId,
        userName: socket.userName,
        message: data.message,
        apiaryId: data.apiaryId,
        timestamp: new Date().toISOString(),
      };
      io.to(room).emit('chat:message', payload);
    });

    // ── Hive status live updates ──────────────────────────────
    socket.on('hive:statusUpdate', (data) => {
      const room = `apiary:${data.apiaryId}`;
      io.to(room).emit('hive:statusChanged', {
        hiveId: data.hiveId,
        status: data.status,
        updatedBy: socket.userName,
        timestamp: new Date().toISOString(),
      });
    });

    // ── Typing indicators ─────────────────────────────────────
    socket.on('typing:start', (data) => {
      const room = `apiary:${data.apiaryId}`;
      socket.to(room).emit('typing:indicator', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping: true,
      });
    });

    socket.on('typing:stop', (data) => {
      const room = `apiary:${data.apiaryId}`;
      socket.to(room).emit('typing:indicator', {
        userId: socket.userId,
        userName: socket.userName,
        isTyping: false,
      });
    });

    // ── Ping/Pong for latency measurement ─────────────────────
    socket.on('ping:check', () => {
      socket.emit('pong:response', { timestamp: Date.now() });
    });

    // ── Disconnect handling ───────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} (reason: ${reason})`);

      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        io.emit('presence:update', {
          online: Array.from(connectedUsers.entries()).map(([id, info]) => ({
            userId: id,
            userName: info.userName,
            connectedAt: info.connectedAt,
          })),
          count: connectedUsers.size,
        });
      }
    });

    // ── Error handling ────────────────────────────────────────
    socket.on('error', (err) => {
      console.error(`❌ Socket error for ${socket.id}:`, err.message);
    });
  });

  return io;
}

/**
 * Emit a notification to all connected clients or a specific room.
 * Used by route handlers to broadcast data changes.
 * @param {import('socket.io').Server} io
 * @param {string} event - Event name (e.g. 'apiary:created')
 * @param {object} data - Payload
 * @param {string} [room] - Optional room to target
 */
function emitNotification(io, event, data, room) {
  const payload = { ...data, timestamp: new Date().toISOString() };
  if (room) {
    io.to(room).emit(event, payload);
  } else {
    io.emit(event, payload);
  }
}

/**
 * Get current online users count
 * @returns {number}
 */
function getOnlineCount() {
  return connectedUsers.size;
}

/**
 * Get all connected users info
 * @returns {Array}
 */
function getConnectedUsers() {
  return Array.from(connectedUsers.entries()).map(([id, info]) => ({
    userId: id,
    ...info,
  }));
}

module.exports = {
  initializeWebSocket,
  emitNotification,
  getOnlineCount,
  getConnectedUsers,
};
