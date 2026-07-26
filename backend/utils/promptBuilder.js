/**
 * Utility module for building structured prompts and managing conversation memory for AI analysis.
 * Ensures strict adherence to extracted text without hallucinating visual elements.
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
 * Formats conversation history messages, enriching them with stored attachment OCR/PDF text.
 * Prevents context loss across multi-turn conversations.
 * @param {Array} messages - Array of message objects from MongoDB
 * @returns {Array} Formatted messages array { role, content } for LLM
 */
const formatConversationHistory = (messages = []) => {
  return messages.slice(-10).map((m) => {
    let contentStr = m.content || '';
    if (m.attachments && m.attachments.length > 0) {
      const attSummary = m.attachments
        .filter(a => a && (a.fileName || a.extractedText))
        .map(a => {
          const isImg = isImageAttachment(a.fileType, a.fileName);
          const typeLabel = isImg ? 'Image (OCR Text)' : `Document (${(a.fileType || 'file').toUpperCase()})`;
          return `[Attached ${typeLabel}: "${a.fileName || 'unknown'}"]\nExtracted Content:\n${a.extractedText || 'No readable text available.'}`;
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
 * Builds the strict LLM prompt for chat messages, incorporating current or previous attachment context.
 * Enforces anti-hallucination rules for OCR text.
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
      .map(att => `--- Attachment (${att.fileType || 'file'}): ${att.fileName} ---\n${att.extractedText || 'No readable text found.'}\n--- End Attachment ---`)
      .join('\n\n');

    const userQ = message && message.trim() ? `User Question:\n"${message.trim()}"\n\n` : '';

    if (hasImage) {
      logs.promptType = 'current_image_ocr';
      promptText = `${userQ}The following text was extracted from an uploaded image using OCR.\n\nOCR Content:\n${attachmentsContent}\n\nOnly answer using this extracted text.\nIf the OCR text is incomplete, clearly state that some visual information cannot be interpreted from OCR alone.`;
    } else {
      logs.promptType = 'current_document_text';
      promptText = `${userQ}The following text was extracted from an uploaded document (${currentAttachments.map(a => a.fileType || 'file').join(', ')}).\n\nDocument Content:\n${attachmentsContent}\n\nOnly answer using this extracted text. Do not invent or assume contents not present in the extracted text.`;
    }
  }
  // Case 2: No attachment in current turn, check PREVIOUS turns for follow-up context (e.g. "Explain line 3", "What is this?")
  else if (chatHistory && chatHistory.length > 0) {
    const pastAttachmentsList = [];
    for (const m of chatHistory) {
      if (m.attachments && m.attachments.length > 0) {
        for (const att of m.attachments) {
          if (att && att.extractedText && typeof att.extractedText === 'string' && att.extractedText.trim() !== '' && !att.extractedText.startsWith('[')) {
            const isImg = isImageAttachment(att.fileType, att.fileName);
            pastAttachmentsList.push({
              isImage: isImg,
              text: `[Previously Attached ${isImg ? 'Image (OCR Content)' : 'Document (' + (att.fileType || 'file').toUpperCase() + ' Content)'} in message "${m.content ? m.content.slice(0, 30) : 'upload'}": "${att.fileName}"]\nContent:\n${att.extractedText.trim()}`
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
      const userQ = message && message.trim() ? `User Follow-up Question:\n"${message.trim()}"\n\n` : '';

      if (hasPrevImage) {
        logs.promptType = 'followup_image_ocr';
        promptText = `${userQ}Active Conversation Context (Previously Extracted Text from Uploaded Files):\n${pastContextStr}\n\nInstructions:\nThe following text was extracted from a previously uploaded image/document using OCR/extraction. Only answer using this extracted text. If the OCR text is incomplete, clearly state that some visual information cannot be interpreted from OCR alone. Do not ask the user to re-upload the file.`;
      } else {
        logs.promptType = 'followup_document_text';
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
