import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    """Connect to MongoDB Atlas and initialize collections"""
    MONGO_URI = os.getenv("MONGO_URI")
    DB_NAME = os.getenv("DB_NAME", "ai_therapist")

    db.client = AsyncIOMotorClient(MONGO_URI)
    await db.client.admin.command("ping")

    print(f"✅ Connected to MongoDB Atlas - Database: {DB_NAME}")

    await init_collections(db.client[DB_NAME])


async def close_mongo_connection():
    """Close MongoDB connection"""
    if db.client:
        db.client.close()
        print("❌ Closed MongoDB connection")


async def init_collections(database):
    """Initialize collections with schema validation + indexes"""

    existing = await database.list_collection_names()

    # --------------------------
    # USERS COLLECTION
    # --------------------------
    if "users" not in existing:
        users_validator = {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["name", "email"],
                "properties": {
                    "name": {"bsonType": "string"},
                    "email": {"bsonType": "string"},
                }
            }
        }

        await database.create_collection("users", validator=users_validator)
        await database.users.create_index("email", unique=True)

        print("✅ Created 'users' collection with indexes")

    # --------------------------
    # MESSAGES COLLECTION
    # --------------------------
    if "messages" not in existing:
        messages_validator = {
            "$jsonSchema": {
                "bsonType": "object",
                "required": ["user_id", "sender", "message", "timestamp"],
                "properties": {
                    "user_id": {"bsonType": "string"},
                    "sender": {"enum": ["user", "assistant"]},
                    "message": {"bsonType": "string"},
                    "timestamp": {"bsonType": "date"}
                }
            }
        }

        await database.create_collection("messages", validator=messages_validator)
        await database.messages.create_index("user_id")
        await database.messages.create_index([("user_id", 1), ("timestamp", -1)])

        print("✅ Created 'messages' collection with indexes")


def get_database():
    DB_NAME = os.getenv("DB_NAME", "ai_therapist")
    return db.client[DB_NAME]
