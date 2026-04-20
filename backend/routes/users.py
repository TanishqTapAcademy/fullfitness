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
    display_name: Optional[str] = None
    avatar: Optional[str] = None


@router.post("/sync")
async def sync_user(body: UserSyncRequest, user: dict = Depends(require_auth)):
    """Called after login. Creates/updates user row and migrates device responses."""
    db = get_db()
    supabase_id = user["sub"]
    email = user.get("email")

    # Check if user already exists with a completed profile
    existing = await db.user.find_unique(where={"supabase_id": supabase_id})
    is_new_user = True

    if existing:
        # User exists — check if profile is already set up
        if existing.display_name:
            is_new_user = False
        # Update email, and name/avatar only if provided (for new profile setup)
        update_data: dict = {"email": email}
        if body.display_name:
            update_data["display_name"] = body.display_name
        if body.avatar:
            update_data["avatar"] = body.avatar
        await db.user.update(
            where={"supabase_id": supabase_id},
            data=update_data,
        )
    else:
        # Brand new user
        create_data: dict = {
            "supabase_id": supabase_id,
            "email": email,
            "role": "user",
        }
        if body.display_name:
            create_data["display_name"] = body.display_name
        if body.avatar:
            create_data["avatar"] = body.avatar
        await db.user.create(data=create_data)

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

    # Fetch updated user to return
    updated_user = await db.user.find_unique(where={"supabase_id": supabase_id})

    return {
        "success": True,
        "is_new_user": is_new_user,
        "user": {
            "id": updated_user.id,
            "supabase_id": updated_user.supabase_id,
            "email": updated_user.email,
            "display_name": updated_user.display_name,
            "avatar": updated_user.avatar,
            "role": updated_user.role,
        } if updated_user else None,
    }


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
            "avatar": profile.avatar,
            "role": profile.role,
        }
    }
