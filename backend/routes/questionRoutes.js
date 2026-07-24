const express = require('express');
const router = express.Router();
const {
  askQuestion,
  getQuestions,
  getQuestionById,
  voteQuestion,
} = require('../controllers/questionController');
const { addAnswer } = require('../controllers/answerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, askQuestion)
  .get(getQuestions);

router.get('/:id', getQuestionById);
router.post('/:id/vote', protect, voteQuestion);

// Answers nested route
router.post('/:questionId/answers', protect, addAnswer);

module.exports = router;
