import os
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr

from app.services.database import users_collection

router = APIRouter(prefix="/auth", tags=["Authentication"])

password_hasher = PasswordHasher()
JWT_SECRET = os.getenv("JWT_SECRET", "emergency-ai-coordinator-demo-secret")
JWT_ALGORITHM = "HS256"
TOKEN_MINUTES = 8 * 60

ROLES = {
    "government": "Government / Disaster Management",
    "hospital": "Hospital / Medical",
    "police": "Police / Law Enforcement",
    "transport": "Emergency Transport",
    "ngo": "NGO / Relief Organization",
    "citizen": "Citizen / Public",
}


class AuthRequest(BaseModel):
    email: EmailStr
    password: str


class SignupRequest(AuthRequest):
    name: str
    role: str
    organization: str | None = None


def _token(user: dict) -> str:
    payload = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "organization": user.get("organization"),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=TOKEN_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def _public_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "role_label": ROLES.get(user["role"], user["role"]),
        "organization": user.get("organization"),
    }


@router.post("/signup")
def signup(payload: SignupRequest):
    role = payload.role.strip().lower()
    if role not in ROLES:
        raise HTTPException(status_code=400, detail="Invalid organization role.")

    email = payload.email.lower().strip()
    if users_collection.find_one({"email": email}):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = {
        "name": payload.name.strip(),
        "email": email,
        "password_hash": password_hasher.hash(payload.password),
        "role": role,
        "organization": (payload.organization or "").strip() or None,
        "created_at": datetime.now(timezone.utc),
    }
    result = users_collection.insert_one(user)
    user["_id"] = result.inserted_id

    return {"access_token": _token(user), "token_type": "bearer", "user": _public_user(user)}


@router.post("/login")
def login(payload: AuthRequest):
    email = payload.email.lower().strip()
    user = users_collection.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    try:
        password_hasher.verify(user["password_hash"], payload.password)
    except (VerifyMismatchError, Exception):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    return {"access_token": _token(user), "token_type": "bearer", "user": _public_user(user)}
