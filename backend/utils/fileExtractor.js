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
    // Assuming fileUrl is like "/uploads/filename.ext"
    const filename = path.basename(attachment.fileUrl || attachment.fileName);
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found on server: ${attachment.fileName}`);
    }

    const ext = path.extname(filename).toLowerCase();
    
    // TXT and Markdown Files
    if (ext === '.txt' || ext === '.md') {
      return fs.readFileSync(filePath, 'utf8');
    }

    // PDF File
    if (ext === '.pdf') {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
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
      const Tesseract = require('tesseract.js');
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      return text || `[Image OCR: ${attachment.fileName}]`;
    }

    // Generic fallback for any other text format
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch {
      return `Uploaded attachment: ${attachment.fileName}`;
    }
  } catch (error) {
    console.error(`[fileExtractor] Failed to extract text from ${attachment.fileName}:`, error.message);
    throw new Error(`Failed to extract text from ${attachment.fileName}: ${error.message}`);
  }
};

module.exports = {
  extractTextFromAttachment
};
