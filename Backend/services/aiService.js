// services/aiService.js
const axios = require('axios'); // npm install axios

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma:2b'; // or 'gemma:2b' if using that

// Classify user's request (from rural India) into topic and level
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
            prompt,
            stream: false,
            options: {
                temperature: 0.1
            }
        });

        const rawText = response.data.response;
        console.log("Ollama Raw Response:", rawText);
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : {
            requested_topic: 'General_Inquiry',
            requested_level: 'unknown',
            language_detected: language
        };
    } catch (error) {
        console.error('Error calling Ollama API:', error.message);
        return {
            requested_topic: 'General_Inquiry',
            requested_level: 'unknown',
            language_detected: language
        };
    }
}

// Generate short response from AI
async function generateSimpleTextResponse(promptText, language = 'en-IN') {
    const prompt = `You are an AI assistant giving concise, helpful responses in ${language}.
User query: "${promptText}"
Your response (short and to the point, max 30 words):`;

    try {
        const response = await axios.post(OLLAMA_API_URL, {
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            options: {
                temperature: 0.7
            }
        });

        return response.data.response.trim();
    } catch (error) {
        console.error('Error generating simple text response with Ollama:', error.message);
        return "क्षमा करें, मुझे जवाब देने में समस्या हुई।";
    }
}

// Generate 5 MCQs based on input content
async function generateMCQs(inputText) {
    const prompt = `You are an expert question-setter. Based on the input text, generate 5 MCQs. Each MCQ should have:
- a question,
- 4 options (A–D),
- the correct answer key (A/B/C/D),
- and a short explanation.

Respond strictly in this JSON format:
[
  {
    "question": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "B",
    "explanation": "Because ..."
  },
  ...
]
Text:
${inputText}`;

    try {
        const response = await axios.post(OLLAMA_API_URL, {
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            options: {
                temperature: 0.2
            }
        });

        const raw = response.data.response;
        const match = raw.match(/\[\s*{[\s\S]*?}\s*]/); // Capture the array of MCQs
        if (match) {
            return JSON.parse(match[0]);
        } else {
            throw new Error('Invalid MCQ format from LLM');
        }
    } catch (err) {
        console.error('Error generating MCQs:', err.message);
        return [];
    }
}

const onboardingPrompts = {
    'en': [
        {
            id: 'language_preference',
            question: "First, in which language would you like to continue?",
            options: [
                { key: 'en', label: 'English' },
                { key: 'hi', label: 'हिन्दी (Hindi)' },
                { key: 'te', label: 'తెలుగు (Telugu)' },
            ]
        },
        {
            id: 'current_learning_interest',
            question: "What topic are you interested in learning about?",
            options: [
                { key: 'Agriculture', label: 'Agriculture (खेती)' },
                { key: 'Literacy', label: 'Reading & Writing (पढ़ाई-लिखाई)' },
                { key: 'Health', label: 'Health & Hygiene (स्वास्थ्य)' },
                { key: 'Vocational', label: 'Job Skills (कामकाज)' }
            ]
        },
        {
            id: 'learning_level',
            question: "How would you describe your current skill level in this topic?",
            options: [
                { key: 'Beginner', label: 'I am a Beginner (शुरुआती)' },
                { key: 'Amateur', label: 'I have some knowledge (जानकार)' },
                { key: 'Pro', label: 'I am an expert (माहिर)' }
            ]
        }
    ],
    'hi': [
        {
            id: 'language_preference',
            question: "सबसे पहले, आप किस भाषा में आगे बढ़ना चाहेंगे?",
            options: [
                { key: 'en', label: 'English (अंग्रेज़ी)' },
                { key: 'hi', label: 'हिन्दी' },
                { key: 'te', label: 'తెలుగు (तेलुगु)' },
            ]
        },
        {
            id: 'current_learning_interest',
            question: "आप किस विषय के बारे में सीखने में रुचि रखते हैं?",
            options: [
                { key: 'Agriculture', label: 'खेती (Agriculture)' },
                { key: 'Literacy', label: 'पढ़ाई-लिखाई (Reading & Writing)' },
                { key: 'Health', label: 'स्वास्थ्य (Health & Hygiene)' },
                { key: 'Vocational', label: 'कामकाज (Job Skills)' }
            ]
        },
        {
            id: 'learning_level',
            question: "इस विषय में आप अपने कौशल स्तर का वर्णन कैसे करेंगे?",
            options: [
                { key: 'Beginner', label: 'मैं शुरुआती हूँ (Beginner)' },
                { key: 'Amateur', label: 'मुझे कुछ ज्ञान है (Amateur)' },
                { key: 'Pro', label: 'मैं माहिर हूँ (Pro)' }
            ]
        }
    ],
    'te': [
        {
            id: 'language_preference',
            question: "మొదట, మీరు ఏ భాషలో కొనసాగాలనుకుంటున్నారు?",
            options: [
                { key: 'en', label: 'English (ఆంగ్లము)' },
                { key: 'hi', label: 'हिन्दी (హిందీ)' },
                { key: 'te', label: 'తెలుగు' },
            ]
        },
        {
            id: 'current_learning_interest',
            question: "మీరు ఏ అంశం గురించి తెలుసుకోవడానికి ఆసక్తిగా ఉన్నారు?",
            options: [
                { key: 'Agriculture', label: 'వ్యవసాయం (Agriculture)' },
                { key: 'Literacy', label: 'చదవడం & రాయడం (Reading & Writing)' },
                { key: 'Health', label: 'ఆరోగ్యం (Health & Hygiene)' },
                { key: 'Vocational', label: 'ఉద్యోగ నైపుణ్యాలు (Job Skills)' }
            ]
        },
        {
            id: 'learning_level',
            question: "ఈ అంశంలో మీ ప్రస్తుత నైపుణ్యం స్థాయిని మీరు ఎలా వివరిస్తారు?",
            options: [
                { key: 'Beginner', label: 'నేను ప్రారంభకుడిని (Beginner)' },
                { key: 'Amateur', label: 'నాకు కొంత పరిజ్ఞానం ఉంది (Amateur)' },
                { key: 'Pro', label: 'నేను నిపుణుడిని (Pro)' }
            ]
        }
    ]
};

/**
 * Retrieves the static list of onboarding questions for a given language.
 * @param {string} languageCode - The language code ('en', 'hi', 'te').
 * @returns {Promise<Array>} A promise that resolves to the array of prompt objects.
 */
async function getOnboardingPrompts(languageCode = 'en') {
    return onboardingPrompts[languageCode] || onboardingPrompts['en'];
}

// NEW: Generate onboarding MCQs with fixed options for mentee bucketing
async function generateOnboardingMCQs(languageCode = 'en') {
    const prompt = `
You are an AI assistant that generates exactly 3 multiple-choice questions to onboard a user requesting mentorship in rural India. Questions must have fixed, predefined options (no free text) so the answers can be directly used for classification.

Questions:
1) Select your preferred topic from the following options (use exactly these keys):
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

2) Select your current learning level:
- beginner
- intermediate
- advanced
- unknown

3) Select your preferred language:
- en-IN
- hi-IN
- te-IN
- other

Respond ONLY in this strict JSON array format:
[
  {
    "question": "Your question text here",
    "options": [
      {"key": "option_key_here", "label": "Option display text here"},
      ...
    ]
  },
  ...
]
Language: ${languageCode}
    `;

    try {
        const response = await axios.post(OLLAMA_API_URL, {
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            options: {
                temperature: 0
            }
        });

        const raw = response.data.response;
        const match = raw.match(/\[\s*{[\s\S]*?}\s*]/);
        if (match) {
            return JSON.parse(match[0]);
        }
        throw new Error('Invalid format for onboarding MCQs');
    } catch (error) {
        console.error('Error generating onboarding MCQs:', error);
        return [];
    }
}

module.exports = {
    classifyUserRequest,
    getOnboardingPrompts,
    generateSimpleTextResponse,
    generateMCQs,
    generateOnboardingMCQs
};
