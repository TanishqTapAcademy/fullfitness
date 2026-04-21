import json
from datetime import datetime, timedelta
from typing import Optional

from langchain_core.tools import tool
from prisma import Prisma


def _get_db() -> Prisma:
    from main import db
    return db


@tool
async def get_user_stats(
    user_id: str,
    domain: Optional[str] = None,
) -> str:
    """Get overall user statistics. Optionally filter by domain (exercise/nutrition/lifestyle).
    Returns activity counts, streak info, and recent highlights."""
    db = _get_db()
    user = await db.user.find_first(where={"supabase_id": user_id})
    if not user:
        return "No data."

    week_ago = datetime.utcnow() - timedelta(days=7)
    where: dict = {
        "user_id": user.id,
        "logged_at": {"gte": week_ago},
    }
    if domain:
        where["domain"] = domain

    logs = await db.activitylog.find_many(
        where=where,
        order={"logged_at": "desc"},
        take=200,
    )

    if not logs:
        return "No activity in the last 7 days."

    by_domain: dict = {}
    for log in logs:
        by_domain.setdefault(log.domain, []).append(log)

    lines = []
    for d, entries in by_domain.items():
        categories = {}
        for e in entries:
            categories[e.category] = categories.get(e.category, 0) + 1
        cat_str = ", ".join(f"{c}({n})" for c, n in categories.items())
        lines.append(f"{d}: {len(entries)} logs — {cat_str}")

    # Count active days (days with at least one log)
    active_days = len({log.logged_at.date() for log in logs})
    lines.append(f"Active days this week: {active_days}/7")

    return "\n".join(lines)


@tool
async def get_progress_summary(
    user_id: str,
) -> str:
    """Get a comprehensive progress summary including streak, PRs, and trends.
    Use this to give the user a motivational overview."""
    db = _get_db()
    user = await db.user.find_first(where={"supabase_id": user_id})
    if not user:
        return "No data."

    # Only look back 120 days for streak + PRs
    today = datetime.utcnow().date()
    since = datetime.utcnow() - timedelta(days=120)
    all_logs = await db.activitylog.find_many(
        where={"user_id": user.id, "domain": "exercise", "logged_at": {"gte": since}},
        order={"logged_at": "desc"},
        take=500,
    )

    if not all_logs:
        return "No exercise history yet. Let's get started!"

    active_dates = sorted({log.logged_at.date() for log in all_logs}, reverse=True)

    streak = 0
    check_date = today
    for d in active_dates:
        if d == check_date or d == check_date - timedelta(days=1):
            streak += 1
            check_date = d
        else:
            break

    # Find PRs (highest values per category)
    prs = {}
    for log in all_logs:
        data = json.loads(log.data) if isinstance(log.data, str) else log.data
        cat = log.category
        reps = data.get("reps", 0)
        weight = data.get("weight", 0)
        key_val = weight if weight else reps
        if key_val and (cat not in prs or key_val > prs[cat]["value"]):
            prs[cat] = {"value": key_val, "unit": "kg" if weight else "reps", "date": log.logged_at.strftime("%b %d")}

    lines = [f"Current streak: {streak} days"]
    lines.append(f"Total sessions: {len(active_dates)}")

    if prs:
        lines.append("Personal records:")
        for cat, pr in prs.items():
            lines.append(f"  {cat}: {pr['value']} {pr['unit']} ({pr['date']})")

    return "\n".join(lines)
