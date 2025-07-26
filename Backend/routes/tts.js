const express = require('express');
const { generateSpeechController } = require('../controllers/ttsController');

const router = express.Router();

// POST /api/tts/generate
router.post('/generate', generateSpeechController);

module.exports = router;
