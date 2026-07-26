/**
 * Utility module for building structured prompts and managing conversation memory for AI analysis.
 * Integrates Gemini Vision analysis and document extraction with Groq reasoning.
 */

/**
 * Helper to determine if a filename or fileType represents an image
 * @param {string} fileType 
 * @param {string} fileName 
 * @returns {boolean}
 */
const isImageAttachment = (fileType = '', fileName = '') => {
  if (fileType && fileType.toLowerCase() === 'image') return true;
  if (fileName && /\.(jpg|jpeg|png|webp|gif|bmp|tiff)$/i.test(fileName)) return true;
  return false;
};

/**
 * Formats conversation history messages, enriching them with stored Gemini Vision or document text.
 * Prevents context loss across multi-turn conversations.
 * @param {Array} messages - Array of message objects from MongoDB
 * @returns {Array} Formatted messages array { role, content } for LLM
 */
const formatConversationHistory = (messages = []) => {
  return messages.slice(-10).map((m) => {
    let contentStr = m.content || '';
    if (m.attachments && m.attachments.length > 0) {
      const attSummary = m.attachments
        .filter(a => a && (a.fileName || a.extractedText || a.visionText))
        .map(a => {
          const isImg = isImageAttachment(a.fileType, a.fileName);
          const typeLabel = isImg ? 'Image (Gemini Vision Analysis)' : `Document (${(a.fileType || 'file').toUpperCase()})`;
          const content = a.extractedText || a.visionText || 'No readable text available.';
          return `[Attached ${typeLabel}: "${a.fileName || 'unknown'}"]\nContent:\n${content}`;
        })
        .join('\n\n');
      if (attSummary) {
        contentStr = contentStr ? `${contentStr}\n\n${attSummary}` : attSummary;
      }
    }
    return {
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(contentStr).trim(),
    };
  });
};

/**
 * Builds the LLM prompt for chat messages, incorporating current or previous Gemini Vision / document context.
 * Enforces ChatGPT-like image reasoning using Gemini Vision output.
 * @param {string} message - User query
 * @param {Array} currentAttachments - Attachments uploaded in the current request
 * @param {Array} chatHistory - Previous messages in the chat session
 * @param {string} mode - Chat mode (e.g. general, coding)
 * @param {Function} formatCodingPrompt - Callback to format coding mode prompts if applicable
 * @returns {Object} { promptText, logs }
 */
const buildChatPrompt = (message = '', currentAttachments = [], chatHistory = [], mode = 'general', formatCodingPrompt = null) => {
  let promptText = '';
  const logs = {
    hasCurrentAttachments: currentAttachments.length > 0,
    currentAttachmentsCount: currentAttachments.length,
    hasPreviousAttachmentContext: false,
    previousAttachmentsCount: 0,
    promptType: 'standard'
  };

  // Case 1: User uploaded attachments in the CURRENT turn
  if (currentAttachments && currentAttachments.length > 0) {
    const hasImage = currentAttachments.some(att => isImageAttachment(att.fileType, att.fileName));
    const attachmentsContent = currentAttachments
      .map(att => {
        const content = att.extractedText || att.visionText || 'No readable content found.';
        return `--- Attachment (${att.fileType || 'file'}): ${att.fileName} ---\n${content}\n--- End Attachment ---`;
      })
      .join('\n\n');

    if (hasImage) {
      logs.promptType = 'current_image_vision';
      const userQ = message && message.trim() ? message.trim() : 'Please analyze and explain this image.';
      promptText = `User uploaded an image.\n\nGemini Vision Analysis:\n${attachmentsContent}\n\nUser Question:\n${userQ}\n\nInstructions:\nUse the above Gemini Vision Analysis to answer the user's question in detail. Continue reasoning clearly and accurately as an expert AI tutor.`;
    } else {
      logs.promptType = 'current_document_text';
      const userQ = message && message.trim() ? `User Question:\n"${message.trim()}"\n\n` : '';
      promptText = `${userQ}The following text was extracted from an uploaded document (${currentAttachments.map(a => a.fileType || 'file').join(', ')}).\n\nDocument Content:\n${attachmentsContent}\n\nOnly answer using this extracted text. Do not invent or assume contents not present in the extracted text.`;
    }
  }
  // Case 2: No attachment in current turn, check PREVIOUS turns for follow-up context (e.g. "Explain line 3", "What is this?")
  else if (chatHistory && chatHistory.length > 0) {
    const pastAttachmentsList = [];
    for (const m of chatHistory) {
      if (m.attachments && m.attachments.length > 0) {
        for (const att of m.attachments) {
          const textContent = att.extractedText || att.visionText || '';
          if (textContent && typeof textContent === 'string' && textContent.trim() !== '' && !textContent.startsWith('[')) {
            const isImg = isImageAttachment(att.fileType, att.fileName);
            pastAttachmentsList.push({
              isImage: isImg,
              text: `[Previously Attached ${isImg ? 'Image (Gemini Vision Analysis)' : 'Document (' + (att.fileType || 'file').toUpperCase() + ' Content)'} in message "${m.content ? m.content.slice(0, 30) : 'upload'}": "${att.fileName}"]\nContent:\n${textContent.trim()}`
            });
          }
        }
      }
    }

    if (pastAttachmentsList.length > 0) {
      logs.hasPreviousAttachmentContext = true;
      logs.previousAttachmentsCount = pastAttachmentsList.length;
      const hasPrevImage = pastAttachmentsList.some(item => item.isImage);
      const pastContextStr = pastAttachmentsList.map(item => item.text).join('\n\n--- Next Previous Attachment ---\n\n');

      if (hasPrevImage) {
        logs.promptType = 'followup_image_vision';
        const userQ = message && message.trim() ? message.trim() : 'Please continue analyzing the image.';
        promptText = `User uploaded an image previously.\n\nActive Conversation Context (Previously Uploaded Image / Document Analysis):\n${pastContextStr}\n\nUser Follow-up Question:\n${userQ}\n\nInstructions:\nAnswer the user's follow-up question using the stored Gemini Vision description / document extraction above without asking them to re-upload the image or document. Continue reasoning clearly and accurately.`;
      } else {
        logs.promptType = 'followup_document_text';
        const userQ = message && message.trim() ? `User Follow-up Question:\n"${message.trim()}"\n\n` : '';
        promptText = `${userQ}Active Conversation Context (Previously Extracted Text from Uploaded Documents):\n${pastContextStr}\n\nInstructions:\nAnswer the user's follow-up question using the active conversation context and previously extracted document content above. Do not invent contents not present in the extracted text, and do not ask the user to re-upload the file.`;
      }
    }
  }

  // Case 3: Standard text message without any file context
  if (!promptText || promptText.trim() === '') {
    promptText = message && message.trim() ? message.trim() : 'Please review and assist me.';
  }

  // Format for coding mode if requested
  if (mode === 'coding' && typeof formatCodingPrompt === 'function') {
    promptText = formatCodingPrompt('explain', '', '', promptText);
  }

  return { promptText, logs };
};

module.exports = {
  isImageAttachment,
  formatConversationHistory,
  buildChatPrompt,
};
