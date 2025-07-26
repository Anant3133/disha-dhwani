const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const franc = require('franc');

// Platform-aware Python executable path
const PYTHON_EXECUTABLE_IN_VENV = process.platform === 'win32'
    ? path.resolve(__dirname, '..', '..', 'ai-tools', 'coqui-tts', 'venv-coqui-311', 'Scripts', 'python.exe')
    : path.resolve(__dirname, '..', '..', 'ai-tools', 'coqui-tts', 'venv-coqui-311', 'bin', 'python');

// Paths
const COQUI_TTS_PYTHON_SCRIPT = path.resolve(__dirname, '..', '..', 'ai-tools', 'coqui-tts', 'generate_speech.py');
const OUTPUT_AUDIO_DIR = path.resolve(__dirname, '..', '..', 'ai-tools', 'temp_audio');


async function generateSpeech(text, language = null) {
    // --- FIX: Add a safety check to ensure 'text' is a string ---
    if (typeof text !== 'string') {
        throw new Error('TTS Service Error: Input text must be a string.');
    }

    const outputFileName = `tts_response_${Date.now()}.wav`;
    const outputPath = path.join(OUTPUT_AUDIO_DIR, outputFileName);

    console.log(`[TTS Service Debug]: Attempting to create output directory: ${OUTPUT_AUDIO_DIR}`);
    try {
        await fsp.mkdir(OUTPUT_AUDIO_DIR, { recursive: true });
    } catch (err) {
        console.error(`[TTS Service Error]: Failed to create output directory: ${OUTPUT_AUDIO_DIR}`, err);
        throw err;
    }

    if (!fs.existsSync(PYTHON_EXECUTABLE_IN_VENV)) {
        console.error(`[TTS Service Error]: Python executable not found at ${PYTHON_EXECUTABLE_IN_VENV}.`);
        throw new Error('Python executable for Coqui TTS not found or path is incorrect.');
    }

    let detectedLang = 'en';
    if (!language) {
        try {
            const detected = franc(text);
            if (detected && detected !== 'und') {
                detectedLang = detected;
            } else {
                console.warn('[TTS Service Warning]: Language detection returned "und", defaulting to English.');
            }
        } catch (e) {
            console.warn('[TTS Service Warning]: Language detection failed, defaulting to English.', e);
        }
    } else {
        detectedLang = language;
    }

    const safeText = text.replace(/"/g, '\\"');
    const command = `"${PYTHON_EXECUTABLE_IN_VENV}" "${COQUI_TTS_PYTHON_SCRIPT}" "${safeText}" "${outputPath}" "${detectedLang}"`;

    console.log(`[TTS Service Debug]: Full exec command: ${command}`);

    const execOptions = {
        maxBuffer: 1024 * 1024 * 5,
        env: {
            ...process.env,
            PYTHONIOENCODING: 'utf-8'
        }
    };

    return new Promise((resolve, reject) => {
        exec(command, execOptions, (error, stdout, stderr) => {
            if (error) {
                console.error(`[TTS Service Error]: Coqui TTS exec error: ${error.message}`);
                console.error(`[TTS Service Error]: Coqui TTS stderr: ${stderr}`);
                return reject(new Error(`Coqui TTS generation failed: ${stderr || error.message}`));
            }
            if (stderr) {
                console.warn(`[TTS Service Warning]: Coqui TTS stderr: ${stderr}`);
            }

            console.log(`[TTS Service]: Speech successfully generated to: ${outputPath}`);
            resolve(outputPath);
        });
    });
}

module.exports = { generateSpeech };