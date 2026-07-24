const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Vote = require('../models/Vote');
const Tag = require('../models/Tag');
const { generateAIAnswer } = require('../services/geminiService');
const { addReputation } = require('../services/reputationService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Ask a new question
// @route   POST /api/questions
// @access  Private
exports.askQuestion = async (req, res) => {
  try {
    const { title, content, isAnonymous, subject, tags, attachments } = req.body;

    const question = await Question.create({
      title,
      content,
      author: req.user._id,
      isAnonymous: isAnonymous || false,
      subject: subject || 'General Computer Science',
      tags: tags || ['General'],
      attachments: attachments || [],
    });

    // Award +5 reputation for asking
    await addReputation(req.user._id, 5, 'Asked a doubt/question', question._id);

    // Update or create tags
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        await Tag.findOneAndUpdate(
          { name: tagName.toLowerCase() },
          { $inc: { questionCount: 1 } },
          { upsert: true, new: true }
        );
      }
    }

    // Trigger AI Auto Answer in background asynchronously
    generateAIAnswer(title, content, 'standard')
      .then(async (aiText) => {
        const aiAnswer = await Answer.create({
          question: question._id,
          isAI: true,
          aiModelName: 'Google Gemini 1.5 Pro',
          content: aiText,
          explanationLevel: 'standard',
        });
        question.aiAnswered = true;
        await question.save();
      })
      .catch((err) => console.error('[AI Auto-Answer Error]', err));

    return successResponse(res, 201, 'Question posted successfully', question);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to post question', error);
  }
};

// @desc    Get all questions with filters, search, pagination
// @route   GET /api/questions
// @access  Public
exports.getQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    const { search, subject, tag, isResolved, sortBy } = req.query;

    let query = {};

    if (search) {
      query.$text = { $search: search };
    }
    if (subject) {
      query.subject = subject;
    }
    if (tag) {
      query.tags = tag;
    }
    if (isResolved !== undefined) {
      query.isResolved = isResolved === 'true';
    }

    let sort = { createdAt: -1 };
    if (sortBy === 'upvotes') {
      sort = { upvotes: -1 };
    } else if (sortBy === 'views') {
      sort = { views: -1 };
    }

    const total = await Question.countDocuments(query);
    const questions = await Question.find(query)
      .populate('author', 'name avatar role department reputation')
      .populate('acceptedAnswer')
      .sort(sort)
      .skip(startIndex)
      .limit(limit);

    return successResponse(res, 200, 'Questions fetched successfully', {
      count: questions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      questions,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to fetch questions', error);
  }
};

// @desc    Get question by ID
// @route   GET /api/questions/:id
// @access  Public
exports.getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'name avatar role department reputation streakDays badges')
      .populate('acceptedAnswer');

    if (!question) {
      return errorResponse(res, 404, 'Question not found');
    }

    // Increment view count
    question.views += 1;
    await question.save();

    const answers = await Answer.find({ question: req.params.id })
      .populate('author', 'name avatar role department reputation badges')
      .sort({ isAccepted: -1, upvotes: -1, createdAt: -1 });

    return successResponse(res, 200, 'Question details fetched', {
      question,
      answers,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Error fetching question', error);
  }
};

// @desc    Vote question (Upvote / Downvote)
// @route   POST /api/questions/:id/vote
// @access  Private
exports.voteQuestion = async (req, res) => {
  try {
    const { voteType } = req.body; // 1 or -1
    const questionId = req.params.id;
    const userId = req.user._id;

    const question = await Question.findById(questionId);
    if (!question) {
      return errorResponse(res, 404, 'Question not found');
    }

    const existingVote = await Vote.findOne({
      user: userId,
      targetId: questionId,
      targetType: 'Question',
    });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off vote
        await Vote.findByIdAndDelete(existingVote._id);
        if (voteType === 1) question.upvotes = Math.max(0, question.upvotes - 1);
        else question.downvotes = Math.max(0, question.downvotes - 1);
      } else {
        // Change vote
        existingVote.voteType = voteType;
        await existingVote.save();
        if (voteType === 1) {
          question.upvotes += 1;
          question.downvotes = Math.max(0, question.downvotes - 1);
        } else {
          question.downvotes += 1;
          question.upvotes = Math.max(0, question.upvotes - 1);
        }
      }
    } else {
      // Create new vote
      await Vote.create({
        user: userId,
        targetId: questionId,
        targetType: 'Question',
        voteType,
      });

      if (voteType === 1) {
        question.upvotes += 1;
        await addReputation(question.author, 2, 'Question upvoted', question._id);
      } else {
        question.downvotes += 1;
      }
    }

    await question.save();

    return successResponse(res, 200, 'Vote updated successfully', {
      upvotes: question.upvotes,
      downvotes: question.downvotes,
    });
  } catch (error) {
    return errorResponse(res, 500, 'Failed to vote', error);
  }
};
