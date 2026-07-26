const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');
const sharp = require('sharp');

/**
 * Accurately detects the file type from filename extension and MIME type.
 * @param {string} filename 
 * @param {string} mimetype 
 * @returns {string} One of: 'pdf', 'docx', 'txt', 'markdown', 'image', 'ppt', 'other'
 */
const detectFileType = (filename = '', mimetype = '') => {
  const ext = path.extname(filename).toLowerCase();
  const mime = (mimetype || '').toLowerCase();

  if (ext === '.pdf' || mime === 'application/pdf') {
    return 'pdf';
  }
  if (['.doc', '.docx'].includes(ext) || mime.includes('word') || mime.includes('document')) {
    return 'docx';
  }
  if (ext === '.md' || ext === '.markdown' || mime === 'text/markdown') {
    return 'markdown';
  }
  if (ext === '.txt' || mime === 'text/plain') {
    return 'txt';
  }
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'].includes(ext) || mime.startsWith('image/')) {
    return 'image';
  }
  if (['.ppt', '.pptx'].includes(ext) || mime.includes('presentation')) {
    return 'ppt';
  }
  return 'other';
};

/**
 * Enhances image quality before OCR using grayscale, normalization, denoising, resizing, sharpening, and thresholding.
 * @param {string} filePath - Absolute path to the image file
 * @returns {Promise<Buffer|string>} Processed image buffer or fallback filePath
 */
const preprocessImageForOcr = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    const targetWidth = Math.max(metadata.width || 1000, 1800);

    // Image enhancement pipeline before OCR: grayscale -> normalize -> median denoise -> resize -> sharpen -> threshold
    const processedBuffer = await sharp(filePath)
      .grayscale() // Convert to grayscale
      .normalize() // Stretch contrast / auto-level
      .median(3) // Denoise using median filter
      .resize({ width: targetWidth, withoutEnlargement: false }) // Scale up for better character resolution
      .sharpen() // Sharpen character edges
      .threshold(128) // Binarize / thresholding for crisp text detection
      .toBuffer();

    return processedBuffer;
  } catch (err) {
    console.warn(`[fileExtractor] Image preprocessing failed for "${filePath}", falling back to raw file:`, err.message);
    return filePath;
  }
};

/**
 * Extracts text from a local file attachment.
 * @param {Object} attachment - The attachment object containing { fileName, fileUrl, fileType, mimetype }
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

    const fileType = detectFileType(filename, attachment.fileType || attachment.mimetype);
    console.log(`[fileExtractor] Starting extraction | Filename: "${filename}" | Detected Type: "${fileType}"`);
    
    // TXT and Markdown Files
    if (fileType === 'txt' || fileType === 'markdown') {
      const raw = fs.readFileSync(filePath, 'utf8').trim();
      if (!raw || raw.length < 2) throw new Error('No readable text found in the document.');
      console.log(`[fileExtractor] Extracted ${fileType.toUpperCase()} | Filename: "${filename}" | Char Count: ${raw.length}`);
      return raw.length > 25000 ? `${raw.slice(0, 25000)}\n\n[Note: Document chunked for optimal AI context processing.]` : raw;
    }

    // PDF File
    if (fileType === 'pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        const cleanPdf = data && data.text ? data.text.trim() : '';
        if (!cleanPdf || cleanPdf.length < 15) {
          throw new Error('No readable text found in the PDF document.');
        }
        console.log(`[fileExtractor] Extracted PDF | Filename: "${filename}" | Char Count: ${cleanPdf.length}`);
        if (cleanPdf.length > 25000) {
          return `${cleanPdf.slice(0, 25000)}\n\n[Note: PDF content chunked for optimal AI context processing. Total length: ${cleanPdf.length} characters.]`;
        }
        return cleanPdf;
      } catch (pdfErr) {
        console.error('[Backend PDF Extraction Error]:', pdfErr.message, pdfErr.stack);
        if (pdfErr.message && pdfErr.message.includes('No readable text found')) {
          throw pdfErr;
        }
        throw new Error('No readable text found in the PDF document.');
      }
    }

    // DOCX and DOC Files
    if (fileType === 'docx') {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        const cleanDoc = result && result.value ? result.value.trim() : '';
        if (!cleanDoc || cleanDoc.length < 10) {
          throw new Error('No readable text found in the Word document.');
        }
        console.log(`[fileExtractor] Extracted DOCX | Filename: "${filename}" | Char Count: ${cleanDoc.length}`);
        if (cleanDoc.length > 25000) {
          return `${cleanDoc.slice(0, 25000)}\n\n[Note: Word document chunked for optimal AI context processing.]`;
        }
        return cleanDoc;
      } catch (docErr) {
        console.error('[Backend Word Extraction Error]:', docErr.message, docErr.stack);
        if (docErr.message && docErr.message.includes('No readable text found')) {
          throw docErr;
        }
        throw new Error('No readable text found in the Word document.');
      }
    }

    // PPT and PPTX Files
    if (fileType === 'ppt') {
      try {
        const rawBuffer = fs.readFileSync(filePath);
        const rawStr = rawBuffer.toString('utf8', 0, Math.min(rawBuffer.length, 500000));
        const cleanText = rawStr.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
        if (!cleanText || cleanText.length < 10) {
          throw new Error('No readable text found in the presentation slide.');
        }
        console.log(`[fileExtractor] Extracted PPT | Filename: "${filename}" | Char Count: ${cleanText.length}`);
        return cleanText.length > 25000 ? `${cleanText.slice(0, 25000)}\n\n[Note: Presentation chunked for optimal AI context.]` : cleanText;
      } catch (pptErr) {
        console.error('[Backend PPT Extraction Error]:', pptErr.message, pptErr.stack);
        if (pptErr.message && pptErr.message.includes('No readable text found')) {
          throw pptErr;
        }
        throw new Error('No readable text found in the presentation slide.');
      }
    }

    // Images (OCR with enhancement preprocessing)
    if (fileType === 'image') {
      try {
        const processedInput = await preprocessImageForOcr(filePath);
        const Tesseract = require('tesseract.js');
        const { data } = await Tesseract.recognize(processedInput, 'eng');
        const cleanOcr = data && data.text ? data.text.trim() : '';
        const confidence = data && typeof data.confidence === 'number' ? data.confidence : null;

        if (!cleanOcr || cleanOcr.length < 5) {
          console.log(`[fileExtractor OCR] Filename: "${filename}" | File Type: "image" | OCR Success: false | OCR Confidence: ${confidence !== null ? confidence.toFixed(2) + '%' : 'N/A'} | Extracted Char Count: ${cleanOcr.length} | Reason: No readable text / mostly graphics`);
          return "This image does not contain enough readable text for analysis. (This image appears to contain mostly graphics or no readable text.)";
        }

        if (confidence !== null && confidence < 45) {
          console.log(`[fileExtractor OCR] Filename: "${filename}" | File Type: "image" | OCR Success: false | OCR Confidence: ${confidence.toFixed(2)}% | Extracted Char Count: ${cleanOcr.length} | Reason: OCR confidence is too low`);
          return "This image does not contain enough readable text for analysis. (OCR confidence is too low.)";
        }

        if (cleanOcr.length < 15) {
          console.log(`[fileExtractor OCR] Filename: "${filename}" | File Type: "image" | OCR Success: false | OCR Confidence: ${confidence !== null ? confidence.toFixed(2) + '%' : 'N/A'} | Extracted Char Count: ${cleanOcr.length} | Reason: Extracted text is too short`);
          return "This image does not contain enough readable text for analysis.";
        }

        console.log(`[fileExtractor OCR] Filename: "${filename}" | File Type: "image" | OCR Success: true | OCR Confidence: ${confidence !== null ? confidence.toFixed(2) + '%' : 'N/A'} | Extracted Char Count: ${cleanOcr.length}`);
        return cleanOcr;
      } catch (ocrErr) {
        console.error('[Backend OCR Error]:', ocrErr.message, ocrErr.stack);
        console.log(`[fileExtractor OCR] Filename: "${filename}" | File Type: "image" | OCR Success: false | Error: ${ocrErr.message}`);
        throw new Error('No readable text found in image.');
      }
    }

    // Generic fallback for any other text format
    try {
      const raw = fs.readFileSync(filePath, 'utf8').trim();
      if (!raw || raw.length < 2) throw new Error('Empty');
      console.log(`[fileExtractor] Extracted OTHER | Filename: "${filename}" | Char Count: ${raw.length}`);
      return raw.length > 25000 ? raw.slice(0, 25000) : raw;
    } catch {
      throw new Error('Unsupported file.');
    }
  } catch (error) {
    console.error(`[fileExtractor] Extraction failed for ${attachment.fileName || 'file'}:`, error.message);
    throw error;
  }
};

module.exports = {
  detectFileType,
  preprocessImageForOcr,
  extractTextFromAttachment
};
