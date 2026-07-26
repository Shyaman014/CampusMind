const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

/**
 * Service for analyzing image files using official @google/genai SDK with gemini-2.5-flash model.
 * Provides ChatGPT-like image understanding for diagrams, flowcharts, screenshots, handwriting, etc.
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
 * Analyzes an image file using Gemini 2.5 Flash and returns a detailed plain text description.
 * @param {string} filePath - Absolute path to the image file
 * @param {string} [userPrompt=''] - Optional user prompt to guide the analysis
 * @returns {Promise<string>} Plain text description of the image
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
    console.log(`[visionService] Starting Gemini Vision analysis for file: "${filename}"${userPrompt ? ' with prompt: "' + userPrompt.slice(0, 50) + '..."' : ''}`);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(filePath);

    const defaultPrompt = 'Please provide a comprehensive, highly detailed description of this image. Extract and explain all text, diagrams, figures, charts, flowcharts, UI screenshots, graphs, tables, or handwritten notes present.';
    const promptText = userPrompt && userPrompt.trim()
      ? `Please analyze this image in detail and describe all visual elements, diagrams, charts, text, or figures. Specifically address this request in your explanation:\n"${userPrompt.trim()}"`
      : defaultPrompt;

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

    const description = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!description || description.trim().length === 0) {
      throw new Error('Gemini Vision returned an empty description.');
    }

    console.log(`[visionService] Gemini Vision analysis successful for "${filename}". Extracted char count: ${description.trim().length}`);
    return description.trim();
  } catch (error) {
    console.error(`[visionService Error] Failed to analyze image "${path.basename(filePath || '')}":`, error.message);
    throw error;
  }
};

module.exports = {
  analyzeImage,
  getMimeType,
};
