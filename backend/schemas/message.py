from pydantic import BaseModel
from typing import Optional

class MessageCreate(BaseModel):
    user_id: str
    sender: str
    message: str
    session_id: Optional[str] = None

class MessageResponse(BaseModel):
    id: str
    user_id: str
    sender: str
    message: str
    session_id: Optional[str] = None
    timestamp: str

    class Config:
        from_attributes = True
