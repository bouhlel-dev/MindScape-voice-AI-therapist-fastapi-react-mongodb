import os
import time
from typing import Optional
from fastapi import APIRouter, Form, BackgroundTasks
from fastapi.responses import JSONResponse
from services.messages_service import save_message
from services.ai_service import get_gemini_response, generate_speech
from services.sessions_service import update_session_title_from_message

router = APIRouter(prefix="/chat", tags=["Text"])


def delete_file(file_path: str):
    """Delete a file if it exists."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted file: {file_path}")
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")


def estimate_audio_duration(text: str) -> int:
    """
    Estimate audio duration based on text length.
    Average speaking rate is ~150 words per minute (~2.5 words per second).
    """
    word_count = len(text.split())
    duration_seconds = word_count / 2.5
    return int(duration_seconds)


def delete_file_after_playback(file_path: str, text: str, buffer_seconds: int = 30):
    """Delete a file after estimated playback time + buffer."""
    audio_duration = estimate_audio_duration(text)
    total_delay = audio_duration + buffer_seconds
    
    print(f"Audio duration: ~{audio_duration}s, deleting in {total_delay}s")
    time.sleep(total_delay)
    delete_file(file_path)


@router.post("/text")
async def chat_text(
    user_id: str = Form(...), 
    input_text: str = Form(...),
    session_id: Optional[str] = Form(None)
):
    """Text-only chat endpoint - no audio generation."""
    input_text = input_text.strip()

    if not input_text:
        return JSONResponse({"error": "Empty message"}, 400)

    await save_message(user_id, "user", input_text, session_id)

    # Update session title if this is the first message
    if session_id:
        await update_session_title_from_message(session_id, input_text)

    ai_response = get_gemini_response(input_text)
    await save_message(user_id, "assistant", ai_response, session_id)

    return {
        "message": input_text,
        "response": ai_response,
        "session_id": session_id
    }


@router.post("/text-with-audio")
async def chat_text_with_audio(
    background_tasks: BackgroundTasks,
    user_id: str = Form(...), 
    input_text: str = Form(...),
    session_id: Optional[str] = Form(None)
):
    """Text chat endpoint with audio response."""
    input_text = input_text.strip()

    if not input_text:
        return JSONResponse({"error": "Empty message"}, 400)

    await save_message(user_id, "user", input_text, session_id)

    # Update session title if this is the first message
    if session_id:
        await update_session_title_from_message(session_id, input_text)

    ai_response = get_gemini_response(input_text)
    await save_message(user_id, "assistant", ai_response, session_id)

    audio_output = await generate_speech(ai_response)
    
    # Extract only filename
    filename = audio_output.split("/")[-1]

    # Schedule deletion of output audio file after playback completes + 30 seconds buffer
    background_tasks.add_task(delete_file_after_playback, audio_output, ai_response, 30)

    return {
        "message": input_text,
        "response": ai_response,
        "session_id": session_id,
        "audio_url": f"http://127.0.0.1:8000/{filename}"
    }