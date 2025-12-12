from datetime import datetime
from typing import List
from bson import ObjectId

from models.message import MessageInDB
from database import get_database


def get_collection():
    """Safely get the MongoDB messages collection after startup."""
    db = get_database()
    return db["messages"]


async def save_message(user_id: str, sender: str, message: str) -> MessageInDB:
    col = get_collection()

    doc = {
        "user_id": user_id,
        "sender": sender,
        "message": message,
        "timestamp": datetime.utcnow(),  # Store as datetime object, not string
    }

    res = await col.insert_one(doc)
    created = await col.find_one({"_id": res.inserted_id})

    created["id"] = str(created["_id"])
    created["timestamp"] = created["timestamp"].isoformat()  # Convert to string for response
    return MessageInDB(**created)


async def get_chat_history(user_id: str) -> List[MessageInDB]:
    col = get_collection()

    msgs = []
    cursor = col.find({"user_id": user_id}).sort("timestamp", 1)

    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc["timestamp"] = doc["timestamp"].isoformat()  # Convert to string for response
        msgs.append(MessageInDB(**doc))

    return msgs