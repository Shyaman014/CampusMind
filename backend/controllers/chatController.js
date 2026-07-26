const Chat = require('../models/Chat');
const { streamAIResponse, formatCodingAssistantPrompt } = require('../services/geminiService');
const { extractTextFromAttachment, detectFileType } = require('../utils/fileExtractor');
const { formatConversationHistory, buildChatPrompt } = require('../utils/promptBuilder');

/**
 * Get all chat sessions for user
 */
const getChats = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';
    const chats = await Chat.find({ user: userId })
      .select('title isFavorite isArchived mode createdAt updatedAt')
      .sort({ isFavorite: -1, updatedAt: -1 });
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
      mode: req.body.mode || 'general',
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
 * Toggle Favorite status
 */
const toggleFavoriteChat = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';
    const chat = await Chat.findOne({ _id: req.params.id, user: userId });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    chat.isFavorite = !chat.isFavorite;
    await chat.save();
    res.json({ success: true, data: chat });
  } catch (err) {
    next(err);
  }
};

/**
 * Toggle Archive status
 */
const archiveChat = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';
    const chat = await Chat.findOne({ _id: req.params.id, user: userId });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    chat.isArchived = !chat.isArchived;
    await chat.save();
    res.json({ success: true, data: chat });
  } catch (err) {
    next(err);
  }
};

/**
 * Rename Chat
 */
const renameChat = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';
    const { title } = req.body;
    const chat = await Chat.findOneAndUpdate({ _id: req.params.id, user: userId }, { title }, { new: true });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    res.json({ success: true, data: chat });
  } catch (err) {
    next(err);
  }
};

/**
 * Duplicate Chat
 */
const duplicateChat = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';
    const chat = await Chat.findOne({ _id: req.params.id, user: userId });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    const newChat = await Chat.create({
      user: userId,
      title: `Copy of ${chat.title}`,
      mode: chat.mode,
      isFavorite: false,
      messages: chat.messages,
    });
    res.status(201).json({ success: true, data: newChat });
  } catch (err) {
    next(err);
  }
};

/**
 * Search Chats
 */
const searchChats = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });
    const regex = new RegExp(q, 'i');
    const chats = await Chat.find({
      user: userId,
      $or: [
        { title: regex },
        { 'messages.content': regex }
      ]
    }).sort({ updatedAt: -1 }).limit(20);
    res.json({ success: true, data: chats });
  } catch (err) {
    next(err);
  }
};

/**
 * Set Message Feedback (Like/Dislike)
 */
const setMessageFeedback = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';
    const { feedback } = req.body; // 'like' or 'dislike' or null
    const chat = await Chat.findOne({ _id: req.params.id, user: userId });
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    const msg = chat.messages.id(req.params.msgId);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found' });
    msg.feedback = feedback;
    await chat.save();
    res.json({ success: true, data: msg });
  } catch (err) {
    next(err);
  }
};

/**
 * Real-time SSE Stream AI Message Response with Guaranteed Session Storage & Multi-Turn Context Memory
 */
const streamChatMessage = async (req, res, next) => {
  try {
    const { chatId, message, attachments, sliceIndex, mode } = req.body;
    const userId = req.user._id || req.user.id || '65f1a2b3c4d5e6f7a8b9c0d1';

    const enrichedAttachments = [];
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        try {
          const fileType = detectFileType(att.fileName, att.fileType);
          let extracted = att.extractedText || att.visionText;
          let markdownText = '';
          let jsonText = '';
          let docClass = att.documentType || 'document';

          if (!extracted || typeof extracted !== 'string' || extracted.trim().length < 5 || extracted.startsWith('[') || extracted.startsWith('Document "')) {
            const extractResult = await extractTextFromAttachment({ ...att, fileType, userPrompt: message });
            if (typeof extractResult === 'object' && extractResult !== null) {
              markdownText = extractResult.markdown || extractResult.text || '';
              jsonText = extractResult.json || JSON.stringify(extractResult, null, 2);
              docClass = extractResult.documentType || fileType;
            } else {
              markdownText = typeof extractResult === 'string' ? extractResult : String(extractResult || '');
              jsonText = markdownText;
              docClass = fileType;
            }
          } else {
            markdownText = att.extractedText || att.visionText || '';
            jsonText = att.parsedContent || att.visionText || markdownText;
            docClass = att.documentType || fileType;
          }

          if (!markdownText || markdownText.trim() === '') {
            throw new Error(`No readable text could be extracted from "${att.fileName}".`);
          }
          console.log(`[chatController] Attachment Processed: "${att.fileName}" | Type: "${fileType}" | Class: "${docClass}" | Extracted Length: ${markdownText.trim().length}`);
          const isImg = fileType === 'image';
          enrichedAttachments.push({
            ...att,
            fileType,
            documentType: docClass,
            extractedText: markdownText.trim(),
            visionText: isImg ? markdownText.trim() : (att.visionText || ''),
            parsedContent: isImg ? jsonText.trim() : (att.parsedContent || ''),
          });
        } catch (error) {
          console.error(`[Backend Chat Streaming Error - Extraction]:`, error.message);
          return res.status(400).json({ success: false, message: error.message || 'File extraction failed.' });
        }
      }
    }

    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, user: userId });
    }

    if (!chat) {
      const cleanTitle = message ? message.trim().slice(0, 30) + (message.trim().length > 30 ? '...' : '') : 'New Academic Chat';
      chat = await Chat.create({
        user: userId,
        title: cleanTitle,
        mode: mode || 'general',
        messages: [],
      });
    }

    // If sliceIndex is provided (for Edit Prompt or Regenerate Response), slice the history
    if (typeof sliceIndex === 'number' && sliceIndex >= 0 && sliceIndex < chat.messages.length) {
      chat.messages = chat.messages.slice(0, sliceIndex);
    }

    // Format conversation history including previous OCR text and PDF extracted text
    const conversationHistory = formatConversationHistory(chat.messages);

    // Build anti-hallucination prompt preserving uploaded file context across multi-turn conversations
    const { promptText, logs } = buildChatPrompt(
      message,
      enrichedAttachments,
      chat.messages,
      chat.mode || mode,
      formatCodingAssistantPrompt
    );

    console.log(`[chatController] Prompt Built | Type: "${logs.promptType}" | Current Attachments: ${logs.currentAttachmentsCount} | Past Attachment Context Included: ${logs.hasPreviousAttachmentContext ? 'YES (' + logs.previousAttachmentsCount + ')' : 'NO'}`);
    console.log(`[chatController] Prompt Sent to Groq (Char Count: ${promptText.length}):\n---\n${promptText.slice(0, 500)}${promptText.length > 500 ? '...' : ''}\n---`);

    chat.messages.push({
      role: 'user',
      content: message,
      attachments: enrichedAttachments,
    });
    await chat.save();

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    if (res.flushHeaders) {
      res.flushHeaders();
    }

    res.write(`data: ${JSON.stringify({ type: 'start', chatId: chat._id })}\n\n`);

    let fullAIResponse = '';

    await streamAIResponse(
      promptText,
      (chunk) => {
        fullAIResponse += chunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
        if (res.flush) res.flush();
      },
      conversationHistory
    );

    chat.messages.push({
      role: 'assistant',
      content: fullAIResponse,
      versions: [{ content: fullAIResponse, createdAt: new Date() }],
    });
    await chat.save();

    res.write(`data: ${JSON.stringify({ type: 'end', chatId: chat._id, messages: chat.messages })}\n\n`);
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
  toggleFavoriteChat,
  archiveChat,
  renameChat,
  duplicateChat,
  searchChats,
  setMessageFeedback,
  streamChatMessage,
};
