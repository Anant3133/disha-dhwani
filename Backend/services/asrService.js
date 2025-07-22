// services/asrService.js
const axios = require('axios');

const VOSK_SERVER_URL = process.env.VOSK_SERVER_URL || 'http://localhost:5001/transcribe';

async function transcribeAudio(audioFilePath, language = 'en') {
  try {
    if (!audioFilePath) {
      throw new Error('Audio file path is required.');
    }

    // Send JSON with audioFilePath and languageCode
    const response = await axios.post(
      VOSK_SERVER_URL,
      {
        audioFilePath,
        languageCode: language,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // optional timeout in ms
      }
    );

    console.log('[ASR Service]: Vosk response:', response.data);
    return response.data.transcript || response.data.transcription || '';

  } catch (error) {
    console.error('Error during ASR transcription (Vosk):', error.message);
    if (error.response) {
      console.error('Vosk server error status:', error.response.status);
      console.error('Vosk server error data:', error.response.data);
    }
    throw new Error(`ASR transcription failed: ${error.message}`);
  }
}

module.exports = { transcribeAudio };
