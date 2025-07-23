# generate_speech.py
import os
import sys
from TTS.api import TTS
import traceback

# --- CONFIGURATION (Adjust these paths) ---
DEFAULT_SPEAKER_WAV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "speakers", "default_speaker.wav")

def log_error(message):
    print(f"[Coqui TTS Script ERROR]: {message}", file=sys.stderr)
    sys.exit(1)

def log_debug(message):
    print(f"[Coqui TTS Script DEBUG]: {message}", file=sys.stdout)
log_debug(f"Resolved speaker path: {DEFAULT_SPEAKER_WAV_PATH}")
log_debug(f"Exists? {os.path.exists(DEFAULT_SPEAKER_WAV_PATH)}")
if __name__ == "__main__":
    log_debug("Script started.")
    log_debug(f"Arguments received: {sys.argv}")

    if len(sys.argv) != 4: 
        log_error(f"Incorrect number of arguments. Expected 3, got {len(sys.argv) - 1}. Usage: python generate_speech.py <text> <output_path> <language>")

    text = sys.argv[1]
    output_path = sys.argv[2]
    language = sys.argv[3]

    log_debug(f"Text: '{text}'")
    log_debug(f"Output path: '{output_path}'")
    log_debug(f"Language: '{language}'")

    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        log_debug(f"Output directory ensured: {os.path.dirname(output_path)}")
    except Exception as e:
        log_error(f"Failed to create output directory: {e}")

    try:
        log_debug(f"Checking speaker WAV path: {DEFAULT_SPEAKER_WAV_PATH}")
        if not os.path.exists(DEFAULT_SPEAKER_WAV_PATH):
            log_error(f"Default speaker WAV file not found at {DEFAULT_SPEAKER_WAV_PATH}. Please ensure it exists.")

        log_debug("Initializing TTS model (this might take time on first load)...")
        tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2").to("cpu")
        log_debug("TTS model initialized successfully.")

        log_debug(f"Generating speech for text: '{text[:50]}...' (first 50 chars)")
        tts.tts_to_file(
           text=text,
           speaker_wav=DEFAULT_SPEAKER_WAV_PATH,
           language=language,
           file_path=output_path
        )
        print(f"Speech successfully generated to {output_path}", file=sys.stdout)

    except Exception as e:
        log_error(f"Error during speech generation: {e}\n{traceback.format_exc()}") 