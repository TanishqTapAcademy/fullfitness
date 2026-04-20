import os
from typing import Optional

import httpx
from fastapi import Depends, HTTPException, Request
from jose import JWTError, jwt

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")

# Cache for JWKS keys
_jwks_cache: dict = {}


async def _get_jwks() -> dict:
    """Fetch JWKS from Supabase for ES256 token verification."""
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache

    jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    async with httpx.AsyncClient() as client:
        resp = await client.get(jwks_url)
        resp.raise_for_status()
        _jwks_cache = resp.json()
    return _jwks_cache


async def get_current_user(request: Request) -> Optional[dict]:
    """Extract and verify Supabase JWT from Authorization header. Returns None if no token."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ")[1]

    # Read the token header to determine the algorithm
    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    alg = unverified_header.get("alg", "HS256")

    try:
        if alg == "ES256":
            # Asymmetric: verify with Supabase JWKS public key
            jwks = await _get_jwks()
            kid = unverified_header.get("kid")
            # Find the matching key
            rsa_key = {}
            for key in jwks.get("keys", []):
                if key.get("kid") == kid:
                    rsa_key = key
                    break

            if not rsa_key:
                raise HTTPException(status_code=401, detail="Invalid token: key not found")

            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=["ES256"],
                audience="authenticated",
            )
        else:
            # Symmetric: verify with JWT secret (HS256)
            payload = jwt.decode(
                token,
                SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
            )
        return payload
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


async def require_auth(user: Optional[dict] = Depends(get_current_user)) -> dict:
    """Dependency that requires a valid authenticated user."""
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user
