const OpenAI = require("openai");

console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY ? "FOUND" : "NOT FOUND");

let openai = null;

try {
  openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });
  console.log("Groq client initialized");
} catch (err) {
  console.error("Groq init error:", err);
}

module.exports = openai;