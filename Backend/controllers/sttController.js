const { transcribeAudio } = require('../services/asrService');
const { convertToVoskFormat } = require('../utils/audioUtils');
const fs = require('fs');
const path = require('path');

async function transcribeAudioController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    const originalPath = path.resolve(req.file.path);
    const convertedPath = path.resolve(
      path.dirname(originalPath),
      `converted_${Date.now()}.wav`
    );
    const language = req.body.language || 'en';

    // Convert audio to mono 16kHz WAV for Vosk
    await convertToVoskFormat(originalPath, convertedPath);

    // Transcribe converted audio
    const transcript = await transcribeAudio(convertedPath, language);

    // Cleanup temp files
    fs.unlink(originalPath, (err) => {
      if (err) console.warn('[Cleanup Warning]: Failed to delete original audio:', err);
    });
    fs.unlink(convertedPath, (err) => {
      if (err) console.warn('[Cleanup Warning]: Failed to delete converted audio:', err);
    });

    res.json({ transcript });
  } catch (error) {
    console.error('[STT Controller Error]:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
}

module.exports = { transcribeAudioController };
