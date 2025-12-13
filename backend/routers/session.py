from fastapi import APIRouter, HTTPException, status, Body
from typing import List, Optional
from pydantic import BaseModel
from schemas.session import SessionCreate, SessionResponse, SessionUpdate
from services.sessions_service import (
    create_session,
    get_user_sessions,
    get_session_by_id,
    update_session,
    delete_session,
)

router = APIRouter(prefix="/sessions", tags=["Sessions"])


class CreateSessionRequest(BaseModel):
    user_id: str
    title: str = "New Session"


class UpdateSessionRequest(BaseModel):
    title: Optional[str] = None
    is_active: Optional[bool] = None


@router.post("/", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session_endpoint(request: CreateSessionRequest):
    """Create a new therapy session."""
    session = await create_session(request.user_id, request.title)
    return SessionResponse(
        id=str(session.id),
        user_id=session.user_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        is_active=session.is_active,
    )


@router.get("/user/{user_id}", response_model=List[SessionResponse])
async def get_user_sessions_endpoint(user_id: str):
    """Get all sessions for a user."""
    sessions = await get_user_sessions(user_id)
    return [
        SessionResponse(
            id=str(s.id),
            user_id=s.user_id,
            title=s.title,
            created_at=s.created_at,
            updated_at=s.updated_at,
            is_active=s.is_active,
        )
        for s in sessions
    ]


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session_endpoint(session_id: str):
    """Get a specific session by ID."""
    session = await get_session_by_id(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(
        id=str(session.id),
        user_id=session.user_id,
        title=session.title,
        created_at=session.created_at,
        updated_at=session.updated_at,
        is_active=session.is_active,
    )


@router.put("/{session_id}", response_model=SessionResponse)
async def update_session_endpoint(
    session_id: str,
    request: UpdateSessionRequest
):
    """Update a session's title or status."""
    update_data = {}
    if request.title is not None:
        update_data["title"] = request.title
    if request.is_active is not None:
        update_data["is_active"] = request.is_active

    if not update_data:
        raise HTTPException(status_code=400, detail="No update data provided")

    updated = await update_session(session_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Session not found")

    return SessionResponse(
        id=str(updated.id),
        user_id=updated.user_id,
        title=updated.title,
        created_at=updated.created_at,
        updated_at=updated.updated_at,
        is_active=updated.is_active,
    )


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session_endpoint(session_id: str):
    """Delete a session."""
    ok = await delete_session(session_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Session not found")
    return None
