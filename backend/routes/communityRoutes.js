const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserProfile } = require('../controllers/communityController');

router.get('/leaderboard', getLeaderboard);
router.get('/profile/:id', getUserProfile);

module.exports = router;
