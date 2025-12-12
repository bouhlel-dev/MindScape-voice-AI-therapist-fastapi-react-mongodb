from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse
from services.messages_service import save_message
from services.ai_service import get_gemini_response, generate_speech

router = APIRouter(prefix="/chat", tags=["Text"])

@router.post("/text")
async def chat_text(user_id: str = Form(...), input_text: str = Form(...)):
    input_text = input_text.strip()

    if not input_text:
        return JSONResponse({"error": "Empty message"}, 400)

    await save_message(user_id, "user", input_text)

    ai_response = get_gemini_response(input_text)
    await save_message(user_id, "assistant", ai_response)  # Changed from "ai"

    audio_output = await generate_speech(ai_response)
    
     # Extract only filename
    filename = audio_output.split("/")[-1]

    return {
        "message": input_text,
        "response": ai_response,
        "audio_url": f"http://127.0.0.1:8000/{filename}"
    }