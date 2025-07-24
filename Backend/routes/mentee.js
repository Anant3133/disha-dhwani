// routes/mentee.js
const express = require('express');
const menteeController = require('../controllers/menteeController');
const { verifyToken, isMentee } = require('../middleware/auth');
const router = express.Router();

// Get all mentees (admin only or you can decide roles that can access)
router.get('/', verifyToken, isMentee, menteeController.getAllMentees);

// Get mentee by ID (mentee or admin)
router.get('/:id', verifyToken, isMentee, menteeController.getMenteeById);

// Update mentee details (mentee themselves or admin)
router.put('/:id', verifyToken, isMentee, menteeController.updateMentee);

// Delete mentee (admin only, but here for example, protect accordingly)
router.delete('/:id', verifyToken, isMentee, menteeController.deleteMentee);

module.exports = router;
