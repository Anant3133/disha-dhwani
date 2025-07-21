// dtos/mentorshipDto.js

/**
 * @class IncomingMentorshipRequestDto
 * @description DTO for incoming webhook data (e.g., from AI/Telecom) representing a mentee's request.
 */
class IncomingMentorshipRequestDto {
    constructor(phoneNumber, requestedTopic, requestedLevel, languageRequested, aiTranscript, aiClassification) {
        this.phone_number = phoneNumber;
        this.requested_topic = requestedTopic;
        this.requested_level = requestedLevel;
        this.language_requested = languageRequested;
        this.ai_transcript = aiTranscript;
        this.ai_classification = aiClassification;
    }
}

/**
 * @class MentorshipRequestResponseDto
 * @description DTO for outgoing mentorship request data to be sent to clients (e.g., mentor dashboard).
 */
class MentorshipRequestResponseDto {
    constructor(request) {
        this.id = request.id;
        this.menteePhoneNumber = request.mentee ? request.mentee.phone_number : null;
        this.menteeLanguagePreference = request.mentee ? request.mentee.language_preference : null;
        this.requestedTopic = request.requested_topic;
        this.requestedLevel = request.requested_level;
        this.languageRequested = request.language_requested;
        this.requestStatus = request.request_status;
        this.createdAt = request.requested_at; // Using requested_at for consistency with model
        this.assignedAt = request.assigned_at;
        this.completedAt = request.completed_at;
        this.aiTranscript = request.ai_transcript;
        this.aiClassification = request.ai_classification;
        this.mentorNotes = request.mentor_notes;
        this.assignedMentorId = request.assigned_mentor_id;
        this.assignedMentorName = request.assignedMentor ? request.assignedMentor.name : null; // Include mentor name
        this.assignedMentorEmail = request.assignedMentor ? request.assignedMentor.email : null; // Include mentor email
    }
}

/**
 * @class MenteeResponseDto
 * @description DTO for outgoing mentee data.
 */
class MenteeResponseDto {
    constructor(mentee) {
        this.id = mentee.id;
        this.phoneNumber = mentee.phone_number;
        this.currentLearningInterest = mentee.current_learning_interest;
        this.learningLevel = mentee.learning_level;
        this.languagePreference = mentee.language_preference;
        this.status = mentee.status;
        this.createdAt = mentee.created_at;
    }
}

/**
 * @class MentorResponseDto
 * @description DTO for outgoing mentor data.
 */
class MentorResponseDto {
    constructor(mentor) {
        this.id = mentor.id;
        this.name = mentor.name;
        this.email = mentor.email;
        this.contactNumber = mentor.contact_number;
        this.expertiseAreas = mentor.expertise_areas;
        this.isAdmin = mentor.is_admin;
        this.status = mentor.status;
        this.createdAt = mentor.created_at;
        this.lastLogin = mentor.last_login;
    }
}


module.exports = {
    IncomingMentorshipRequestDto,
    MentorshipRequestResponseDto,
    MenteeResponseDto,
    MentorResponseDto
};