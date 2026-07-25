const { generateAIAnswer, generateRelatedQuestions } = require('../services/geminiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Generate instant AI explanation for a given question
// @route   POST /api/ai/explain
// @access  Private
exports.explainQuestion = async (req, res) => {
  try {
    const { title, content, explanationLevel } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return errorResponse(res, 400, 'A valid question title is required');
    }

    const explanation = await generateAIAnswer(title.trim(), content || '', explanationLevel || 'standard');
    const relatedQuestions = await generateRelatedQuestions(title.trim(), content || '');

    return successResponse(res, 200, 'AI explanation generated successfully', {
      explanation,
      explanationLevel: explanationLevel || 'standard',
      relatedQuestions,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, statusCode, error.message || 'AI explanation failed', error);
  }
};

// @desc    Get related follow-up study questions
// @route   POST /api/ai/related
// @access  Private
exports.getRelatedQuestions = async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return errorResponse(res, 400, 'A valid question title is required');
    }
    const questions = await generateRelatedQuestions(title.trim(), content);
    return successResponse(res, 200, 'Related questions generated', questions);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return errorResponse(res, statusCode, error.message || 'Failed to generate related questions', error);
  }
};
