import json
from datetime import datetime, timedelta
from typing import Optional

from langchain_core.tools import tool
from prisma import Prisma


def _get_db() -> Prisma:
    from main import db
    return db


@tool
async def log_exercise(
    category: str,
    user_id: str,
    reps: Optional[int] = None,
    sets: Optional[int] = None,
    weight: Optional[float] = None,
    weight_unit: str = "kg",
    duration_min: Optional[float] = None,
    distance_km: Optional[float] = None,
    notes: str = "",
) -> str:
    """Log an exercise activity. Call this when the user mentions doing any physical exercise.
    Categories: pushup, squat, bench_press, deadlift, overhead_press, pull_up, plank,
    running, cycling, swimming, walking, yoga, stretching, hiit, jump_rope, rowing,
    lunges, dips, burpees, box_jump, battle_ropes, stair_climb, sport_session, custom."""
    db = _get_db()
    user = await db.user.find_first(where={"supabase_id": user_id})
    if not user:
        return "Error: user not found."

    data = {}
    if reps is not None:
        data["reps"] = reps
    if sets is not None:
        data["sets"] = sets
    if weight is not None:
        data["weight"] = weight
        data["weight_unit"] = weight_unit
    if duration_min is not None:
        data["duration_min"] = duration_min
    if distance_km is not None:
        data["distance_km"] = distance_km
    if notes:
        data["notes"] = notes

    log = await db.activitylog.create(
        data={
            "user_id": user.id,
            "domain": "exercise",
            "category": category,
            "data": json.dumps(data),
            "logged_at": datetime.utcnow(),
        }
    )

    parts = [f"Logged {category}"]
    if sets and reps:
        parts.append(f"{sets}x{reps}")
    elif reps:
        parts.append(f"{reps} reps")
    if weight:
        parts.append(f"@ {weight}{weight_unit}")
    if duration_min:
        parts.append(f"{duration_min} min")
    if distance_km:
        parts.append(f"{distance_km} km")

    return " · ".join(parts) + f" (id: {log.id})"


@tool
async def get_exercise_history(
    user_id: str,
    category: Optional[str] = None,
    days: int = 7,
) -> str:
    """Get exercise history for a user. Optionally filter by category. Returns last N days."""
    db = _get_db()
    user = await db.user.find_first(where={"supabase_id": user_id})
    if not user:
        return "No data."

    since = datetime.utcnow() - timedelta(days=days)
    where: dict = {
        "user_id": user.id,
        "domain": "exercise",
        "logged_at": {"gte": since},
    }
    if category:
        where["category"] = category

    logs = await db.activitylog.find_many(
        where=where,
        order={"logged_at": "desc"},
        take=20,
    )

    if not logs:
        return f"No exercise logs in the last {days} days."

    lines = []
    for log in logs:
        day = log.logged_at.strftime("%a %b %d")
        lines.append(f"- {day}: {log.category} — {log.data}")
    return "\n".join(lines)
