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
    if (attachment.extractedText && typeof attachment.extractedText === 'string' && attachment.extractedText.trim().length >= 10 && !attachment.extractedText.startsWith('[') && !attachment.extractedText.startsWith('Document "')) {
      return attachment.extractedText.trim();
    }

    const filename = path.basename(attachment.fileUrl || attachment.fileName || '');
    if (!filename) throw new Error('Upload failed.');
    const filePath = path.join(__dirname, '..', 'uploads', filename);

    if (!fs.existsSync(filePath)) {
      console.error(`[fileExtractor] File not found on disk: ${filePath}`);
      throw new Error('Upload failed.');
    }

    const ext = path.extname(filename).toLowerCase();
    
    // TXT and Markdown Files
    if (ext === '.txt' || ext === '.md') {
      const raw = fs.readFileSync(filePath, 'utf8').trim();
      if (!raw || raw.length < 2) throw new Error('No readable text found in the document.');
      return raw.length > 25000 ? `${raw.slice(0, 25000)}\n\n[Note: Document chunked for optimal AI context processing.]` : raw;
    }

    // PDF File
    if (ext === '.pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        const cleanPdf = data && data.text ? data.text.trim() : '';
        if (!cleanPdf || cleanPdf.length < 15) {
          throw new Error('No readable text found in the PDF.');
        }
        if (cleanPdf.length > 25000) {
          return `${cleanPdf.slice(0, 25000)}\n\n[Note: PDF content chunked for optimal AI context processing. Total length: ${cleanPdf.length} characters.]`;
        }
        return cleanPdf;
      } catch (pdfErr) {
        console.error('[Backend PDF Extraction Error]:', pdfErr.message, pdfErr.stack);
        if (pdfErr.message && pdfErr.message.includes('No readable text found')) {
          throw pdfErr;
        }
        throw new Error('PDF extraction failed.');
      }
    }

    // DOCX and DOC Files
    if (ext === '.docx' || ext === '.doc') {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        const cleanDoc = result && result.value ? result.value.trim() : '';
        if (!cleanDoc || cleanDoc.length < 10) {
          throw new Error('No readable text found in the Word document.');
        }
        if (cleanDoc.length > 25000) {
          return `${cleanDoc.slice(0, 25000)}\n\n[Note: Word document chunked for optimal AI context processing.]`;
        }
        return cleanDoc;
      } catch (docErr) {
        console.error('[Backend Word Extraction Error]:', docErr.message, docErr.stack);
        if (docErr.message && docErr.message.includes('No readable text found')) {
          throw docErr;
        }
        throw new Error('Unsupported file type.');
      }
    }

    // PPT and PPTX Files
    if (ext === '.ppt' || ext === '.pptx') {
      try {
        const rawBuffer = fs.readFileSync(filePath);
        const rawStr = rawBuffer.toString('utf8', 0, Math.min(rawBuffer.length, 500000));
        const cleanText = rawStr.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
        if (!cleanText || cleanText.length < 10) {
          throw new Error('No readable text found in the presentation slide.');
        }
        return cleanText.length > 25000 ? `${cleanText.slice(0, 25000)}\n\n[Note: Presentation chunked for optimal AI context.]` : cleanText;
      } catch (pptErr) {
        console.error('[Backend PPT Extraction Error]:', pptErr.message, pptErr.stack);
        if (pptErr.message && pptErr.message.includes('No readable text found')) {
          throw pptErr;
        }
        throw new Error('Unsupported file type.');
      }
    }

    // Images (OCR)
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') {
      try {
        const Tesseract = require('tesseract.js');
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
        const cleanOcr = text ? text.trim() : '';
        if (!cleanOcr || cleanOcr.length < 2) {
          throw new Error('OCR failed.');
        }
        return cleanOcr;
      } catch (ocrErr) {
        console.error('[Backend OCR Error]:', ocrErr.message, ocrErr.stack);
        if (ocrErr.message && ocrErr.message.includes('OCR failed')) {
          throw ocrErr;
        }
        throw new Error('OCR failed.');
      }
    }

    // Generic fallback for any other text format
    try {
      const raw = fs.readFileSync(filePath, 'utf8').trim();
      if (!raw || raw.length < 2) throw new Error('Empty');
      return raw.length > 25000 ? raw.slice(0, 25000) : raw;
    } catch {
      throw new Error('Unsupported file type.');
    }
  } catch (error) {
    console.error(`[fileExtractor] Extraction failed for ${attachment.fileName || 'file'}:`, error.message, error.stack);
    throw error;
  }
};

module.exports = {
  extractTextFromAttachment
};
