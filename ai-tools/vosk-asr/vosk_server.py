import os
from flask import Flask, request, jsonify
from vosk import Model, KaldiRecognizer
import wave
import json

app = Flask(__name__)

# Base directory is the directory of this file (vosk_server.py)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Models folder inside the venv-vosk directory
MODELS_BASE_PATH = os.path.join(BASE_DIR, "venv-vosk", "models")

# Language codes mapped to model folder names inside MODELS_BASE_PATH
LANGUAGE_MODELS = {
    "en": "vosk-model-small-en-in-0.4",
    "hi": "vosk-model-small-hi-0.22",
    "te": "vosk-model-small-te-0.42"
}

# Dictionary to hold loaded Model instances
loaded_models = {}

# Load all models at startup
for lang_code, model_folder in LANGUAGE_MODELS.items():
    model_path = os.path.join(MODELS_BASE_PATH, model_folder)
    if os.path.exists(model_path) and os.path.isdir(model_path):
        try:
            loaded_models[lang_code] = Model(model_path)
            print(f"[Vosk Server]: Loaded model for language '{lang_code}' from {model_path}")
        except Exception as e:
            print(f"[Vosk Server]: Failed to load model for '{lang_code}': {e}")
    else:
        print(f"[Vosk Server]: Model path not found or invalid for '{lang_code}': {model_path}")

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        data = request.get_json(force=True)
        audio_path = data.get("audioFilePath")
        lang_code = data.get("languageCode", "en").lower()

        print(f"[Vosk Server]: Received transcription request for file '{audio_path}' with language '{lang_code}'")

        if lang_code not in loaded_models:
            return jsonify({"error": f"ASR model not loaded or found for language '{lang_code}'."}), 500

        if not audio_path or not os.path.isfile(audio_path):
            return jsonify({"error": f"Audio file not found or invalid path: {audio_path}"}), 400

        wf = wave.open(audio_path, "rb")

        # Check for mono PCM 16kHz WAV format
        if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
            return jsonify({"error": "Audio file must be WAV mono PCM 16-bit with 16kHz sample rate."}), 400

        recognizer = KaldiRecognizer(loaded_models[lang_code], wf.getframerate())
        recognizer.SetWords(True)

        results = []
        while True:
            data_chunk = wf.readframes(4000)
            if len(data_chunk) == 0:
                break
            if recognizer.AcceptWaveform(data_chunk):
                res = json.loads(recognizer.Result())
                if "text" in res:
                    results.append(res["text"])

        final_res = json.loads(recognizer.FinalResult())
        if "text" in final_res:
            results.append(final_res["text"])

        transcript = " ".join(results).strip()
        print(f"[Vosk Server]: Transcription complete: {transcript}")

        return jsonify({"transcript": transcript})

    except Exception as e:
        print(f"[Vosk Server]: Error during transcription - {str(e)}")
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == "__main__":
    PORT = int(os.environ.get("VOSK_SERVER_PORT", 5001))
    print(f"[Vosk Server]: Starting Vosk ASR server on port {PORT}...")
    app.run(host="0.0.0.0", port=PORT, debug=False)
