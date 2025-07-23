// controllers/webhookController.js
const { IncomingMentorshipRequestDto } = require('../dtos/mentorshipDto');
const telecomService = require('../services/telecomService'); // For generating final voice response (mocked)
const aiService = require('../services/aiService'); // For AI classification (Ollama)
const asrService = require('../services/asrService'); // For ASR transcription (Vosk)
const ttsService = require('../services/ttsService'); // NEW: For TTS generation (Coqui AI)

exports.handleIncomingBasicPhoneRequest = async (req, res) => {
    const { Mentee, MentorshipRequest } = req.app.locals.db;
    const { phoneNumber, audioFilePath, languageCode = 'en' } = req.body;

    console.log(`[Webhook Controller]: Received basic phone request from ${phoneNumber}. Audio file: "${audioFilePath}"`);

    if (!phoneNumber || !audioFilePath) {
        return res.status(400).json({ message: 'phoneNumber and audioFilePath are required.' });
    }

    let userTranscript = '';
    let aiClassificationResult;
    let aiResponseText = '';
    let aiResponseAudioPath = ''; // Variable to store the path of the generated audio file

    try {
        // Step 1: Transcribe Audio using Vosk (ASR)
        userTranscript = await asrService.transcribeAudio(audioFilePath, languageCode);
        console.log(`[Webhook Controller]: User Transcript from ASR: "${userTranscript}"`);

        // Step 2: Use AI Service (Ollama LLM) to classify the transcribed text
        aiClassificationResult = await aiService.classifyUserRequest(userTranscript, languageCode);
        const { requested_topic, requested_level, language_detected } = aiClassificationResult;
        aiClassificationResult.ai_transcript = userTranscript;

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

        // Step 5: Generate AI's verbal confirmation response (text first)
        aiResponseText = `नमस्ते! आपने ${requested_topic.replace(':', ' - ')} के बारे में पूछा है, स्तर ${requested_level} है। हम एक उपयुक्त मेंटर ढूंढ रहे हैं। कृपया प्रतीक्षा करें।`;
        console.log(`[Webhook Controller]: AI Response Text: "${aiResponseText}"`);

        // Step 6: Generate Audio from AI's response text (TTS)
        aiResponseAudioPath = await ttsService.generateSpeech(aiResponseText, language_detected);
        console.log(`[Webhook Controller]: AI Response Audio Path: "${aiResponseAudioPath}"`);

        // Step 7: Respond with generated audio path and classification details
        res.json({
            message: 'Request processed, classified, and audio response generated.',
            audio_response_path: aiResponseAudioPath, // Send back the path to the audio file
            ai_response_text: aiResponseText, // Also send the text for debugging/display
            request_id: newRequest.id,
            mentee_id: mentee.id,
            classified_data: aiClassificationResult
        });

    } catch (error) {
        console.error('Error in webhookController.handleIncomingBasicPhoneRequest:', error);
        // Fallback response: If AI classification failed, use languageCode from request body
        const detectedLang = aiClassificationResult?.language_detected || languageCode || 'en-IN';
        const fallbackMessage = "क्षमा करें, आपके अनुरोध को संसाधित करने में हमें समस्या हुई। कृपया बाद में पुनः प्रयास करें।";
        // Attempt to generate fallback voice response text
        const fallbackVoiceResponseText = await aiService.generateSimpleTextResponse(fallbackMessage, detectedLang);
        // Attempt to generate audio for fallback, but if TTS itself caused the error, this might fail too.
        let fallbackAudioPath = '';
        try {
            fallbackAudioPath = await ttsService.generateSpeech(fallbackVoiceResponseText, detectedLang);
        } catch (ttsFallbackError) {
            console.error('TTS fallback audio generation failed:', ttsFallbackError);
            fallbackAudioPath = 'Error generating fallback audio.';
        }

        res.status(500).json({
            message: 'Server error processing request.',
            ai_response_for_user: fallbackVoiceResponseText,
            audio_response_path: fallbackAudioPath,
            error: error.message
        });
    }
};