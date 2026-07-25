const path = require('path');
const Upload = require('../models/Upload');
const { analyzeUploadedMaterial } = require('../services/geminiService');
const { extractTextFromAttachment } = require('../utils/fileExtractor');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// @desc    Upload file & auto-generate learning materials (Summary, Flashcards, Quiz, Notes)
// @route   POST /api/learning/upload
// @access  Private
exports.uploadMaterial = async (req, res) => {
  try {
    if (!req.file) {
      const contentType = req.headers['content-type'] || 'undefined';
      const reason = !contentType.includes('boundary=') && contentType.includes('multipart')
        ? `Malformed multipart/form-data header: missing boundary parameter in Content-Type "${contentType}". Do not manually set Content-Type header on client.`
        : 'File upload missing: No file attached to FormData under field name "file" or file rejected by filter.';
      console.error(`[Upload Error 400] ${reason}`);
      return errorResponse(res, 400, reason);
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const ext = path.extname(req.file.originalname || '').toLowerCase();
    
    let fileType = 'doc';
    if (ext === '.pdf' || req.file.mimetype === 'application/pdf') fileType = 'pdf';
    else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext) || req.file.mimetype?.startsWith('image/')) fileType = 'image';
    else if (['.ppt', '.pptx'].includes(ext)) fileType = 'ppt';
    else if (['.md', '.txt'].includes(ext)) fileType = 'txt';
    else if (['.doc', '.docx'].includes(ext)) fileType = 'docx';

    let extractedText = '';
    try {
      extractedText = await extractTextFromAttachment({ fileName: req.file.originalname, fileUrl });
    } catch (err) {
      console.error('[Backend Upload Error - Text Extraction]:', err.message, err.stack);
      return errorResponse(res, 400, err.message || 'PDF extraction failed.');
    }

    // Invoke Gemini AI to extract key insights, flashcards, quiz, summary, and 4-tier notes
    const aiAnalysis = await analyzeUploadedMaterial(req.file.originalname, extractedText);

    const upload = await Upload.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileUrl,
      fileType,
      summary: aiAnalysis.summary,
      importantPoints: aiAnalysis.importantPoints,
      flashcards: aiAnalysis.flashcards,
      quiz: aiAnalysis.quiz,
      notes: aiAnalysis.notes,
    });

    const responseData = upload.toObject ? upload.toObject() : { ...upload._doc };
    responseData.extractedText = extractedText;

    return successResponse(res, 201, 'File uploaded and AI analysis complete', responseData);
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
