const express = require('express');
const router = express.Router();
const {
  acceptAnswer,
  voteAnswer,
  addComment,
  getComments,
} = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware');

router.put('/:id/accept', protect, acceptAnswer);
router.post('/:id/vote', protect, voteAnswer);
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', getComments);

module.exports = router;
