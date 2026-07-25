const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
  front: { type: String, required: true },
  back: { type: String, required: true },
});

const QuizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
});

const UploadSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'image', 'doc', 'docx', 'txt', 'md', 'ppt', 'pptx'],
      required: true,
    },
    summary: {
      type: String,
      default: '',
    },
    importantPoints: [
      {
        type: String,
      },
    ],
    flashcards: [FlashcardSchema],
    quiz: [QuizQuestionSchema],
    notes: {
      detailed: { type: String, default: '' },
      short: { type: String, default: '' },
      exam: { type: String, default: '' },
      revision: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Upload', UploadSchema);
