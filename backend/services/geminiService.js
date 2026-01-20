const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Service to handle interactions with Google's Gemini AI
 */
class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey || this.apiKey === 'PLACEHOLDER_API_KEY') {
      console.warn('GEMINI_API_KEY is not set or is a placeholder. AI features will not work correctly.');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey || '');
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are a Water Conservation Specialist for the East African context (Kenya, Uganda, Tanzania, Rwanda, Burundi, South Sudan, Ethiopia, etc.). 
      Your goal is to provide expert advice on:
      1. River protection strategies and watershed management.
      2. Plastic waste management and recycling initiatives.
      3. Tree planting, agroforestry, and native vegetation restoration.
      4. Community engagement and education on water security.
      5. Sustainable agriculture and irrigation practices.

      Guidelines:
      - Be professional, encouraging, and empathetic to local challenges.
      - Provide actionable, low-cost, and culturally appropriate advice suitable for the East African region.
      - Use markdown for formatting (bold, lists, headers).
      - If a user asks something completely unrelated to water conservation or the environment, politely steer the conversation back to your expertise.
      - Acknowledge local languages and contexts if mentioned (e.g., Swahili, Luganda, Kinyarwanda).
      - Always prioritize sustainable and community-driven solutions.`,
    });
  }

  /**
   * Generates a response from Gemini based on user input and chat history
   * @param {string} prompt - The user's message
   * @param {Array} history - Previous messages in the conversation
   * @param {string} language - The target language for the response
   * @returns {Promise<string>} - The AI generated response
   */
  async generateResponse(prompt, history = [], language = 'en') {
    try {
      if (!this.apiKey || this.apiKey === 'PLACEHOLDER_API_KEY') {
        return "I'm sorry, but my AI services are currently not configured. Please contact the administrator to set up the GEMINI_API_KEY.";
      }

      // Add language instruction to the prompt if it's not English
      let finalPrompt = prompt;
      if (language && language !== 'en') {
        const languageNames = {
          'sw': 'Swahili (Kiswahili)',
          'rw': 'Kinyarwanda',
          'rn': 'Kirundi',
          'lg': 'Luganda'
        };
        const langName = languageNames[language] || language;
        finalPrompt = `(Please respond in ${langName}) ${prompt}`;
      }

      const chat = this.model.startChat({
        history: history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })),
      });

      const result = await chat.sendMessage(finalPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate response from AI specialist');
    }
  }
}

module.exports = new GeminiService();
