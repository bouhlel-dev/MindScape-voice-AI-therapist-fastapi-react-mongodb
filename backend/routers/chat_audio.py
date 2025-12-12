from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse
import whisper
from services.messages_service import save_message
from services.ai_service import get_gemini_response, generate_speech

router = APIRouter(prefix="/chat", tags=["Audio"])

model = whisper.load_model("tiny")

@router.post("/audio")
async def chat_audio(user_id: str = Form(...), file: UploadFile = File(...)):
    audio_path = "input.wav"
    with open(audio_path, "wb") as f:
        f.write(await file.read())

    result = model.transcribe(audio_path)
    user_input = result["text"].strip()

    if not user_input:
        return JSONResponse({"error": "No speech detected"}, 400)

    await save_message(user_id, "user", user_input)

    ai_response = get_gemini_response(user_input)
    await save_message(user_id, "assistant", ai_response)  # Changed from "ai"

    audio_output = await generate_speech(ai_response)

    # Extract only filename
    filename = audio_output.split("/")[-1]

    return {
        "message": user_input,
        "response": ai_response,
        "audio_url": f"http://127.0.0.1:8000/{filename}"
    }