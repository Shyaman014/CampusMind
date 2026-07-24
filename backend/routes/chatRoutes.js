const express = require('express');
const router = express.Router();
const {
  getChats,
  getChatById,
  createChat,
  deleteChat,
  streamChatMessage,
} = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.use(optionalAuth);

router.route('/')
  .get(getChats)
  .post(createChat);

router.route('/stream')
  .post(streamChatMessage);

router.route('/:id')
  .get(getChatById)
  .delete(deleteChat);

module.exports = router;
