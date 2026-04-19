from typing import Optional

from fastapi import APIRouter, Depends
from prisma import Json
from pydantic import BaseModel

from auth import require_auth

router = APIRouter()


def get_db():
    from main import db
    return db


class UserSyncRequest(BaseModel):
    device_id: Optional[str] = None


@router.post("/sync")
async def sync_user(body: UserSyncRequest, user: dict = Depends(require_auth)):
    """Called after login. Creates/updates user row and migrates device responses."""
    db = get_db()
    supabase_id = user["sub"]
    email = user.get("email")

    # Upsert user
    existing = await db.user.find_unique(where={"supabase_id": supabase_id})
    if existing:
        await db.user.update(
            where={"supabase_id": supabase_id},
            data={"email": email},
        )
    else:
        await db.user.create(
            data={
                "supabase_id": supabase_id,
                "email": email,
                "role": "user",
            }
        )

    # Migrate device_id responses to user_id if device_id provided
    if body.device_id:
        device_response = await db.response.find_unique(where={"device_id": body.device_id})
        user_response = await db.response.find_unique(where={"user_id": supabase_id})

        if device_response and not user_response:
            # Transfer ownership from device to user
            await db.response.update(
                where={"id": device_response.id},
                data={"user_id": supabase_id},
            )
        elif device_response and user_response:
            # Merge: user's answers take precedence
            device_answers = device_response.answers if isinstance(device_response.answers, dict) else {}
            user_answers = user_response.answers if isinstance(user_response.answers, dict) else {}
            merged = {**device_answers, **user_answers}
            await db.response.update(
                where={"id": user_response.id},
                data={"answers": Json(merged)},
            )
            await db.response.delete(where={"id": device_response.id})

    return {"success": True}


@router.get("/me")
async def get_me(user: dict = Depends(require_auth)):
    """Get current user profile."""
    db = get_db()
    profile = await db.user.find_unique(where={"supabase_id": user["sub"]})
    if not profile:
        return {"user": None}
    return {
        "user": {
            "id": profile.id,
            "supabase_id": profile.supabase_id,
            "email": profile.email,
            "display_name": profile.display_name,
            "role": profile.role,
        }
    }
