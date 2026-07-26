const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

/**
 * Service for analyzing image files using official @google/genai SDK with gemini-2.5-flash model.
 * Acts STRICTLY as an OCR and Document Parser engine. Never solves or answers questions directly.
 */

const getMimeType = (filePath) => {
  const ext = path.extname(filePath || '').toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
  };
  return mimeMap[ext] || 'image/jpeg';
};

/**
 * Analyzes an image file using Gemini 2.5 Flash as an OCR + Document Parser to extract structured Markdown.
 * @param {string} filePath - Absolute path to the image file
 * @param {string} [userPrompt=''] - Optional user prompt (ignored for solving; used only as extraction context)
 * @returns {Promise<string>} Structured Markdown extraction of the image
 */
const analyzeImage = async (filePath, userPrompt = '') => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Image file not found at path: ${filePath}`);
    }

    const filename = path.basename(filePath);
    console.log(`[visionService] Starting Gemini Vision OCR & Document Parsing for file: "${filename}"`);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(filePath);

    const systemInstruction = `You are a precision OCR and Document Parser engine. Your ONLY responsibility is extracting text, equations, tables, and structural visual descriptions from the uploaded image into structured Markdown.
CRITICAL MANDATES:
1. NEVER answer questions, NEVER explain theory, NEVER solve numericals, NEVER solve diagrams, and NEVER summarize content.
2. Extract every visible heading, instruction, question, and text exactly as written, preserving exact question numbering, sub-parts, marks, question order, equations, mathematical expressions, symbols, and formatting.
3. For tables, represent them accurately using Markdown table syntax.
4. For diagrams, charts, graphs, figures, or screenshots, do NOT attempt to solve or interpret their meaning. Instead, provide a detailed structural physical description formatted exactly like:
Diagram Description:
- [component or visual element 1]
- [component or visual element 2]
- [connections, labels, or layout]
5. If any word, symbol, number, or section cannot be read clearly due to blur, low contrast, or cropping, write exactly: [UNCLEAR]. NEVER guess, NEVER infer, and NEVER complete missing text.
Return ONLY the structured Markdown extraction without introductory or concluding remarks.`;

    const promptText = userPrompt && userPrompt.trim()
      ? `${systemInstruction}\n\nNote on User Interest: The user mentioned "${userPrompt.trim()}". Remember: Do NOT answer or solve this! Perform ONLY exact structural OCR extraction and diagram description as instructed above.`
      : systemInstruction;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        promptText,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
      ],
    });

    const extraction = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!extraction || extraction.trim().length === 0) {
      throw new Error('Gemini Vision returned an empty extraction.');
    }

    console.log(`[visionService] Gemini Vision extraction successful for "${filename}". Extracted char count: ${extraction.trim().length}`);
    return extraction.trim();
  } catch (error) {
    console.error(`[visionService Error] Failed to extract image "${path.basename(filePath || '')}":`, error.message);
    throw error;
  }
};

module.exports = {
  analyzeImage,
  getMimeType,
};
