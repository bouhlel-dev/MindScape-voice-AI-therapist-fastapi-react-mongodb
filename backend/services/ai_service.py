import os
import uuid
import requests
import edge_tts
from datetime import datetime
from gtts import gTTS

# Load Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = (f"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key={GEMINI_API_KEY}")

async def generate_speech(text: str) -> str:
    # Create uploads directory if it doesn't exist
    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    filename = f"response_{timestamp}_{unique_id}.mp3"
    output_audio = os.path.join(uploads_dir, filename)

    try:
        # options en-US-GuyNeural, en-US-JennyNeural, en-GB-RyanNeural,
        #  en-GB-SoniaNeural, en-AU-NatashaNeural, en-AU-WilliamNeural,
        #  en-IN-NeerjaNeural, en-CA-ClaraNeural, en-CA-LiamNeural, 
        # en-US-AriaNeural, en-US-AnaNeural,
        #  en-US-EricNeural, en-US-JoshNeural, en-US-LibbyNeural
        voice = "en-GB-RyanNeural"
        communicate = edge_tts.Communicate(
            text, 
            voice,
            rate="+10%",
            pitch="-0Hz"
        )
        await communicate.save(output_audio)
        return output_audio
    except Exception as e:
        print(f"Edge TTS failed: {e}, falling back to gTTS")
        tts = gTTS(text=text, lang="en", slow=False)
        tts.save(output_audio)
        return output_audio


def get_gemini_response(user_input: str) -> str:
    payload = {
        "contents": [{"parts": [{"text": f"Be a friendly therapist, no emojis: {user_input}"}]}],
        "generationConfig": {"maxOutputTokens": 1024}
    }
    headers = {"Content-Type": "application/json"}

    res = requests.post(GEMINI_API_URL, json=payload, headers=headers)

    if res.status_code != 200:
        return "Connection error."

    try:
        return res.json()["candidates"][0]["content"]["parts"][0]["text"]
    except:
        return "Error generating response"