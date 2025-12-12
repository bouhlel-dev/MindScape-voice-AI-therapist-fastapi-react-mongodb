from fastapi import APIRouter, Form
from schemas.message import MessageResponse
from services.messages_service import save_message, get_chat_history

router = APIRouter(prefix="/messages", tags=["Messages"])

@router.get("/history/{user_id}", response_model=list[MessageResponse])
async def history(user_id: str):
    history = await get_chat_history(user_id)
    return [
        MessageResponse(
            id=str(m.id),
            user_id=m.user_id,
            sender=m.sender,
            message=m.message,
            timestamp=m.timestamp
        )
        for m in history
    ]

@router.post("/save", response_model=MessageResponse)
async def save_msg(
    user_id: str = Form(...),
    sender: str = Form(...),
    message: str = Form(...)
):
    msg = await save_message(user_id, sender, message)
    return MessageResponse(
        id=str(msg.id),
        user_id=msg.user_id,
        sender=msg.sender,
        message=msg.message,
        timestamp=msg.timestamp
    )
