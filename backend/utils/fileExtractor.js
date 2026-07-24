const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

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
    
    // TXT File
    if (ext === '.txt') {
      return fs.readFileSync(filePath, 'utf8');
    }

    // PDF File
    if (ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    }

    // DOCX File
    if (ext === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    // Images (OCR)
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') {
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      return text;
    }

    throw new Error(`Unsupported file extraction for extension: ${ext}`);
  } catch (error) {
    console.error(`[fileExtractor] Failed to extract text from ${attachment.fileName}:`, error.message);
    throw new Error(`Failed to extract text from ${attachment.fileName}: ${error.message}`);
  }
};

module.exports = {
  extractTextFromAttachment
};
