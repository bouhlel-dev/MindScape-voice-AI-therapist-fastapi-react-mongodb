from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from models.session import SessionInDB
from database import get_database


def get_collection():
    """Safely get the MongoDB sessions collection after startup."""
    db = get_database()
    return db["sessions"]


async def create_session(user_id: str, title: str = "New Session") -> SessionInDB:
    col = get_collection()
    now = datetime.utcnow()

    doc = {
        "user_id": user_id,
        "title": title,
        "created_at": now,
        "updated_at": now,
        "is_active": True,
    }

    res = await col.insert_one(doc)
    created = await col.find_one({"_id": res.inserted_id})

    created["id"] = str(created["_id"])
    created["created_at"] = created["created_at"].isoformat()
    created["updated_at"] = created["updated_at"].isoformat()
    return SessionInDB(**created)


async def get_user_sessions(user_id: str) -> List[SessionInDB]:
    col = get_collection()

    sessions = []
    cursor = col.find({"user_id": user_id}).sort("updated_at", -1)

    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc["created_at"] = doc["created_at"].isoformat()
        doc["updated_at"] = doc["updated_at"].isoformat()
        sessions.append(SessionInDB(**doc))

    return sessions


async def get_session_by_id(session_id: str) -> Optional[SessionInDB]:
    col = get_collection()

    if not ObjectId.is_valid(session_id):
        return None

    doc = await col.find_one({"_id": ObjectId(session_id)})
    if not doc:
        return None

    doc["id"] = str(doc["_id"])
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    return SessionInDB(**doc)


async def update_session(session_id: str, update_data: dict) -> Optional[SessionInDB]:
    col = get_collection()

    if not ObjectId.is_valid(session_id):
        return None

    update_data["updated_at"] = datetime.utcnow()
    
    res = await col.update_one(
        {"_id": ObjectId(session_id)},
        {"$set": update_data}
    )

    if res.modified_count == 0:
        return None

    return await get_session_by_id(session_id)


async def delete_session(session_id: str) -> bool:
    col = get_collection()

    if not ObjectId.is_valid(session_id):
        return False

    res = await col.delete_one({"_id": ObjectId(session_id)})
    return res.deleted_count == 1


async def update_session_title_from_message(session_id: str, message: str) -> Optional[SessionInDB]:
    """Update session title based on first message (max 50 chars)."""
    col = get_collection()

    if not ObjectId.is_valid(session_id):
        return None

    # Get session to check if title is still default
    session = await get_session_by_id(session_id)
    if not session or session.title != "New Session":
        return session

    # Create title from message (first 50 chars)
    title = message[:50] + "..." if len(message) > 50 else message
    
    return await update_session(session_id, {"title": title})
