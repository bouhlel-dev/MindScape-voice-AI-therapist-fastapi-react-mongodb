from fastapi import APIRouter, HTTPException, status
from typing import List
from schemas.user import UserCreate, UserResponse, UserLogin
from services.users_service import (
    get_all_users,
    create_user,
    get_user_by_id,
    delete_user,
    update_user,
    get_user_by_email,
    authenticate_user,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate):
    """Register a new user."""
    # Check if email already exists
    existing = await get_user_by_email(user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    created = await create_user(user.dict())
    return UserResponse(id=str(created.id), name=created.name, email=created.email)


@router.post("/login", response_model=UserResponse)
async def login_user(user: UserLogin):
    """Login a user."""
    authenticated = await authenticate_user(user.email, user.password)
    if not authenticated:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return UserResponse(id=str(authenticated.id), name=authenticated.name, email=authenticated.email)


@router.get("/", response_model=List[UserResponse])
async def list_users():
    users = await get_all_users()
    return [UserResponse(id=str(u.id), name=u.name, email=u.email) for u in users]


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_endpoint(user: UserCreate):
    created = await create_user(user.dict())
    return UserResponse(id=str(created.id), name=created.name, email=created.email)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_endpoint(user_id: str):
    user = await get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(id=str(user.id), name=user.name, email=user.email)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(user_id: str):
    ok = await delete_user(user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="User not found")
    return None


@router.put("/{user_id}", response_model=UserResponse)
async def update_user_endpoint(user_id: str, user: UserCreate):
    updated = await update_user(user_id, user.dict())
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(id=str(updated.id), name=updated.name, email=updated.email)
