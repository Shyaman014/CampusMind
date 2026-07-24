const express = require('express');
const router = express.Router();
const { uploadMaterial, getUserUploads, getUploadById } = require('../controllers/learningController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('file'), uploadMaterial);
router.get('/uploads', protect, getUserUploads);
router.get('/uploads/:id', protect, getUploadById);

module.exports = router;
