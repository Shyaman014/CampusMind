const Chat = require('../models/Chat');
const { streamAIResponse } = require('../services/geminiService');
const { extractTextFromAttachment } = require('../utils/fileExtractor');

/**
 * Get all chat sessions for user
 */
const getChats = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';
    const chats = await Chat.find({ user: userId })
      .select('title createdAt updatedAt')
      .sort({ updatedAt: -1 });
    res.json({ success: true, data: chats });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single chat history
 */
const getChatById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';
    const chat = await Chat.findOne({ _id: req.params.id, user: userId });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat session not found' });
    }
    res.json({ success: true, data: chat });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new chat session
 */
const createChat = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';
    const chat = await Chat.create({
      user: userId,
      title: req.body.title || 'New Academic Chat',
      messages: [],
    });
    res.status(201).json({ success: true, data: chat });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a chat session
 */
const deleteChat = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';
    await Chat.findOneAndDelete({ _id: req.params.id, user: userId });
    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * Real-time SSE Stream AI Message Response with Guaranteed Session Storage & Multi-Turn Context Memory
 */
const streamChatMessage = async (req, res, next) => {
  try {
    const { chatId, message, attachments } = req.body;

    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';

    let extractedText = '';
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        try {
          const text = await extractTextFromAttachment(att);
          extractedText += `\n--- Document: ${att.fileName} ---\n${text}\n--- End Document ---\n`;
        } catch (error) {
          // Send explicit JSON error if extraction fails
          return res.status(400).json({ success: false, message: error.message });
        }
      }
    }

    let chat;

    // 1. Ensure Chat session exists BEFORE flushing stream headers
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: userId });
    }

    if (!chat) {
      const cleanTitle = message ? message.trim().slice(0, 30) + (message.trim().length > 30 ? '...' : '') : 'New Academic Chat';
      chat = await Chat.create({
        user: userId,
        title: cleanTitle,
        messages: [],
      });
    }

    // Save previous conversation history for LLM context memory (up to last 10 messages)
    const conversationHistory = chat.messages.slice(-10).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Save current user message to database
    chat.messages.push({
      role: 'user',
      content: message,
      attachments: attachments || [],
    });
    await chat.save();

    // 2. Set SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    if (res.flushHeaders) {
      res.flushHeaders();
    }

    // Send start payload with valid chatId
    res.write(`data: ${JSON.stringify({ type: 'start', chatId: chat._id })}\n\n`);

    let fullAIResponse = '';

    let promptText = message;
    if (extractedText) {
      promptText = `User Question:\n"${message}"\n\nAttached Document:\n${extractedText}\n\nInstructions:\nAnswer only using the attached document when possible.`;
    }

    // 3. Stream AI Response chunks with conversation context memory
    await streamAIResponse(
      promptText,
      (chunk) => {
        fullAIResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
        if (res.flush) res.flush();
      },
      conversationHistory
    );

    // 4. Save AI response message to database
    chat.messages.push({
      role: 'assistant',
      content: fullAIResponse,
    });
    await chat.save();

    res.write(`data: ${JSON.stringify({ type: 'end', chatId: chat._id })}\n\n`);
    res.end();
  } catch (err) {
    console.error('Streaming chat message error:', err);
    if (!res.headersSent) {
      next(err);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: err.message })}\n\n`);
      res.end();
    }
  }
};

module.exports = {
  getChats,
  getChatById,
  createChat,
  deleteChat,
  streamChatMessage,
};
