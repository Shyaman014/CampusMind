/**
 * Utility module for building structured prompts and managing conversation memory for AI analysis.
 * Integrates Gemini Vision OCR & Document Parsing with Groq Professor & Reasoning Engine.
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
 * Formats conversation history messages, enriching them with stored Gemini Vision extraction or document text.
 * Prevents context loss across multi-turn conversations.
 * @param {Array} messages - Array of message objects from MongoDB
 * @returns {Array} Formatted messages array { role, content } for LLM
 */
const formatConversationHistory = (messages = []) => {
  return messages.slice(-10).map((m) => {
    let contentStr = m.content || '';
    if (m.attachments && m.attachments.length > 0) {
      const attSummary = m.attachments
        .filter(a => a && (a.fileName || a.extractedText || a.visionText || a.parsedContent))
        .map(a => {
          const isImg = isImageAttachment(a.fileType, a.fileName);
          const typeLabel = isImg ? `Image (Gemini Vision ${a.documentType || 'Extraction'})` : `Document (${(a.fileType || 'file').toUpperCase()})`;
          const content = a.parsedContent || a.extractedText || a.visionText || 'No readable text available.';
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
 * Enforces Groq Professor + Reasoning Engine behavior on structured extractions.
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
        const content = att.parsedContent || att.extractedText || att.visionText || 'No readable content found.';
        return `--- Structured Extraction (${att.documentType || att.fileType || 'file'}): ${att.fileName} ---\n${content}\n--- End Extraction ---`;
      })
      .join('\n\n');

    if (hasImage) {
      logs.promptType = 'current_image_vision';
      const userQ = message && message.trim() ? `\n\nUser Question/Instruction:\n"${message.trim()}"` : '';
      promptText = `You are an expert university professor, senior academic evaluator, and reasoning engine.
An uploaded image has already been classified and parsed into a strict structured extraction (JSON/Markdown) by an advanced OCR and document parser.

${attachmentsContent}${userQ}

CRITICAL REASONING & SOLVING MANDATES:
1. SOLVE ONLY WHAT EXISTS INSIDE THE EXTRACTION: You must solve and explain ONLY the questions, equations, and data explicitly present in the structured extraction above.
2. NEVER GUESS UNREADABLE TEXT: Never allow yourself to guess, infer, or hallucinate missing words, numbers, symbols, or equations. If any part of the text or question is marked [UNCLEAR], explicitly inform the user which specific part or variable is unreadable and solve only the clearly legible portions.
3. PRESERVE EXACT STRUCTURE: Preserve exact question numbering, sub-question labels, marks, mathematical notation, Boolean expressions, and logic symbols exactly as given in the extraction.
4. DIAGRAM RECONSTRUCTION: For any question that references a diagram or has a diagram description in the "diagrams" region, use the description to explain the concepts and reconstruct clear ASCII diagrams or flowcharts in your solution.
5. EXAM-READY FORMATTING: Provide structured, exam-ready, professional answers with clear bullet points, step-by-step mathematical calculations, and avoid generic filler or unnecessary code unless requested. Answer every sub-question separately.`;
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
          const textContent = att.parsedContent || att.extractedText || att.visionText || '';
          if (textContent && typeof textContent === 'string' && textContent.trim() !== '' && !textContent.startsWith('[')) {
            const isImg = isImageAttachment(att.fileType, att.fileName);
            pastAttachmentsList.push({
              isImage: isImg,
              text: `[Previously Attached ${isImg ? 'Image (Gemini Vision ' + (att.documentType || 'Extraction') + ')' : 'Document (' + (att.fileType || 'file').toUpperCase() + ' Content)'} in message "${m.content ? m.content.slice(0, 30) : 'upload'}": "${att.fileName}"]\nContent:\n${textContent.trim()}`
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
        const userQ = message && message.trim() ? message.trim() : 'Please continue solving or explaining.';
        promptText = `You are an expert university professor, senior academic evaluator, and reasoning engine.
An exam paper or image was previously uploaded by the user, and its content was classified and parsed into a strict structured extraction (JSON/Markdown).

Active Conversation Context (Previously Stored Image/Document Extractions):
${pastContextStr}

User Follow-up Question/Instruction:
"${userQ}"

CRITICAL REASONING & SOLVING MANDATES:
1. SOLVE ONLY WHAT EXISTS INSIDE THE EXTRACTION: Answer the user's follow-up question using ONLY the stored structured extraction above without asking them to re-upload the file.
2. NEVER GUESS UNREADABLE TEXT: Do not guess, infer, or hallucinate any unreadable text or numbers marked [UNCLEAR]. Remind the user if a required variable was unreadable.
3. DIAGRAM RECONSTRUCTION: Use any stored diagram descriptions in the extraction to reconstruct ASCII diagrams or explain circuitry/flowcharts clearly.
4. EXAM-READY FORMATTING: Maintain step-by-step calculations, bullet points, and clear academic structure. Answer every sub-question separately.`;
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
