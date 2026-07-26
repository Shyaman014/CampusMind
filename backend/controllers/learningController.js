const path = require('path');
const Upload = require('../models/Upload');
const { analyzeUploadedMaterial } = require('../services/geminiService');
const { extractTextFromAttachment, detectFileType } = require('../utils/fileExtractor');
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
    const fileType = detectFileType(req.file.originalname, req.file.mimetype);

    let extractedText = '';
    try {
      extractedText = await extractTextFromAttachment({ 
        fileName: req.file.originalname, 
        fileUrl, 
        fileType, 
        mimetype: req.file.mimetype,
        userPrompt: req.body.prompt || req.body.message || ''
      });
    } catch (err) {
      console.error('[Backend Upload Error - Text Extraction]:', err.message);
      return errorResponse(res, 400, err.message || 'File extraction failed.');
    }

    console.log(`[learningController] File Uploaded: "${req.file.originalname}" | Type: "${fileType}" | Extracted Char Count: ${extractedText ? extractedText.length : 0}`);

    // Invoke Gemini AI to extract key insights, flashcards, quiz, summary, and 4-tier notes
    const aiAnalysis = await analyzeUploadedMaterial(req.file.originalname, extractedText);

    const upload = await Upload.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileUrl,
      fileType,
      extractedText: extractedText || '',
      visionText: fileType === 'image' ? (extractedText || '') : '',
      parsedContent: fileType === 'image' ? (extractedText || '') : '',
      summary: aiAnalysis.summary,
      importantPoints: aiAnalysis.importantPoints,
      flashcards: aiAnalysis.flashcards,
      quiz: aiAnalysis.quiz,
      notes: aiAnalysis.notes,
    });

    const responseData = upload.toObject ? upload.toObject() : { ...upload._doc };
    responseData.extractedText = extractedText;
    responseData.visionText = fileType === 'image' ? (extractedText || '') : '';
    responseData.parsedContent = fileType === 'image' ? (extractedText || '') : '';

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
