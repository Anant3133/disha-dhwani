// controllers/mentorController.js
const { MentorshipRequestResponseDto } = require('../dtos/mentorshipDto');

// Get pending mentorship requests for the logged-in mentor
exports.getPendingRequests = async (req, res) => {
    const { MentorshipRequest, Mentee } = req.app.locals.db; // Access models
    const mentorId = req.user.id; // From JWT payload

    try {
        // For MVP, we fetch all pending requests and later filter by expertise
        // In full implementation, complex matching logic would live here or in a service
        const pendingRequests = await MentorshipRequest.findAll({
            where: { request_status: 'pending' },
            include: [{ model: Mentee, as: 'mentee', attributes: ['phone_number', 'name', 'language_preference'] }],
            order: [['requested_at', 'ASC']]
        });

        // Later: Filter by mentor's expertise (req.user.expertise_areas)
        // For now, return all pending requests or a simplified set
        res.json(pendingRequests.map(req => new MentorshipRequestResponseDto(req)));
    } catch (error) {
        console.error('Error fetching pending requests (Mentor):', error);
        res.status(500).json({ message: 'Server error fetching pending requests' });
    }
};

// Mentor assigns themselves to a request
exports.assignRequest = async (req, res) => {
    const requestId = req.params.id;
    const mentorId = req.user.id; // From JWT payload
    const { MentorshipRequest } = req.app.locals.db;

    try {
        const request = await MentorshipRequest.findByPk(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Mentorship request not found' });
        }
        if (request.request_status !== 'pending') {
            return res.status(400).json({ message: 'Request is not pending or already assigned.' });
        }

        await request.update({
            assigned_mentor_id: mentorId,
            request_status: 'assigned',
            assigned_at: new Date()
        });

        res.json({ message: 'Request assigned successfully' });
    } catch (error) {
        console.error('Error assigning request:', error);
        res.status(500).json({ message: 'Server error assigning request' });
    }
};

// Mentor completes a request
exports.completeRequest = async (req, res) => {
    const requestId = req.params.id;
    const mentorId = req.user.id; // From JWT payload
    const { mentor_notes } = req.body; // Mentor can add notes
    const { MentorshipRequest } = req.app.locals.db;

    try {
        const request = await MentorshipRequest.findByPk(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Mentorship request not found' });
        }
        // Ensure the request is assigned to this mentor or they are admin
        if (request.assigned_mentor_id !== mentorId) { // Simplified check for MVP
            return res.status(403).json({ message: 'Unauthorized to complete this request.' });
        }
        if (request.request_status !== 'assigned' && request.request_status !== 'in_progress') {
            return res.status(400).json({ message: 'Request cannot be completed from its current status.' });
        }

        await request.update({
            request_status: 'completed',
            completed_at: new Date(),
            mentor_notes: mentor_notes || request.mentor_notes
        });

        res.json({ message: 'Request completed successfully' });
    } catch (error) {
        console.error('Error completing request:', error);
        res.status(500).json({ message: 'Server error completing request' });
    }
};

// Initiate call to mentee (This will involve telecomService)
exports.initiateMenteeCall = async (req, res) => {
    const { menteePhoneNumber, requestId } = req.body;
    const mentorId = req.user.id; // The mentor initiating the call
    const { MentorshipRequest, Mentor, Mentee } = req.app.locals.db;

    try {
        const mentor = await Mentor.findByPk(mentorId);
        const mentee = await Mentee.findOne({ where: { phone_number: menteePhoneNumber } });
        const request = await MentorshipRequest.findByPk(requestId);

        if (!mentor || !mentee || !request) {
            return res.status(404).json({ message: 'Mentor, Mentee, or Request not found.' });
        }

        // Optional: Ensure mentor is assigned to this request before calling
        if (request.assigned_mentor_id !== mentorId) {
            return res.status(403).json({ message: 'You are not assigned to this request.' });
        }

        // CRITICAL: Call TM2's telecom service. This is a placeholder for your team's actual service call.
        // Assuming telecomService.makeOutgoingCall takes fromNumber, toNumber, and a message/twiml
        const telecomService = require('../services/telecomService');
        const callMessage = `Hello ${mentee.name || ''}, your mentor ${mentor.name} is calling you regarding your request for ${request.requested_topic}.`;
        const callResult = await telecomService.makeOutgoingCall(mentor.contact_number, mentee.phone_number, callMessage);

        if (!callResult.success) {
            return res.status(500).json({ message: 'Failed to initiate call via telecom service.', error: callResult.error });
        }

        // Optionally update request status to 'in_progress' or 'on_call'
        await request.update({ request_status: 'in_progress' });
        res.json({ message: 'Call initiated successfully', callStatus: callResult });

    } catch (error) {
        console.error('Error initiating mentee call:', error);
        res.status(500).json({ message: 'Server error initiating call.' });
    }
};