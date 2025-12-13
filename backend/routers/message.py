from fastapi import APIRouter, Form
from typing import Optional
from schemas.message import MessageResponse
from services.messages_service import save_message, get_chat_history, get_session_messages

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get("/history/{user_id}", response_model=list[MessageResponse])
async def history(user_id: str, session_id: Optional[str] = None):
    history = await get_chat_history(user_id, session_id)
    return [
        MessageResponse(
            id=str(m.id),
            user_id=m.user_id,
            sender=m.sender,
            message=m.message,
            session_id=m.session_id,
            timestamp=m.timestamp
        )
        for m in history
    ]

@router.get("/session/{session_id}", response_model=list[MessageResponse])
async def session_messages(session_id: str):
    """Get all messages for a specific session."""
    history = await get_session_messages(session_id)
    return [
        MessageResponse(
            id=str(m.id),
            user_id=m.user_id,
            sender=m.sender,
            message=m.message,
            session_id=m.session_id,
            timestamp=m.timestamp
        )
        for m in history
    ]

@router.post("/save", response_model=MessageResponse)
async def save_msg(
    user_id: str = Form(...),
    sender: str = Form(...),
    message: str = Form(...),
    session_id: Optional[str] = Form(None)
):
    msg = await save_message(user_id, sender, message, session_id)
    return MessageResponse(
        id=str(msg.id),
        user_id=msg.user_id,
        sender=msg.sender,
        message=msg.message,
        session_id=msg.session_id,
        timestamp=msg.timestamp
    )
