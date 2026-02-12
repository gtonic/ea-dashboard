from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.database import get_db
from app.models.user import User
from app.services.auth_service import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.schemas.user import (
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    AccessTokenResponse,
    UserRead,
    ProfileUpdate,
)
from app.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )
    user.last_login = datetime.now(timezone.utc)
    db.commit()

    token_data = {"sub": user.id, "email": user.email, "role": user.role}
    return TokenResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
    )


@router.post("/refresh", response_model=AccessTokenResponse)
def refresh_token(data: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )
    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    token_data = {"sub": user.id, "email": user.email, "role": user.role}
    return AccessTokenResponse(access_token=create_access_token(token_data))


@router.get("/me", response_model=UserRead)
def get_me(user: User = Depends(get_current_user)):
    return user


@router.put("/me", response_model=UserRead)
def update_me(
    data: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.name is not None:
        user.name = data.name
    if data.password is not None:
        from app.services.auth_service import hash_password
        user.password_hash = hash_password(data.password)
    db.commit()
    db.refresh(user)
    return user
