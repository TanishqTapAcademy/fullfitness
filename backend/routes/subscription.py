"""Adapty webhook endpoint for subscription events."""
import json
import os
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from auth import require_auth
from config import ADAPTY_WEBHOOK_SECRET

router = APIRouter()

# Events that grant premium access
GRANT_EVENTS = {
    "subscription_started",
    "subscription_renewed",
    "trial_started",
    "trial_converted",
    "subscription_renewal_reactivated",
}

# Events that revoke premium access
REVOKE_EVENTS = {
    "subscription_expired",
    "trial_expired",
    "subscription_refunded",
    "non_subscription_purchase_refunded",
}

# Events that mark pending cancellation (keep access until expires)
CANCEL_EVENTS = {
    "subscription_renewal_cancelled",
    "trial_renewal_cancelled",
}


@router.post("/adapty")
async def adapty_webhook(
    request: Request,
    authorization: Optional[str] = Header(None),
):
    """
    Receive Adapty webhook events and update user subscription status.
    https://adapty.io/docs/webhook-event-types-and-fields
    """
    from main import db

    # Verify webhook secret if configured
    if ADAPTY_WEBHOOK_SECRET:
        if authorization != ADAPTY_WEBHOOK_SECRET:
            raise HTTPException(status_code=401, detail="Invalid webhook secret")

    body = await request.json()

    event_type = body.get("event_type", "")
    customer_user_id = body.get("customer_user_id")
    profile_id = body.get("profile_id")
    event_props = body.get("event_properties", {})

    if not customer_user_id:
        # Can't match to a user without customer_user_id
        return {"status": "skipped", "reason": "no customer_user_id"}

    # Find user by supabase_id (which we set as customer_user_id in Adapty)
    db_user = await db.user.find_first(where={"supabase_id": customer_user_id})
    if not db_user:
        return {"status": "skipped", "reason": "user not found"}

    update_data: dict = {}

    # Store Adapty profile ID
    if profile_id and not db_user.adapty_profile_id:
        update_data["adapty_profile_id"] = profile_id

    # Parse expiration date
    expires_at_str = event_props.get("subscription_expires_at")
    expires_at = None
    if expires_at_str:
        try:
            expires_at = datetime.fromisoformat(expires_at_str.replace("Z", "+00:00"))
        except (ValueError, AttributeError):
            pass

    if event_type in GRANT_EVENTS:
        update_data["subscription_tier"] = "pro"
        update_data["daily_message_limit"] = 999999
        if event_type in ("trial_started",):
            update_data["subscription_status"] = "trial"
        else:
            update_data["subscription_status"] = "active"
        if expires_at:
            update_data["subscription_expires"] = expires_at

    elif event_type in REVOKE_EVENTS:
        update_data["subscription_tier"] = "free"
        update_data["subscription_status"] = "expired" if "expired" in event_type else "free"
        update_data["daily_message_limit"] = 5
        update_data["subscription_expires"] = None

    elif event_type in CANCEL_EVENTS:
        # User cancelled but still has access until period ends
        update_data["subscription_status"] = "cancelled"
        # Keep tier=pro and current expires date

    elif event_type == "billing_issue_detected":
        update_data["subscription_status"] = "billing_issue"

    elif event_type == "entered_grace_period":
        update_data["subscription_status"] = "grace_period"
        # Keep access during grace period

    if update_data:
        await db.user.update(
            where={"id": db_user.id},
            data=update_data,
        )

    return {
        "status": "ok",
        "event_type": event_type,
        "user_id": db_user.id,
    }


@router.post("/dev-toggle-premium")
async def dev_toggle_premium(user: dict = Depends(require_auth)):
    """DEV ONLY: toggle user to premium in the DB so the backend rate limit passes."""
    if os.getenv("ENVIRONMENT", "development") == "production":
        raise HTTPException(status_code=404, detail="Not found")

    from main import db

    user_id = user.get("sub", "")
    db_user = await db.user.find_first(where={"supabase_id": user_id})
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.user.update(
        where={"id": db_user.id},
        data={
            "subscription_tier": "pro",
            "subscription_status": "active",
            "daily_message_limit": 999999,
        },
    )

    return {"status": "ok", "tier": "pro"}
