const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return !this.isAI;
      },
    },
    isAI: {
      type: Boolean,
      default: false,
    },
    aiModelName: {
      type: String,
      default: 'Google Gemini 1.5 Pro',
    },
    explanationLevel: {
      type: String,
      enum: ['beginner', 'advanced', 'standard'],
      default: 'standard',
    },
    content: {
      type: String,
      required: [true, 'Please add answer content'],
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Answer', AnswerSchema);
