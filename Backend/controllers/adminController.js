// controllers/adminController.js
const { MenteeResponseDto, MentorResponseDto, MentorshipRequestResponseDto } = require('../dtos/mentorshipDto');

// Get all mentors (for admin dashboard)
exports.getAllMentors = async (req, res) => {
    const { Mentor } = req.app.locals.db; // Access Mentor model
    try {
        const mentors = await Mentor.findAll({
            attributes: ['id', 'name', 'email', 'contact_number', 'expertise_areas', 'status', 'created_at']
        });
        res.json(mentors.map(mentor => new MentorResponseDto(mentor)));
    } catch (error) {
        console.error('Error fetching all mentors (Admin):', error);
        res.status(500).json({ message: 'Server error fetching mentors' });
    }
};

// Get all mentees (for admin dashboard)
exports.getAllMentees = async (req, res) => {
    const { Mentee } = req.app.locals.db; // Access Mentee model
    try {
        const mentees = await Mentee.findAll({
            attributes: ['id', 'name', 'email', 'phone_number', 'current_learning_interest', 'learning_level', 'language_preference', 'status', 'created_at']
        });
        res.json(mentees.map(mentee => new MenteeResponseDto(mentee)));
    } catch (error) {
        console.error('Error fetching all mentees (Admin):', error);
        res.status(500).json({ message: 'Server error fetching mentees' });
    }
};

// Get all mentorship requests (for admin dashboard)
exports.getAllRequests = async (req, res) => {
    const { MentorshipRequest, Mentee, Mentor } = req.app.locals.db; // Access models
    try {
        const requests = await MentorshipRequest.findAll({
            include: [
                { model: Mentee, as: 'mentee', attributes: ['phone_number', 'name', 'language_preference'] },
                { model: Mentor, as: 'assignedMentor', attributes: ['name', 'email', 'contact_number'] }
            ],
            order: [['requested_at', 'DESC']]
        });
        res.json(requests.map(req => new MentorshipRequestResponseDto(req)));
    } catch (error) {
        console.error('Error fetching all requests (Admin):', error);
        res.status(500).json({ message: 'Server error fetching requests' });
    }
};