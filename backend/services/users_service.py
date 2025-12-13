from typing import List, Optional
from bson import ObjectId

from models.user import UserInDB
from database import get_database


def get_collection():
    """Get the MongoDB users collection safely after startup."""
    db = get_database()
    return db["users"]


async def get_all_users() -> List[UserInDB]:
    col = get_collection()
    users = []
    cursor = col.find()
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        users.append(UserInDB(**doc))
    return users


async def create_user(user_data: dict) -> UserInDB:
    col = get_collection()
    res = await col.insert_one(user_data)
    created = await col.find_one({"_id": res.inserted_id})
    created["id"] = str(created["_id"])
    return UserInDB(**created)


async def get_user_by_id(user_id: str) -> Optional[UserInDB]:
    col = get_collection()

    if not ObjectId.is_valid(user_id):
        return None

    doc = await col.find_one({"_id": ObjectId(user_id)})
    if not doc:
        return None

    doc["id"] = str(doc["_id"])
    return UserInDB(**doc)


async def delete_user(user_id: str) -> bool:
    col = get_collection()

    if not ObjectId.is_valid(user_id):
        return False

    res = await col.delete_one({"_id": ObjectId(user_id)})
    return res.deleted_count == 1


async def update_user(user_id: str, update_data: dict) -> Optional[UserInDB]:
    col = get_collection()

    if not ObjectId.is_valid(user_id):
        return None

    await col.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    doc = await col.find_one({"_id": ObjectId(user_id)})

    if not doc:
        return None

    doc["id"] = str(doc["_id"])
    return UserInDB(**doc)


async def get_user_by_email(email: str) -> Optional[UserInDB]:
    col = get_collection()
    doc = await col.find_one({"email": email})
    if not doc:
        return None
    doc["id"] = str(doc["_id"])
    return UserInDB(**doc)


async def authenticate_user(email: str, password: str) -> Optional[UserInDB]:
    user = await get_user_by_email(email)
    if not user:
        return None
    if user.password != password:
        return None
    return user
