const express = require('express');
const router = express.Router();
const { explainQuestion, getRelatedQuestions } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/explain', protect, explainQuestion);
router.post('/related', protect, getRelatedQuestions);

module.exports = router;
