from pydantic import BaseModel
from typing import Optional


class SessionCreate(BaseModel):
    user_id: str
    title: Optional[str] = "New Session"


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    is_active: Optional[bool] = None


class SessionResponse(BaseModel):
    id: str
    user_id: str
    title: str
    created_at: str
    updated_at: str
    is_active: bool
