const openai = require('../config/openai');

const SYSTEM_PROMPT = `You are CampusMind AI, an expert tutor, senior software engineer, and technical mentor like ChatGPT.
Answer naturally, directly, and conversationally in Markdown.
Generate code with proper syntax highlighting whenever requested.
IMPORTANT: When generating code, do NOT include documentation comments such as JavaDoc, Python docstrings, JSDoc, XML docs, or any @param/@return/@throws tags. Output only clean code without doc comments.`;

const GROQ_MODEL = 'llama-3.3-70b-versatile';


const callLLM = async (messages) => {
  const prompt = Array.isArray(messages)
    ? messages.map((m) => `${m.role}: ${m.content}`).join('\n')
    : String(messages);

  if (!openai) {
    const err = new Error('AI service is currently unavailable due to missing API key configuration.');
    err.statusCode = 503;
    throw err;
  }

  try {
    const response = await openai.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) {
      const err = new Error('No content returned from AI service.');
      err.statusCode = 502;
      throw err;
    }
    return text;
  } catch (err) {
    err.statusCode = err.statusCode || err.status || 503;
    throw err;
  }
};


const streamAIResponse = async (promptText, onChunk, conversationHistory = []) => {
  const userQuery = promptText ? promptText.trim() : '';
  
  if (!openai) {
    onChunk('⚠️ **AI service is not configured.** Please add a valid `GROQ_API_KEY` to the backend `.env` file and restart the server.');
    return;
  }

  const historyMessages = conversationHistory.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  try {
    const stream = await openai.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...historyMessages,
        { role: 'user', content: userQuery },
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onChunk(content);
      }
    }
  } catch (e) {
    console.error('[Groq Stream Error]:', e);
    // Return the actual Groq error to the user
    onChunk(`⚠️ **Groq API call failed:** ${e.message || 'Unknown error occurred.'}`);
  }
};


const generateAIAnswer = async (questionTitle, questionContent, explanationLevel = 'standard') => {
  const levelPrompt =
    explanationLevel === 'beginner'
      ? ' Explain simply for beginners with easy examples.'
      : explanationLevel === 'advanced'
        ? ' Provide advanced in-depth analysis with implementation details and complexity analysis.'
        : '';

  const prompt = `Please provide a comprehensive explanation for the following academic question.${levelPrompt}

**Question:** ${questionTitle}

${questionContent ? `**Details:** ${questionContent}` : ''}

Provide your answer in well-structured Markdown with code examples where relevant.`;

  return await callLLM(prompt);
};


const generateRelatedQuestions = async (title, content) => {
  try {
    const prompt = `Given this academic question: "${title}"${content ? ` with details: "${content}"` : ''}, generate exactly 3 related follow-up study questions that would help the student deepen their understanding. Return ONLY a JSON array of 3 strings, no other text. Example: ["Question 1?", "Question 2?", "Question 3?"]`;

    const response = await callLLM(prompt);

    const jsonMatch = response.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 3);
      }
    }

    return [
      `What are the practical applications of ${title}?`,
      `What are common interview questions on ${title}?`,
      `How can we optimize solutions related to ${title}?`,
    ];
  } catch (error) {
    console.warn('[generateRelatedQuestions Error]:', error.message);
    return [
      `What are the practical applications of ${title}?`,
      `What are common interview questions on ${title}?`,
      `How can we optimize solutions related to ${title}?`,
    ];
  }
};


const analyzeUploadedMaterial = async (fileName) => {
  try {
    const prompt = `A student uploaded a study document named "${fileName}". Based on the document name, generate a helpful analysis in the following JSON format (return ONLY valid JSON, no other text):
{
  "summary": "A 2-3 sentence summary of what this document likely covers based on its name.",
  "importantPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "flashcards": [
    {"front": "Question about a key concept?", "back": "Answer explaining the concept."},
    {"front": "Another key concept question?", "back": "Its explanation."}
  ],
  "quiz": [
    {"question": "A multiple-choice question about the topic?", "options": ["Correct answer", "Wrong answer 1", "Wrong answer 2", "Wrong answer 3"], "correctAnswer": 0, "explanation": "Why this is correct."}
  ],
  "interviewQuestions": ["Interview question 1?", "Interview question 2?"]
}`;

    const response = await callLLM(prompt);

    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || `Analysis of "${fileName}".`,
        importantPoints: parsed.importantPoints || [],
        flashcards: parsed.flashcards || [],
        quiz: parsed.quiz || [],
        interviewQuestions: parsed.interviewQuestions || [],
      };
    }

    return {
      summary: `Document "${fileName}" has been uploaded. AI analysis could not parse structured data — please check the document content.`,
      importantPoints: ['Upload successful', 'Review the document manually for key concepts'],
      flashcards: [{ front: `What is covered in ${fileName}?`, back: 'Review the uploaded document for details.' }],
      quiz: [{ question: `What topic does ${fileName} cover?`, options: ['Check the document', 'Unknown'], correctAnswer: 0, explanation: 'Review the uploaded content.' }],
      interviewQuestions: [`Explain the key concepts from ${fileName}.`],
    };
  } catch (error) {
    console.warn('[analyzeUploadedMaterial Error]:', error.message);
    return {
      summary: `Document "${fileName}" uploaded successfully, but AI analysis is currently unavailable. Error: ${error.message}`,
      importantPoints: ['AI analysis unavailable — check API key configuration'],
      flashcards: [],
      quiz: [],
      interviewQuestions: [],
    };
  }
};

module.exports = {
  streamAIResponse,
  generateAIAnswer,
  generateRelatedQuestions,
  analyzeUploadedMaterial,
  callLLM,
};
