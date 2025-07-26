// controllers/menteeController.js
const { Mentee } = require('../models');

// Get all mentees (No changes needed)
exports.getAllMentees = async (req, res) => {
    try {
        const mentees = await Mentee.findAll({
            attributes: ['id', 'phone_number', 'current_learning_interest', 'learning_level', 'language_preference', 'status', 'onboarding_status']
        });
        res.json(mentees);
    } catch (error) {
        console.error('Error fetching mentees:', error);
        res.status(500).json({ message: 'Server error fetching mentees' });
    }
};

// Get a single mentee by ID (No changes needed)
exports.getMenteeById = async (req, res) => {
    const { id } = req.params;
    try {
        const mentee = await Mentee.findByPk(id);
        if (!mentee) {
            return res.status(404).json({ message: 'Mentee not found' });
        }
        res.json(mentee);
    } catch (error) {
        console.error('Error fetching mentee:', error);
        res.status(500).json({ message: 'Server error fetching mentee' });
    }
};

// ======================================================================
// ===                UPDATED FUNCTION WITH ONBOARDING LOGIC          ===
// ======================================================================
exports.updateMentee = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    // --- Onboarding Completion Logic ---
    // Check if the update contains the answer to the final question ('learning_level').
    if (Object.prototype.hasOwnProperty.call(updateData, 'learning_level')) {
        // If it does, automatically mark the onboarding as 'Complete'.
        updateData.onboarding_status = 'Complete';
    }

    try {
        const mentee = await Mentee.findByPk(id);
        if (!mentee) {
            return res.status(404).json({ message: 'Mentee not found' });
        }

        // Apply the updates from the request.
        await mentee.update(updateData);

        res.json({ message: 'Mentee updated successfully', mentee });
    } catch (error) {
        console.error('Error updating mentee:', error);
        res.status(500).json({ message: 'Server error updating mentee' });
    }
};

// Delete a mentee by ID (No changes needed)
exports.deleteMentee = async (req, res) => {
    const { id } = req.params;
    try {
        const mentee = await Mentee.findByPk(id);
        if (!mentee) {
            return res.status(404).json({ message: 'Mentee not found' });
        }
        await mentee.destroy();
        res.json({ message: 'Mentee deleted successfully' });
    } catch (error) {
        console.error('Error deleting mentee:', error);
        res.status(500).json({ message: 'Server error deleting mentee' });
    }
};