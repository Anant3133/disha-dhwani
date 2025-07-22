// routes/webhook.js
const express = require('express');
const webhookController = require('../controllers/webhookController');
const router = express.Router();

// This endpoint receives text input from Postman to simulate a basic phone request
router.post('/basic-phone-request', webhookController.handleIncomingBasicPhoneRequest);

module.exports = router;