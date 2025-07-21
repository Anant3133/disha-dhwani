// routes/mentor.js
const express = require('express');
const mentorController = require('../controllers/mentorController');
const { verifyToken, isMentor } = require('../middleware/auth');
const router = express.Router();

router.get('/requests/pending', verifyToken, isMentor, mentorController.getPendingRequests);
router.post('/requests/:id/assign', verifyToken, isMentor, mentorController.assignRequest);
router.post('/requests/:id/complete', verifyToken, isMentor, mentorController.completeRequest);
router.post('/initiate-mentee-call', verifyToken, isMentor, mentorController.initiateMenteeCall);

module.exports = router;