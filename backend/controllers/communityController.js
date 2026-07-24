const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Reputation = require('../models/Reputation');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get Community Leaderboard (Ranked by Reputation)
// @route   GET /api/community/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const topUsers = await User.find()
      .select('name avatar role department streakDays reputation badges yearOfStudy')
      .sort({ reputation: -1 })
      .limit(20);

    return successResponse(res, 200, 'Leaderboard fetched', topUsers);
  } catch (error) {
    return errorResponse(res, 500, 'Error fetching leaderboard', error);
  }
};

// @desc    Get Public User Profile with statistics
// @route   GET /api/community/profile/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const questionsCount = await Question.countDocuments({ author: req.params.id });
    const answersCount = await Answer.countDocuments({ author: req.params.id });
    const acceptedAnswersCount = await Answer.countDocuments({ author: req.params.id, isAccepted: true });

    const recentQuestions = await Question.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .limit(5);

    const reputationHistory = await Reputation.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10);

    return successResponse(res, 200, 'User profile fetched', {
      user,
      stats: {
        questionsCount,
        answersCount,
        acceptedAnswersCount,
      },
      recentQuestions,
      reputationHistory,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Error fetching user profile', error);
  }
};
