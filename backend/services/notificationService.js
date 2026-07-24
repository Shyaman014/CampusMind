const Notification = require('../models/Notification');
const { getIO } = require('./socketService');

const createNotification = async ({ recipient, sender, type, title, message, link }) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
    });

    // Real-time socket push
    const io = getIO();
    if (io) {
      io.to(`user_${recipient}`).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('[Notification Error]', error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};
