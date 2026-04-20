from fastapi import APIRouter, Depends, HTTPException, Response, Request
from pydantic import BaseModel

from admin_auth import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    require_admin,
    ADMIN_JWT_SECRET,
    ALGORITHM,
    REFRESH_TOKEN_EXPIRE_DAYS,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from jose import JWTError, jwt

router = APIRouter()


def get_db():
    from main import db
    return db


class AuthBody(BaseModel):
    email: str
    password: str


COOKIE_OPTS = {
    "httponly": True,
    "samesite": "lax",
    "secure": False,  # Set True in production with HTTPS
    "path": "/",
}


@router.post("/register")
async def register(body: AuthBody, response: Response):
    db = get_db()
    existing = await db.adminuser.find_unique(where={"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = await hash_password(body.password)
    user = await db.adminuser.create(
        data={"email": body.email, "password": hashed}
    )

    token_data = {"sub": user.id, "email": user.email, "role": user.role}
    access = create_access_token(token_data)
    refresh = create_refresh_token(token_data)

    response.set_cookie("admin_access_token", access, max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60, **COOKIE_OPTS)
    response.set_cookie("admin_refresh_token", refresh, max_age=REFRESH_TOKEN_EXPIRE_DAYS * 86400, **COOKIE_OPTS)

    return {"user": {"id": user.id, "email": user.email, "role": user.role}}


@router.post("/login")
async def login(body: AuthBody, response: Response):
    db = get_db()
    user = await db.adminuser.find_unique(where={"email": body.email})
    if not user or not await verify_password(body.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {"sub": user.id, "email": user.email, "role": user.role}
    access = create_access_token(token_data)
    refresh = create_refresh_token(token_data)

    response.set_cookie("admin_access_token", access, max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60, **COOKIE_OPTS)
    response.set_cookie("admin_refresh_token", refresh, max_age=REFRESH_TOKEN_EXPIRE_DAYS * 86400, **COOKIE_OPTS)

    return {"user": {"id": user.id, "email": user.email, "role": user.role}}


@router.post("/refresh")
async def refresh(request: Request, response: Response):
    token = request.cookies.get("admin_refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        payload = jwt.decode(token, ADMIN_JWT_SECRET, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    token_data = {"sub": payload["sub"], "email": payload["email"], "role": payload["role"]}
    new_access = create_access_token(token_data)

    response.set_cookie("admin_access_token", new_access, max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60, **COOKIE_OPTS)

    return {"success": True}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("admin_access_token", path="/")
    response.delete_cookie("admin_refresh_token", path="/")
    return {"success": True}


@router.get("/me")
async def me(request: Request):
    from admin_auth import get_admin_user
    user = await get_admin_user(request)
    return {"user": {"id": user["sub"], "email": user["email"], "role": user["role"]}}


# --- Admin user management (protected) ---


@router.get("/users")
async def list_users(admin=Depends(require_admin)):
    db = get_db()
    users = await db.adminuser.find_many(order={"created_at": "desc"})
    return {
        "users": [
            {"id": u.id, "email": u.email, "role": u.role, "created_at": u.created_at.isoformat()}
            for u in users
        ]
    }


@router.post("/users")
async def create_user(body: AuthBody, admin=Depends(require_admin)):
    db = get_db()
    existing = await db.adminuser.find_unique(where={"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed = await hash_password(body.password)
    user = await db.adminuser.create(data={"email": body.email, "password": hashed})
    return {"user": {"id": user.id, "email": user.email, "role": user.role, "created_at": user.created_at.isoformat()}}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, admin=Depends(require_admin)):
    if admin["sub"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    db = get_db()
    existing = await db.adminuser.find_unique(where={"id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    await db.adminuser.delete(where={"id": user_id})
    return {"success": True}
