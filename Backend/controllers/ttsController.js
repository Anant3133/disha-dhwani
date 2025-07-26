const { generateSpeech } = require('../services/ttsService');

async function generateSpeechController(req, res) {
  const { text, language } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for TTS generation' });
  }

  try {
    const audioPath = await generateSpeech(text, language);
    res.json({ audioPath });
  } catch (error) {
    console.error('[TTS Controller Error]:', error);
    res.status(500).json({ error: 'Failed to generate speech' });
  }
}

module.exports = { generateSpeechController };
