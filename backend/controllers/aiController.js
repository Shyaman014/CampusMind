const { generateAIAnswer, generateRelatedQuestions } = require('../services/geminiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Generate instant AI explanation for a given question
// @route   POST /api/ai/explain
// @access  Private
exports.explainQuestion = async (req, res) => {
  try {
    const { title, content, explanationLevel } = req.body;

    if (!title) {
      return errorResponse(res, 400, 'Question title is required');
    }

    const explanation = await generateAIAnswer(title, content || '', explanationLevel || 'standard');
    const relatedQuestions = await generateRelatedQuestions(title, content || '');

    return successResponse(res, 200, 'AI explanation generated successfully', {
      explanation,
      explanationLevel: explanationLevel || 'standard',
      relatedQuestions,
    });
  } catch (error) {
    return errorResponse(res, 500, 'AI explanation failed', error);
  }
};

// @desc    Get related follow-up study questions
// @route   POST /api/ai/related
// @access  Private
exports.getRelatedQuestions = async (req, res) => {
  try {
    const { title, content } = req.body;
    const questions = await generateRelatedQuestions(title, content);
    return successResponse(res, 200, 'Related questions generated', questions);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to generate related questions', error);
  }
};
