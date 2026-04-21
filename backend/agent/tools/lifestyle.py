import json
from datetime import datetime, timedelta
from typing import Optional

from langchain_core.tools import tool
from prisma import Prisma


def _get_db() -> Prisma:
    from main import db
    return db


@tool
async def log_lifestyle(
    category: str,
    user_id: str,
    hours: Optional[float] = None,
    quality: Optional[str] = None,
    level: Optional[int] = None,
    duration_min: Optional[float] = None,
    weight_kg: Optional[float] = None,
    note: str = "",
) -> str:
    """Log a lifestyle entry. Call this when the user mentions sleep, mood, energy, stress,
    meditation, weight, or other wellness data.
    Categories: sleep, nap, mood, energy, stress, meditation, cold_shower, sauna,
    steps, weight_check, body_fat, rest_day, injury."""
    db = _get_db()
    user = await db.user.find_first(where={"supabase_id": user_id})
    if not user:
        return "Error: user not found."

    data = {}
    if hours is not None:
        data["hours"] = hours
    if quality:
        data["quality"] = quality
    if level is not None:
        data["level"] = level
    if duration_min is not None:
        data["duration_min"] = duration_min
    if weight_kg is not None:
        data["weight_kg"] = weight_kg
    if note:
        data["note"] = note

    log = await db.activitylog.create(
        data={
            "user_id": user.id,
            "domain": "lifestyle",
            "category": category,
            "data": json.dumps(data),
            "logged_at": datetime.utcnow(),
        }
    )

    parts = [f"Logged {category}"]
    if hours:
        parts.append(f"{hours}h")
    if quality:
        parts.append(quality)
    if level:
        parts.append(f"level {level}/5")
    if duration_min:
        parts.append(f"{duration_min} min")
    if weight_kg:
        parts.append(f"{weight_kg} kg")

    return " · ".join(parts) + f" (id: {log.id})"


@tool
async def get_lifestyle_stats(
    user_id: str,
    category: Optional[str] = None,
    days: int = 7,
) -> str:
    """Get lifestyle stats. Optionally filter by category (sleep, mood, weight_check, etc.)."""
    db = _get_db()
    user = await db.user.find_first(where={"supabase_id": user_id})
    if not user:
        return "No data."

    since = datetime.utcnow() - timedelta(days=days)
    where: dict = {
        "user_id": user.id,
        "domain": "lifestyle",
        "logged_at": {"gte": since},
    }
    if category:
        where["category"] = category

    logs = await db.activitylog.find_many(
        where=where,
        order={"logged_at": "desc"},
        take=30,
    )

    if not logs:
        return f"No lifestyle logs in the last {days} days."

    lines = []
    for log in logs:
        day = log.logged_at.strftime("%a %b %d")
        lines.append(f"- {day}: {log.category} — {log.data}")
    return "\n".join(lines)
