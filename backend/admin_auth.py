import asyncio
import os
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import HTTPException, Request
from jose import JWTError, jwt

ADMIN_JWT_SECRET = os.getenv("ADMIN_JWT_SECRET", "change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7


def hash_password_sync(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


async def hash_password(password: str) -> str:
    return await asyncio.to_thread(hash_password_sync, password)


def verify_password_sync(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


async def verify_password(plain: str, hashed: str) -> bool:
    return await asyncio.to_thread(verify_password_sync, plain, hashed)


def create_access_token(data: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode({**data, "exp": expire, "type": "access"}, ADMIN_JWT_SECRET, algorithm=ALGORITHM)


def create_refresh_token(data: dict) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode({**data, "exp": expire, "type": "refresh"}, ADMIN_JWT_SECRET, algorithm=ALGORITHM)


async def get_admin_user(request: Request) -> dict:
    token = request.cookies.get("admin_access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, ADMIN_JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def require_admin(request: Request) -> dict:
    return await get_admin_user(request)
