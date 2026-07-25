const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

/**
 * Extracts text from a local file attachment.
 * @param {Object} attachment - The attachment object containing { fileName, fileUrl, fileType }
 * @returns {Promise<string>} The extracted text
 */
const extractTextFromAttachment = async (attachment) => {
  try {
    if (attachment.extractedText && typeof attachment.extractedText === 'string' && attachment.extractedText.trim().length > 0) {
      return attachment.extractedText;
    }

    const filename = path.basename(attachment.fileUrl || attachment.fileName || '');
    if (!filename) return attachment.extractedText || attachment.summary || `[Attachment: ${attachment.fileName || 'file'}]`;
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`[fileExtractor] File not found on disk: ${filePath}`);
      return attachment.extractedText || attachment.summary || `[Attachment uploaded: ${attachment.fileName || filename}]`;
    }

    const ext = path.extname(filename).toLowerCase();
    
    // TXT and Markdown Files
    if (ext === '.txt' || ext === '.md') {
      return fs.readFileSync(filePath, 'utf8');
    }

    // PDF File
    if (ext === '.pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.text || `[PDF Document: ${attachment.fileName}]`;
      } catch (pdfErr) {
        console.warn(`[PDF Parse Warning] Failed for ${attachment.fileName}:`, pdfErr.message);
        return attachment.extractedText || attachment.summary || `[PDF Document: ${attachment.fileName}]`;
      }
    }

    // DOCX and DOC Files
    if (ext === '.docx' || ext === '.doc') {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value || 'Document parsed successfully.';
      } catch (e) {
        const raw = fs.readFileSync(filePath, 'utf8');
        return raw.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim() || 'Document uploaded.';
      }
    }

    // PPT and PPTX Files
    if (ext === '.ppt' || ext === '.pptx') {
      const rawBuffer = fs.readFileSync(filePath);
      const rawStr = rawBuffer.toString('utf8', 0, Math.min(rawBuffer.length, 500000));
      const cleanText = rawStr.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
      return `[PowerPoint Presentation: ${attachment.fileName}]\n` + (cleanText.length > 50 ? cleanText.slice(0, 5000) : 'Slide presentation content uploaded.');
    }

    // Images (OCR)
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') {
      try {
        const Tesseract = require('tesseract.js');
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        return text || `[Image OCR: ${attachment.fileName}]`;
      } catch (ocrErr) {
        console.warn(`[OCR Warning] Tesseract failed for ${attachment.fileName}:`, ocrErr.message);
        return attachment.extractedText || attachment.summary || `[Image attachment: ${attachment.fileName}]`;
      }
    }

    // Generic fallback for any other text format
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch {
      return `Uploaded attachment: ${attachment.fileName}`;
    }
  } catch (error) {
    console.warn(`[fileExtractor] Extraction fallback for ${attachment.fileName || 'file'}:`, error.message);
    return attachment.extractedText || attachment.summary || `[Uploaded attachment: ${attachment.fileName || 'document'}]`;
  }
};

module.exports = {
  extractTextFromAttachment
};
