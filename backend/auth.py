import os
from typing import Optional

from fastapi import Depends, HTTPException, Request
from jose import JWTError, jwt

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")


async def get_current_user(request: Request) -> Optional[dict]:
    """Extract and verify Supabase JWT from Authorization header. Returns None if no token."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_auth(user: Optional[dict] = Depends(get_current_user)) -> dict:
    """Dependency that requires a valid authenticated user."""
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user
