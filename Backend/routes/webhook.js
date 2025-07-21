// routes/webhook.js
const express = require('express');
const webhookController = require('../controllers/webhookController');
const router = express.Router();

// This endpoint will be hit by TM2's telecom service AFTER AI has classified the call
// This is where the classified mentee request lands in your main backend.
router.post('/incoming-call-classified', webhookController.handleIncomingCallClassified);

// TM2 might also need a route for the initial webhook from Twilio/Exotel.
// That initial route would call telecomService.handleIncomingCallWebhook().
// For MVP, focus on the /incoming-call-classified endpoint here.

module.exports = router;