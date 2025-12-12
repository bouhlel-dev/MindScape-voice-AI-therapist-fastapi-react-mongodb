from pydantic import BaseModel

class MessageCreate(BaseModel):
    user_id: str
    sender: str
    message: str

class MessageResponse(BaseModel):
    id: str
    user_id: str
    sender: str
    message: str
    timestamp: str

    class Config:
        orm_mode = True
