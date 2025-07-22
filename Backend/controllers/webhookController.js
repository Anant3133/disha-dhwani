// controllers/webhookController.js
const { IncomingMentorshipRequestDto } = require('../dtos/mentorshipDto');
const telecomService = require('../services/telecomService'); // For generating final voice response
const aiService = require('../services/aiService'); // For AI classification
const asrService = require('../services/asrService'); // NEW: For ASR transcription

exports.handleIncomingBasicPhoneRequest = async (req, res) => {
    const { Mentee, MentorshipRequest } = req.app.locals.db;
    // Input now expects audioFilePath and phoneNumber, languageCode
    const { phoneNumber, audioFilePath, languageCode = 'en' } = req.body;

    console.log(`[Webhook Controller]: Received basic phone request from ${phoneNumber}. Audio file: "${audioFilePath}"`);

    if (!phoneNumber || !audioFilePath) {
        return res.status(400).json({ message: 'phoneNumber and audioFilePath are required.' });
    }

    let userTranscript = '';
    let aiClassificationResult; // Declare variable here for wider scope

    try {
        // Step 1: Transcribe Audio using Vosk (ASR)
        const userTranscript = await asrService.transcribeAudio(audioFilePath, languageCode);
        console.log(`[Webhook Controller]: User Transcript from ASR: "${userTranscript}"`);
        // Step 2: Use AI Service (Ollama) to classify the transcribed text
        aiClassificationResult = await aiService.classifyUserRequest(userTranscript, languageCode);
        // Ensure necessary fields are populated, even if AI fails classification cleanly
        const { requested_topic, requested_level, language_detected } = aiClassificationResult;

        // Step 3: Find or Create Mentee
        let mentee = await Mentee.findOne({ where: { phone_number: phoneNumber } });
        if (!mentee) {
            mentee = await Mentee.create({
                phone_number: phoneNumber,
                name: null,
                email: null,
                current_learning_interest: requested_topic,
                learning_level: requested_level,
                language_preference: language_detected,
                status: 'active'
            });
        } else {
            await mentee.update({
                current_learning_interest: requested_topic,
                learning_level: requested_level,
                language_preference: language_detected,
                status: 'active'
            });
        }

        // Step 4: Create Mentorship Request
        const newRequest = await MentorshipRequest.create({
            mentee_id: mentee.id,
            requested_topic: requested_topic,
            requested_level: requested_level,
            language_requested: language_detected,
            ai_transcript: userTranscript, // Use transcribed text
            ai_classification: aiClassificationResult,
            request_status: 'pending',
            mentor_notes: `AI Classified: ${requested_topic}, Level: ${requested_level}. User Transcript: "${userTranscript}".`
        });

        console.log(`[Webhook Controller]: New mentorship request created: ${newRequest.id} for ${phoneNumber} - Topic: ${requested_topic}`);

        // Step 5: Generate voice response for the user based on AI classification (text then TTS)
        const responseMessage = `नमस्ते! आपने ${requested_topic.replace(':', ' - ')} के बारे में पूछा है, स्तर ${requested_level} है। हम एक उपयुक्त मेंटर ढूंढ रहे हैं। कृपया प्रतीक्षा करें।`;
        const twimlResponse = await telecomService.generateVoiceResponse(responseMessage, language_detected);

        res.type('text/xml').send(twimlResponse);

    } catch (error) {
        console.error('Error in webhookController.handleIncomingBasicPhoneRequest:', error);
        // Ensure languageCode is available for fallback
        const detectedLang = aiClassificationResult?.language_detected || languageCode || 'en-IN';
        const fallbackMessage = "क्षमा करें, आपके अनुरोध को संसाधित करने में हमें समस्या हुई। कृपया बाद में पुनः प्रयास करें।";
        const fallbackVoiceResponse = await telecomService.generateVoiceResponse(fallbackMessage, detectedLang);
        res.type('text/xml').status(500).send(fallbackVoiceResponse);
    }
};