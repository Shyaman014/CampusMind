const express = require('express');
const router = express.Router();
const {
  getChats,
  getChatById,
  createChat,
  deleteChat,
  toggleFavoriteChat,
  archiveChat,
  renameChat,
  duplicateChat,
  searchChats,
  setMessageFeedback,
  streamChatMessage,
} = require('../controllers/chatController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.use(optionalAuth);

router.route('/')
  .get(getChats)
  .post(createChat);

router.route('/search')
  .get(searchChats);

router.route('/stream')
  .post(streamChatMessage);

router.route('/:id')
  .get(getChatById)
  .delete(deleteChat);

router.route('/:id/favorite')
  .patch(toggleFavoriteChat);

router.route('/:id/archive')
  .patch(archiveChat);

router.route('/:id/rename')
  .patch(renameChat);

router.route('/:id/duplicate')
  .post(duplicateChat);

router.route('/:id/messages/:msgId/feedback')
  .post(setMessageFeedback);

module.exports = router;
