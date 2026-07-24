const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Reputation = require('../models/Reputation');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get Student Dashboard Overview Analytics
// @route   GET /api/dashboard/student
// @access  Private
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const questionsCount = await Question.countDocuments({ author: userId });
    const answersCount = await Answer.countDocuments({ author: userId });
    const acceptedAnswersCount = await Answer.countDocuments({ author: userId, isAccepted: true });

    const userQuestions = await Question.find({ author: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const userAnswers = await Answer.find({ author: userId })
      .populate('question', 'title subject createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentNotifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const reputationHistory = await Reputation.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    return successResponse(res, 200, 'Student dashboard analytics fetched', {
      user: req.user,
      analytics: {
        questionsCount,
        answersCount,
        acceptedAnswersCount,
        reputation: req.user.reputation,
        streakDays: req.user.streakDays,
      },
      userQuestions,
      userAnswers,
      recentNotifications,
      reputationHistory,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Error loading student dashboard', error);
  }
};
