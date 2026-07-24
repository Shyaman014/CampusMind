const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Upload = require('../models/Upload');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Get Admin System Overview & Analytics
// @route   GET /api/admin/stats
// @access  Private (Admin Only)
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments();
    const totalAnswers = await Answer.countDocuments();
    const totalUploads = await Upload.countDocuments();
    const resolvedQuestions = await Question.countDocuments({ isResolved: true });

    const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(10);
    const recentQuestions = await Question.find()
      .populate('author', 'name email role')
      .sort({ createdAt: -1 })
      .limit(10);

    return successResponse(res, 200, 'Admin platform statistics fetched', {
      counts: {
        totalUsers,
        totalQuestions,
        totalAnswers,
        totalUploads,
        resolvedQuestions,
        unresolvedQuestions: totalQuestions - resolvedQuestions,
      },
      recentUsers,
      recentQuestions,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Error loading admin stats', error);
  }
};

// @desc    Get All Users with search and pagination
// @route   GET /api/admin/users
// @access  Private (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return successResponse(res, 200, 'Users list fetched', users);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch users', error);
  }
};

// @desc    Update User Role (student, senior, admin)
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin Only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['student', 'senior', 'admin'].includes(role)) {
      return errorResponse(res, 400, 'Invalid role specified');
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    return successResponse(res, 200, `User role updated to ${role}`, user);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to update user role', error);
  }
};

// @desc    Delete Spam Question
// @route   DELETE /api/admin/questions/:id
// @access  Private (Admin Only)
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return errorResponse(res, 404, 'Question not found');
    }
    // Delete associated answers
    await Answer.deleteMany({ question: req.params.id });

    return successResponse(res, 200, 'Question and associated answers deleted (spam clean)');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to delete question', error);
  }
};

// @desc    Delete User Account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }
    return successResponse(res, 200, 'User account deleted successfully');
  } catch (error) {
    return errorResponse(res, 500, 'Failed to delete user', error);
  }
};
