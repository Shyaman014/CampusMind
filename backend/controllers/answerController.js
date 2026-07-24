const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Comment = require('../models/Comment');
const Vote = require('../models/Vote');
const { addReputation } = require('../services/reputationService');
const { createNotification } = require('../services/notificationService');
const { getIO } = require('../services/socketService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Add human answer to a question
// @route   POST /api/questions/:questionId/answers
// @access  Private
exports.addAnswer = async (req, res) => {
  try {
    const { content, explanationLevel } = req.body;
    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return errorResponse(res, 404, 'Question not found');
    }

    const answer = await Answer.create({
      question: questionId,
      author: req.user._id,
      content,
      explanationLevel: explanationLevel || 'standard',
      isAI: false,
    });

    const populatedAnswer = await Answer.findById(answer._id).populate(
      'author',
      'name avatar role department reputation badges'
    );

    // Award +10 reputation for providing an answer
    await addReputation(req.user._id, 10, 'Provided an answer to doubt', answer._id);

    // Notify question author if different from answer author
    if (question.author.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: question.author,
        sender: req.user._id,
        type: 'new_answer',
        title: 'New Answer Received! 💡',
        message: `${req.user.name} answered your question: "${question.title.slice(0, 40)}..."`,
        link: `/questions/${questionId}`,
      });
    }

    // Emit live answer via socket to users viewing question
    const io = getIO();
    if (io) {
      io.to(`question_${questionId}`).emit('new_answer_posted', populatedAnswer);
    }

    return successResponse(res, 201, 'Answer posted successfully', populatedAnswer);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to post answer', error);
  }
};

// @desc    Accept an answer
// @route   PUT /api/answers/:id/accept
// @access  Private
exports.acceptAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return errorResponse(res, 404, 'Answer not found');
    }

    const question = await Question.findById(answer.question);
    if (!question) {
      return errorResponse(res, 404, 'Associated question not found');
    }

    // Only question author or admin can accept answer
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only the author of the question can accept an answer');
    }

    // Reset previous accepted answer if any
    if (question.acceptedAnswer) {
      await Answer.findByIdAndUpdate(question.acceptedAnswer, { isAccepted: false });
    }

    answer.isAccepted = true;
    await answer.save();

    question.isResolved = true;
    question.acceptedAnswer = answer._id;
    await question.save();

    // Award +25 reputation to answer author if human
    if (!answer.isAI && answer.author) {
      await addReputation(answer.author, 25, 'Answer accepted by question author', answer._id);

      await createNotification({
        recipient: answer.author,
        sender: req.user._id,
        type: 'accepted_answer',
        title: 'Answer Accepted! 🌟',
        message: `Your answer was marked as the accepted solution! (+25 Reputation)`,
        link: `/questions/${question._id}`,
      });
    }

    return successResponse(res, 200, 'Answer accepted successfully', answer);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to accept answer', error);
  }
};

// @desc    Vote answer (Upvote/Downvote)
// @route   POST /api/answers/:id/vote
// @access  Private
exports.voteAnswer = async (req, res) => {
  try {
    const { voteType } = req.body;
    const answerId = req.params.id;
    const userId = req.user._id;

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return errorResponse(res, 404, 'Answer not found');
    }

    const existingVote = await Vote.findOne({
      user: userId,
      targetId: answerId,
      targetType: 'Answer',
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.findByIdAndDelete(existingVote._id);
        if (voteType === 1) answer.upvotes = Math.max(0, answer.upvotes - 1);
        else answer.downvotes = Math.max(0, answer.downvotes - 1);
      } else {
        existingVote.voteType = voteType;
        await existingVote.save();
        if (voteType === 1) {
          answer.upvotes += 1;
          answer.downvotes = Math.max(0, answer.downvotes - 1);
        } else {
          answer.downvotes += 1;
          answer.upvotes = Math.max(0, answer.upvotes - 1);
        }
      }
    } else {
      await Vote.create({
        user: userId,
        targetId: answerId,
        targetType: 'Answer',
        voteType,
      });

      if (voteType === 1) {
        answer.upvotes += 1;
        if (!answer.isAI && answer.author) {
          await addReputation(answer.author, 5, 'Answer upvoted', answer._id);
        }
      } else {
        answer.downvotes += 1;
      }
    }

    await answer.save();

    return successResponse(res, 200, 'Vote recorded', {
      upvotes: answer.upvotes,
      downvotes: answer.downvotes,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to vote on answer', error);
  }
};

// @desc    Add comment to answer
// @route   POST /api/answers/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const answerId = req.params.id;

    const answer = await Answer.findById(answerId);
    if (!answer) {
      return errorResponse(res, 404, 'Answer not found');
    }

    const comment = await Comment.create({
      answer: answerId,
      author: req.user._id,
      content,
    });

    answer.commentsCount += 1;
    await answer.save();

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name avatar role'
    );

    return successResponse(res, 201, 'Comment added successfully', populatedComment);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to add comment', error);
  }
};

// @desc    Get comments for an answer
// @route   GET /api/answers/:id/comments
// @access  Public
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ answer: req.params.id })
      .populate('author', 'name avatar role')
      .sort({ createdAt: 1 });

    return successResponse(res, 200, 'Comments fetched', comments);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch comments', error);
  }
};
