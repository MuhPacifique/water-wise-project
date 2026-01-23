const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');

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
   * Translates text to a target language
   * @param {string} text - The text to translate
   * @param {string} targetLanguage - The language code (e.g., 'sw', 'fr', 'rw')
   * @param {string} sourceLanguage - Optional source language code
   * @returns {Promise<string>} - The translated text
   */
  async translate(text, targetLanguage, sourceLanguage = 'en') {
    try {
      if (!this.apiKey || this.apiKey === 'PLACEHOLDER_API_KEY') {
        // Fallback to free Google Translate API from backend to avoid CORS
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;
          const response = await axios.get(url);
          if (response.data && response.data[0] && response.data[0][0]) {
            return response.data[0][0][0];
          }
          return text;
        } catch (fallbackError) {
          console.error('Fallback Translation Error:', fallbackError);
          return text;
        }
      }

      const languageNames = {
        'sw': 'Swahili (Kiswahili)',
        'rw': 'Kinyarwanda',
        'rn': 'Kirundi',
        'lg': 'Luganda',
        'fr': 'French',
        'en': 'English'
      };

      const targetLangName = languageNames[targetLanguage] || targetLanguage;
      const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;

      const prompt = `Translate the following text from ${sourceLangName} to ${targetLangName}. 
      Only return the translated text without any explanations or additional formatting.
      
      Text to translate:
      ${text}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Translation Error:', error);
      return text; // Fallback to original text
    }
  }

  /**
   * Generates a response from Gemini based on user input and chat history
   * @param {string} prompt - The user's message
   * @param {Array} history - Previous messages in the conversation
   * @param {string} language - The target language for the response
   * @returns {Promise<Object>} - The AI generated response and metadata
   */
  async generateResponse(prompt, history = [], language = 'en') {
    try {
      if (!this.apiKey || this.apiKey === 'PLACEHOLDER_API_KEY') {
        console.warn('Using mock AI response because GEMINI_API_KEY is not set.');
        return {
          response: this.getMockResponse(prompt),
          isMock: true
        };
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
      return {
        response: response.text(),
        isMock: false
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate response from AI specialist');
    }
  }

  /**
   * Provides a fallback response when the API is not configured
   * @param {string} prompt - The user's message
   * @returns {string} - A helpful mock response
   */
  getMockResponse(prompt) {
    const p = prompt.toLowerCase();
    
    if (p.includes('river') || p.includes('water')) {
      return "**River Protection Strategy:**\n\nProtecting our rivers is crucial for East Africa's future. Our current strategy recommends:\n\n1. **Buffer Zones:** Maintain a native vegetation belt of at least 30m to prevent siltation.\n2. **Waste Management:** Implementing community-led collection points to stop direct dumping.\n3. **Monitoring:** Utilizing local 'River Guardians' to report pollution incidents.\n\nOur goal is to ensure sustainable water access for all communities downstream.";
    }
    
    if (p.includes('plastic') || p.includes('waste')) {
      return "**Plastic Management Initiative:**\n\nPlastic waste is a primary threat to aquatic ecosystems. We are currently implementing:\n\n- **Regional Collection Hubs:** Sorting centers managed by local cooperatives.\n- **Circular Economy:** Converting PET waste into durable building materials.\n- **Policy Advocacy:** Supporting local bans on single-use plastics in riparian zones.";
    }
    
    if (p.includes('tree') || p.includes('plant') || p.includes('agroforestry')) {
      return "**Agroforestry & Restoration:**\n\nLandscape restoration requires a strategic mix of native and productive species:\n\n- **Water Retention:** Prioritizing *Acacia* and *Ficus* species for groundwater recharge.\n- **Economic Integration:** Planting high-value fruit trees (Mango, Avocado) to incentivize farmers.\n- **Soil Regeneration:** Integrating nitrogen-fixing legumes to restore degraded farmland.";
    }

    if (p.includes('testimony') || p.includes('story') || p.includes('success')) {
      return "**Field Success Report:**\n\nIn the Musanze district of Rwanda, our collaborative restoration of local springs resulted in a 40% increase in water volume over 24 months. This was achieved through community-led bamboo planting and a strict zero-waste policy along the banks.";
    }

    if (p.includes('campaign') || p.includes('awareness')) {
      return "**Active Campaign Strategy:**\n\nOur 'My River, My Life' initiative is currently deploying:\n\n- **Vernacular Outreach:** Expert-led radio sessions in local languages.\n- **Youth Engagement:** Environmental 'Conservation Cups' to involve local teenagers.\n- **Stakeholder Partnerships:** Collaborative sermons with local religious leaders on environmental stewardship.";
    }

    return "Greetings. I am the **Autonomous AI Water Specialist**. \n\nI am currently analyzing East African watershed data to provide expert guidance on river protection, waste management, and community conservation initiatives. \n\nHow can I assist your conservation efforts today? You may ask about specific strategies like 'river buffers', 'plastic recycling hubs', or 'community engagement models'.";
  }

  /**
   * Generates autonomous content for different sections of the site
   * @param {string} section - The section name (e.g., 'testimonies', 'campaigns')
   * @returns {Object} - AI generated content
   */
  async generateAutonomousContent(section) {
    // This is a placeholder for actual autonomous content generation
    // In a real scenario, this would call the Gemini API with a specific prompt
    const content = {
      'testimonies': [
        { id: 101, name: "Samuel Okoro", location: "Nigeria (Delta)", text: "AI-driven monitoring of our water levels has saved our village from three floods this year." },
        { id: 102, name: "Amina Juma", location: "Tanzania (Zanzibar)", text: "Our solar-powered desalination plant is now managed by a local youth cooperative." }
      ],
      'campaigns': [
        { id: 201, title: "Clean Waters 2026", location: "Regional", date: "April 2026", participants: 5000 }
      ]
    };
    return content[section] || [];
  }
}

module.exports = new GeminiService();
