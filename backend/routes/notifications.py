import logging

import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from auth import require_auth
from admin_auth import require_admin
from config import ONESIGNAL_APP_ID, ONESIGNAL_REST_API_KEY

logger = logging.getLogger(__name__)

router = APIRouter()


class RegisterRequest(BaseModel):
    player_id: str


@router.post("/register")
async def register_push(body: RegisterRequest, user: dict = Depends(require_auth)):
    """Save the OneSignal player_id to the user record."""
    from main import db

    user_id = user.get("sub", "")
    db_user = await db.user.find_first(where={"supabase_id": user_id})
    if not db_user:
        return {"success": False, "error": "User not found"}

    await db.user.update(
        where={"id": db_user.id},
        data={"onesignal_id": body.player_id},
    )
    return {"success": True}


async def send_push_notification(
    player_id: str,
    message: str,
    data: dict = None,
    heading: str = "Fity",
    subtitle: str = None,
):
    """Send a push notification via OneSignal REST API."""
    if not ONESIGNAL_APP_ID or not ONESIGNAL_REST_API_KEY:
        return

    payload = {
        "app_id": ONESIGNAL_APP_ID,
        "include_player_ids": [player_id],
        "headings": {"en": heading},
        "contents": {"en": message},
        # Android: accent colour and grouping
        "android_accent_color": "FFE8FF6B",
        "android_group": "fity_nudges",
        "android_group_message": {"en": "$[notif_count] reminders"},
        # Android priority
        "priority": 10,
    }
    if subtitle:
        payload["subtitle"] = {"en": subtitle}
    if data:
        payload["data"] = data

    async with httpx.AsyncClient() as client:
        await client.post(
            "https://onesignal.com/api/v1/notifications",
            json=payload,
            headers={
                "Authorization": f"Basic {ONESIGNAL_REST_API_KEY}",
                "Content-Type": "application/json",
            },
        )


async def generate_nudge(
    db, user_id: str, domain: str, display_name: str, profile: str, summary: str
) -> tuple[str, str]:
    """Generate a personalised nudge heading + body with a random tone. Falls back to defaults."""
    from agent.nudge_prompts import pick_tone, build_nudge_prompt, parse_nudge_response, _fallback_heading, _fallback_body

    tone = pick_tone()
    try:
        from agent.graph import get_llm

        llm = get_llm()
        prompt = build_nudge_prompt(display_name, domain, profile, summary, tone)
        response = await llm.ainvoke(prompt)
        heading, body = parse_nudge_response(response.content, display_name, domain)
        logger.info("Nudge generated [%s/%s] tone=%s heading=%r body=%r", user_id, domain, tone.name, heading, body)
        return heading, body
    except Exception:
        logger.exception("LLM nudge generation failed for %s/%s (tone=%s)", user_id, domain, tone.name)
        return _fallback_heading(display_name), _fallback_body(domain)



# Nudge windows: (domain, start_hour, start_minute, end_hour)
# Each domain has a 1-hour window in the user's local time
NUDGE_WINDOWS = [
    ("exercise",  7, 0,  8),   # 7:00 – 8:00 AM — morning planning mode
    ("nutrition", 12, 30, 13),  # 12:30 – 1:00 PM — just ate, log it
    ("lifestyle", 20, 30, 21),  # 8:30 – 9:00 PM — evening wind-down
]

DEFAULT_TIMEZONE = "America/New_York"


async def check_and_nudge(db, user_id: str):
    """Check if the user is missing data and send a nudge. One nudge per day max."""
    from datetime import datetime
    from zoneinfo import ZoneInfo
    from agent.context import get_user_profile, get_recent_summary

    db_user = await db.user.find_first(where={"supabase_id": user_id})
    if not db_user or not db_user.onesignal_id:
        return

    # Resolve user's local time
    try:
        tz = ZoneInfo(db_user.timezone) if db_user.timezone else ZoneInfo(DEFAULT_TIMEZONE)
    except Exception:
        tz = ZoneInfo(DEFAULT_TIMEZONE)

    now_local = datetime.now(tz)
    today_local = now_local.date()

    # Dedup: skip if we already nudged this user today
    if db_user.last_nudge_at:
        last_nudge_local = db_user.last_nudge_at.astimezone(tz).date() if db_user.last_nudge_at.tzinfo else db_user.last_nudge_at.date()
        if last_nudge_local == today_local:
            return

    # Find today's logs (use UTC start-of-local-day for the DB query)
    today_start_utc = datetime(now_local.year, now_local.month, now_local.day, tzinfo=tz).astimezone(ZoneInfo("UTC")).replace(tzinfo=None)

    today_logs = await db.activitylog.find_many(
        where={"user_id": db_user.id, "logged_at": {"gte": today_start_utc}},
    )
    domains_logged = {log.domain for log in today_logs}

    # Find the first matching nudge window
    local_hour = now_local.hour
    local_minute = now_local.minute
    domain = None
    for d, start_h, start_m, end_h in NUDGE_WINDOWS:
        in_window = (local_hour > start_h or (local_hour == start_h and local_minute >= start_m)) and local_hour < end_h
        if in_window and d not in domains_logged:
            domain = d
            break

    if not domain:
        return

    # Build context and generate personalised nudge
    display_name = db_user.display_name or ""
    profile = await get_user_profile(db, user_id)
    summary = await get_recent_summary(db, user_id)
    heading, body = await generate_nudge(db, user_id, domain, display_name, profile, summary)

    await send_push_notification(
        db_user.onesignal_id,
        body,
        data={"route": "chat"},
        heading=heading,
    )

    # Mark nudge sent for today
    await db.user.update(
        where={"id": db_user.id},
        data={"last_nudge_at": datetime.utcnow()},
    )
    logger.info("Nudge sent [%s] domain=%s tz=%s local=%s", user_id, domain, tz, now_local.strftime("%H:%M"))


@router.post("/nudge-all")
async def nudge_all(_=Depends(require_admin)):
    """Manually trigger nudge checks for all users (admin only)."""
    from main import db
    from scheduler import nudge_all_users

    await nudge_all_users(db)
    return {"success": True}
