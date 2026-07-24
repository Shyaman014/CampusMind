const Upload = require('../models/Upload');
const { analyzeUploadedMaterial } = require('../services/geminiService');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Upload file & auto-generate learning materials (Summary, Flashcards, Quiz)
// @route   POST /api/learning/upload
// @access  Private
exports.uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, 'Please upload a PDF or Image file');
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const isPdf = req.file.mimetype === 'application/pdf';
    const fileType = isPdf ? 'pdf' : 'image';

    // Invoke Gemini AI to extract key insights, flashcards, quiz, summary
    const aiAnalysis = await analyzeUploadedMaterial(req.file.originalname);

    const upload = await Upload.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileUrl,
      fileType,
      summary: aiAnalysis.summary,
      importantPoints: aiAnalysis.importantPoints,
      flashcards: aiAnalysis.flashcards,
      quiz: aiAnalysis.quiz,
    });

    return successResponse(res, 201, 'File uploaded and AI analysis complete', upload);
  } catch (error) {
    return errorResponse(res, 500, 'Failed to process document', error);
  }
};

// @desc    Get user uploads
// @route   GET /api/learning/uploads
// @access  Private
exports.getUserUploads = async (req, res) => {
  try {
    const uploads = await Upload.find({ user: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, 200, 'Uploads fetched successfully', uploads);
  } catch (error) {
    return errorResponse(res, 500, 'Error fetching uploads', error);
  }
};

// @desc    Get single upload material by ID
// @route   GET /api/learning/uploads/:id
// @access  Private
exports.getUploadById = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return errorResponse(res, 404, 'Upload item not found');
    }
    return successResponse(res, 200, 'Upload details fetched', upload);
  } catch (error) {
    return errorResponse(res, 500, 'Error fetching upload details', error);
  }
};
