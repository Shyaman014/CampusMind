const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

/**
 * Service for analyzing image files using official @google/genai SDK with gemini-2.5-flash model.
 * Acts STRICTLY as an AI Document Classifier, Advanced OCR Engine, and Document Structure Parser.
 * Never solves, summarizes, or answers questions directly.
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
 * Analyzes an image file using Gemini 2.5 Flash as a Document Classifier & OCR Parser.
 * Returns both structured JSON and Markdown extraction.
 * @param {string} filePath - Absolute path to the image file
 * @param {string} [userPrompt=''] - Optional user prompt (ignored for solving; used only as extraction context)
 * @returns {Promise<Object>} Object containing { documentType, markdown, questions, diagrams, json, text }
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
    console.log(`[visionService] Starting Gemini Vision Classification & OCR Parsing for file: "${filename}"`);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = getMimeType(filePath);

    const systemInstruction = `You are a precision AI Document Classifier, Advanced OCR Engine, and Document Structure Parser.
Your ONLY responsibility is to analyze the uploaded image, classify the document type, and perform a strict, lossless OCR and structural extraction into JSON format.

CRITICAL MANDATES:
1. DOCUMENT CLASSIFICATION:
Classify the uploaded image into exactly one of the following "documentType" values:
- "question_paper"
- "notes"
- "resume"
- "invoice"
- "aadhaar"
- "circuit_diagram"
- "flowchart"
- "graph"
- "table"
- "general_image"

2. STRICT OCR EXTRACTION RULES (Especially for Question Papers & Academic Documents):
- NEVER summarize, NEVER solve, NEVER answer questions, NEVER rewrite, and NEVER complete missing words.
- Preserve every line exactly as presented.
- Preserve exact numbering and sub-question labels (e.g., 1., (a), (i), Q2.b).
- Preserve all marks allocated (e.g., [5 Marks], (10M)).
- Preserve spacing where meaningful.
- Preserve tables using Markdown syntax.
- If any word, number, symbol, or section cannot be read with high confidence due to blur, low contrast, or cropping, write exactly: [UNCLEAR]. Do NOT guess or infer.

3. ADVANCED MATHEMATICAL OCR & LOGIC NOTATION:
Pay special attention to and accurately transcribe:
- Binary numbers (e.g., 1011₂, 0b1011) and Hexadecimal numbers (e.g., 3F₁₆, 0x3F).
- Subscripts and superscripts (e.g., x₁, a², 2ⁿ).
- Complements and negation (e.g., A', A̅, \\overline{A}, 1's/2's complement).
- Logic symbols (e.g., ⊕, ⊙, ∧, ∨, ¬, →, ·, +).
- Boolean expressions and algebraic equations using standard notation or LaTeX.

4. DIAGRAMS & IMAGE REGIONS:
- For any circuit diagram, flowchart, graph, figure, or visual illustration, do NOT attempt to solve or interpret its meaning.
- Instead, preserve image regions for diagrams separately in the "diagrams" array. For each diagram, provide the "region" (e.g., "Question 1(b) circuit diagram") and a detailed structural "description" listing all components, logic gates, inputs, outputs, labels, and interconnections so that an ASCII diagram can be reconstructed from it.

5. REQUIRED JSON OUTPUT STRUCTURE:
You must return ONLY a JSON object matching this exact schema:
{
  "documentType": "<classified_type>",
  "markdown": "<complete verbatim Markdown extraction preserving all headings, lines, tables, equations, question numbers, marks, and referencing diagram regions as [See Diagram: <region>]>",
  "questions": [
    {
      "number": "<question number e.g. 1(a)>",
      "marks": "<marks e.g. 5>",
      "text": "<exact verbatim question text and equations>",
      "diagram": "<optional structural diagram description if present for this question>"
    }
  ],
  "diagrams": [
    {
      "region": "<diagram region label e.g. Question 1(b) diagram>",
      "description": "<detailed structural description of components and connections>"
    }
  ]
}`;

    const promptText = userPrompt && userPrompt.trim()
      ? `${systemInstruction}\n\nNote on User Interest: The user mentioned "${userPrompt.trim()}". Remember: Do NOT answer or solve this! Perform ONLY exact document classification, structural OCR extraction, and diagram description as instructed above.`
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
      config: {
        responseMimeType: 'application/json',
      }
    });

    const rawText = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    let parsedJson;
    try {
      parsedJson = JSON.parse(rawText.trim());
    } catch (parseErr) {
      console.warn(`[visionService] JSON parse fallback triggered for "${filename}":`, parseErr.message);
      parsedJson = {
        documentType: 'general_image',
        markdown: rawText.trim(),
        questions: [],
        diagrams: [],
      };
    }

    // Ensure essential properties exist
    const docType = parsedJson.documentType || 'general_image';
    const markdownStr = parsedJson.markdown || (typeof parsedJson === 'string' ? parsedJson : JSON.stringify(parsedJson, null, 2));
    const jsonStr = JSON.stringify(parsedJson, null, 2);

    if (!markdownStr || markdownStr.trim().length === 0) {
      throw new Error('Gemini Vision returned an empty extraction.');
    }

    console.log(`[visionService] Extraction successful | Filename: "${filename}" | Type: "${docType}" | Questions: ${parsedJson.questions?.length || 0} | Diagrams: ${parsedJson.diagrams?.length || 0}`);

    return {
      documentType: docType,
      markdown: markdownStr.trim(),
      questions: parsedJson.questions || [],
      diagrams: parsedJson.diagrams || [],
      json: jsonStr.trim(),
      text: markdownStr.trim()
    };
  } catch (error) {
    console.error(`[visionService Error] Failed to extract image "${path.basename(filePath || '')}":`, error.message);
    throw error;
  }
};

module.exports = {
  analyzeImage,
  getMimeType,
};
