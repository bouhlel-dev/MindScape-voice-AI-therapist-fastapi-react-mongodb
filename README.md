# MindSpace: AI Therapist App

MindSpace is a full-stack AI therapist application featuring a FastAPI backend, React frontend, and MongoDB database. It provides both text and audio chat with session management, authentication, and a modern, minimalistic UI.

---

## Features
- **AI Therapist**: Chat with an AI therapist using text or audio
- **Session Management**: Save and revisit therapy sessions
- **Authentication**: Register and log in with email/password
- **Modern UI**: Minimalistic, floating card design with earthy brown theme
- **Audio Support**: Record and transcribe audio messages (OpenAI Whisper, Edge TTS)
- **Persistent Storage**: MongoDB for users, sessions, and messages

---

## Project Structure

```
backend/
  main.py            # FastAPI entrypoint
  database.py        # MongoDB connection
  models/            # Pydantic models
  schemas/           # Request/response schemas
  routers/           # API endpoints (chat, user, message)
  services/          # Business logic (AI, users, messages)
frontend/
  src/
    pages/           # React pages (Index, Auth)
    components/      # UI components (Sidebar, ChatInput, etc.)
    services/        # API functions
```


    ## System Flow Diagram

    ```mermaid
    graph TD
      A[User] -->|Login/Register| B(Frontend React)
      B -->|API Call| C(FastAPI Backend)
      C -->|Query| D[MongoDB]
      C -->|Text Chat| E[Gemini AI]
      C -->|Audio Chat| F[OpenAI Whisper]
      C -->|Audio Synthesis| G[Edge TTS]
      E -->|AI Response| C
      F -->|Transcription| C
      G -->|Audio Output| C
      C -->|Response| B
      B -->|Display| A

      %% Fallbacks
      E -- fallback: Gemini error --> H[Error Message to User]
      F -- fallback: Whisper error --> H
      G -- fallback: TTS error --> H
      C -- fallback: DB error --> H
    ```

    - **Fallbacks**: If any AI or service fails (Gemini, Whisper, TTS, DB), the backend returns a user-friendly error message to the frontend, which displays it in the chat UI.
## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB Atlas or local MongoDB

### Backend Setup
1. `cd backend`
2. Create a virtual environment: `python -m venv .venv`
3. Activate it:
   - Windows: `.venv\Scripts\activate`
   - Unix: `source .venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Set up environment variables (see `.env.example` if present)
6. Run the server: `uvicorn main:app --reload`

### Frontend Setup
1. `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

---

## Environment Variables
- **Backend**: Set MongoDB URI, AI API keys, etc. in `.env`
- **Frontend**: Configure API base URL if needed

---

## API Endpoints (Backend)
- `POST /register` — Register new user
- `POST /login` — Login user
- `POST /chat/text` — Text chat with AI
- `POST /chat/audio` — Audio chat with AI
- `GET /sessions/{user_id}` — Get user sessions
- `POST /sessions` — Create new session
- `DELETE /sessions/{session_id}` — Delete session

---

## Technologies Used
- **Backend**: FastAPI, Pydantic, Motor (MongoDB), OpenAI Whisper, Edge TTS, Gemini AI
- **Frontend**: React, Vite, TypeScript, TailwindCSS, Shadcn UI
- **Database**: MongoDB Atlas

---

## License
MIT License

---

## Credits
Developed by Ahmed Amine Bouhlel and contributors.
