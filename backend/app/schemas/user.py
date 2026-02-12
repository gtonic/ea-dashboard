from datetime import datetime

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool
    created_at: datetime | None = None
    last_login: datetime | None = None

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    role: str = "viewer"
    is_active: bool = True


class UserUpdate(BaseModel):
    email: str | None = None
    name: str | None = None
    password: str | None = None
    role: str | None = None
    is_active: bool | None = None


class ProfileUpdate(BaseModel):
    name: str | None = None
    password: str | None = None
