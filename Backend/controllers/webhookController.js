// controllers/webhookController.js
const { IncomingMentorshipRequestDto } = require('../dtos/mentorshipDto');
const telecomService = require('../services/telecomService'); // For generating final voice response

// This webhook receives the AI-classified data from the Telecom service (TM2)
// This is the point where classified mentee data enters your main backend DB.
exports.handleIncomingCallClassified = async (req, res) => {
    const { Mentee, MentorshipRequest } = req.app.locals.db;
    const { From: phoneNumber, CallSid, Transcription, AI_Classification, AI_Response_TwiML } = req.body;

    console.log(`[Webhook Controller]: Received classified call data for ${phoneNumber}, Topic: ${AI_Classification.requested_topic}`);

    try {
        // Step 1: Find or Create Mentee
        let mentee = await Mentee.findOne({ where: { phone_number: phoneNumber } });
        if (!mentee) {
            mentee = await Mentee.create({
                phone_number: phoneNumber,
                name: null, // Name is unknown from voice call, will be added later if mentee registers on web
                email: null, // Email is unknown from voice call
                current_learning_interest: AI_Classification.requested_topic,
                learning_level: AI_Classification.requested_level,
                language_preference: AI_Classification.language_detected,
                status: 'active'
            });
        } else {
            // Update existing mentee's AI-derived info if they call again
            await mentee.update({
                current_learning_interest: AI_Classification.requested_topic,
                learning_level: AI_Classification.requested_level,
                language_preference: AI_Classification.language_detected,
                status: 'active'
            });
        }

        // Step 2: Create Mentorship Request
        const newRequest = await MentorshipRequest.create({
            mentee_id: mentee.id,
            requested_topic: AI_Classification.requested_topic,
            requested_level: AI_Classification.requested_level,
            language_requested: AI_Classification.language_detected,
            ai_transcript: Transcription,
            ai_classification: AI_Classification,
            request_status: 'pending' // Initially pending, waiting for a human mentor
        });

        console.log(`[Webhook Controller]: New mentorship request created: ${newRequest.id} for ${phoneNumber}`);

        // Respond to TM2's telecom service with TwiML/ExoML (already provided by AI_Response_TwiML)
        // This is the final voice message to the user before the call might end or wait for mentor.
        res.type('text/xml').send(AI_Response_TwiML);

    } catch (error) {
        console.error('Error in webhookController.handleIncomingCallClassified:', error);
        // Fallback voice response if DB save fails
        const fallbackVoiceResponse = await telecomService.generateSimpleVoiceResponse(
            "क्षमा करें, आपके अनुरोध को संसाधित करने में हमें समस्या हुई। कृपया बाद में पुनः प्रयास करें।", // "Sorry, we had trouble processing your request. Please try again later."
            AI_Classification?.language_detected || 'hi-IN'
        );
        res.type('text/xml').status(500).send(fallbackVoiceResponse);
    }
};