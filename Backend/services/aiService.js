// services/aiService.js
const axios = require('axios'); // Install axios: npm install axios

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3'; // Model you downloaded

// Function to classify user's request (text input) using local LLM
async function classifyUserRequest(userText, language = 'en-IN') {
    const prompt = `You are an AI assistant designed to classify user requests for mentorship.
    The user is from a rural area in India and speaks in ${language}.
    Classify their request into a 'requested_topic' and 'requested_level'.

    Possible topics (use these exactly, choose the best fit):
    - Agriculture:Crop_Management
    - Agriculture:Livestock_Rearing
    - Agriculture:Market_Information
    - Literacy:Basic_Reading
    - Literacy:Basic_Writing
    - Literacy:Basic_Numeracy
    - Health:Hygiene
    - Health:Maternal_Child_Care
    - Vocational:Tailoring
    - Vocational:Basic_Repairs
    - General_Inquiry
    - Other

    Possible levels (use these exactly):
    - beginner
    - intermediate
    - advanced
    - unknown

    If the user's intent is unclear, classify topic as 'General_Inquiry' or 'Other' and level as 'unknown'.

    User's request: "${userText}"

    Respond ONLY with a JSON object in the following format:
    {
      "requested_topic": "CLASSIFIED_TOPIC_HERE",
      "requested_level": "CLASSIFIED_LEVEL_HERE",
      "language_detected": "${language}"
    }`;

    try {
        const response = await axios.post(OLLAMA_API_URL, {
            model: OLLAMA_MODEL,
            prompt: prompt,
            stream: false, // Don't stream response
            options: {
                temperature: 0.1, // Lower temperature for more deterministic output
            }
        });

        const rawText = response.data.response;
        console.log("Ollama Raw Response:", rawText);

        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        } else {
            console.warn("Ollama did not return a clean JSON object. Raw:", rawText);
            return { requested_topic: 'General_Inquiry', requested_level: 'unknown', language_detected: language };
        }
    } catch (error) {
        console.error('Error calling Ollama API:', error.message);
        // Fallback if Ollama fails
        return { requested_topic: 'General_Inquiry', requested_level: 'unknown', language_detected: language };
    }
}

// Function to generate a simple text response based on a prompt
async function generateSimpleTextResponse(promptText, language = 'en-IN') {
    const responsePrompt = `You are an AI assistant giving concise, helpful responses in ${language}.
    User query: "${promptText}"
    Your response (short and to the point, max 30 words):`;

    try {
        const response = await axios.post(OLLAMA_API_URL, {
            model: OLLAMA_MODEL,
            prompt: responsePrompt,
            stream: false,
            options: {
                temperature: 0.7, // Higher temperature for more creative response
            }
        });
        return response.data.response.trim();
    } catch (error) {
        console.error('Error generating simple text response with Ollama:', error.message);
        return "क्षमा करें, मुझे जवाब देने में समस्या हुई।";
    }
}

module.exports = {
    classifyUserRequest,
    generateSimpleTextResponse
};