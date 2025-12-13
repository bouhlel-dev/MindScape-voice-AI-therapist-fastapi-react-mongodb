from datetime import datetime
from typing import List
from bson import ObjectId

from models.message import MessageInDB
from database import get_database


def get_collection():
    """Safely get the MongoDB messages collection after startup."""
    db = get_database()
    return db["messages"]


async def save_message(user_id: str, sender: str, message: str, session_id: str = None) -> MessageInDB:
    col = get_collection()

    doc = {
        "user_id": user_id,
        "sender": sender,
        "message": message,
        "session_id": session_id,
        "timestamp": datetime.utcnow(),
    }

    res = await col.insert_one(doc)
    created = await col.find_one({"_id": res.inserted_id})

    created["id"] = str(created["_id"])
    created["timestamp"] = created["timestamp"].isoformat()
    return MessageInDB(**created)


async def get_chat_history(user_id: str, session_id: str = None) -> List[MessageInDB]:
    col = get_collection()

    query = {"user_id": user_id}
    if session_id:
        query["session_id"] = session_id

    msgs = []
    cursor = col.find(query).sort("timestamp", 1)

    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc["timestamp"] = doc["timestamp"].isoformat()
        msgs.append(MessageInDB(**doc))

    return msgs


async def get_session_messages(session_id: str) -> List[MessageInDB]:
    """Get all messages for a specific session."""
    col = get_collection()

    msgs = []
    cursor = col.find({"session_id": session_id}).sort("timestamp", 1)

    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc["timestamp"] = doc["timestamp"].isoformat()
        msgs.append(MessageInDB(**doc))

    return msgs


async def delete_session_messages(session_id: str) -> int:
    """Delete all messages for a session."""
    col = get_collection()
    result = await col.delete_many({"session_id": session_id})
    return result.deleted_count