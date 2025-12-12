import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routers import user, message, chat_audio, chat_text
from database import connect_to_mongo, close_mongo_connection
from fastapi.staticfiles import StaticFiles



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    print("MongoDB connected ✅")
    
    yield
    
    # Shutdown
    await close_mongo_connection()
    print("MongoDB connection closed ❌")


app = FastAPI(title="AI Therapist", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(user.router)
app.include_router(message.router)
app.include_router(chat_audio.router)
app.include_router(chat_text.router)
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {"message": "AI Therapist API running!"}


