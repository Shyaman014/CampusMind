let io;

const initSocket = (server) => {
  const socketIo = require('socket.io');
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join user room for targeted notifications
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`[Socket.io] User ${userId} joined personal room`);
    });

    // Join question room for live answer updates
    socket.on('join_question_room', (questionId) => {
      socket.join(`question_${questionId}`);
      console.log(`[Socket.io] Socket ${socket.id} joined question_${questionId}`);
    });

    socket.on('leave_question_room', (questionId) => {
      socket.leave(`question_${questionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('[Socket.io] Socket.io not initialized yet');
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
