const { exec } = require('child_process');
const path = require('path');

/**
 * Converts input audio to 16kHz, mono WAV format required by Vosk.
 * @param {string} inputPath - Path to the raw audio file
 * @param {string} outputPath - Path to the converted WAV file
 * @returns {Promise<string>} - Resolves with the output file path
 */
const convertToVoskFormat = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -y -i "${inputPath}" -ac 1 -ar 16000 -c:a pcm_s16le "${outputPath}"`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('[FFmpeg Error]:', stderr);
        return reject(stderr);
      }
      console.log('[FFmpeg]: Audio converted successfully:', outputPath);
      resolve(outputPath);
    });
  });
};

module.exports = { convertToVoskFormat };
