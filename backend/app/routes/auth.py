import os
from datetime import datetime, timedelta, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from bson import ObjectId
from fastapi import APIRouter, Depends, Header, HTTPException
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

ROLE_METRICS = {
    "hospital": {"ambulances", "beds", "medical supplies", "patient surge"},
    "police": {"units available", "blocked route", "evacuation status", "open routes"},
    "transport": {"emergency vehicles", "route availability", "dispatch capacity", "fuel readiness"},
    "ngo": {"shelters", "food / water stock", "volunteers", "open requests"},
    "citizen": {"incident report", "shelter status", "local observation"},
}

class ResourceUpdate(BaseModel):
    metric: str
    value: str
    note: str = ""

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
        "resource_updates": user.get("resource_updates", []),
    }

def current_user(authorization: str = Header(default="")) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = ObjectId(payload["sub"])
    except (jwt.PyJWTError, ValueError):
        raise HTTPException(status_code=401, detail="Session expired or invalid.")
    user = users_collection.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=401, detail="Account no longer exists.")
    return user

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
        "resource_updates": [],
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
    except VerifyMismatchError:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {"access_token": _token(user), "token_type": "bearer", "user": _public_user(user)}

@router.get("/me")
def me(user: dict = Depends(current_user)):
    return {"user": _public_user(user)}

@router.post("/resource-update")
def resource_update(update: ResourceUpdate, user: dict = Depends(current_user)):
    metric = update.metric.strip().lower()
    if metric not in ROLE_METRICS.get(user["role"], set()):
        raise HTTPException(status_code=400, detail="Invalid operational metric for this role.")
    entry = {
        "metric": metric,
        "value": update.value.strip(),
        "note": update.note.strip(),
        "role": user["role"],
        "organization": user.get("organization"),
        "updated_at": datetime.now(timezone.utc),
    }
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$push": {"resource_updates": {"$each": [entry], "$slice": -20}}},
    )
    return {"message": "Operational update shared with authorized coordinators.", "update": entry}

@router.get("/operational-feed")
def operational_feed(user: dict = Depends(current_user)):
    if user["role"] != "government":
        raise HTTPException(status_code=403, detail="Only government coordinators can view the operational feed.")

    rows = list(users_collection.find(
        {"resource_updates.0": {"$exists": True}},
        {"name": 1, "role": 1, "organization": 1, "resource_updates": 1},
    ))

    updates = []
    for row in rows:
        for update in row.get("resource_updates", []):
            item = dict(update)
            item["user_name"] = row.get("name")
            item["organization"] = row.get("organization") or ROLES.get(row.get("role"), row.get("role"))
            item["role"] = row.get("role")
            updates.append(item)

    updates.sort(key=lambda item: item.get("updated_at", datetime.min.replace(tzinfo=timezone.utc)), reverse=True)
    return {"updates": updates[:30]}
