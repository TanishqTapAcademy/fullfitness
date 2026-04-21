import asyncio
import json
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, Query

from auth import require_auth
from posthog_client import capture as posthog_capture

router = APIRouter()

# ── Streak window: only look back this many days ──
_STREAK_LOOKBACK_DAYS = 120


async def _get_user_internal(db, supabase_id: str):
    return await db.user.find_first(where={"supabase_id": supabase_id})


def _calculate_streak(active_dates: list) -> tuple[int, int]:
    """Calculate current streak and best streak from sorted active dates."""
    if not active_dates:
        return 0, 0

    unique = sorted(set(active_dates), reverse=True)
    today = datetime.utcnow().date()

    # Current streak
    streak = 0
    check = today
    for d in unique:
        if d == check:
            streak += 1
            check = d - timedelta(days=1)
        elif d == check - timedelta(days=1):
            streak += 1
            check = d - timedelta(days=1)
        else:
            break

    # Best streak
    best = 1
    current = 1
    sorted_asc = sorted(set(active_dates))
    for i in range(1, len(sorted_asc)):
        if (sorted_asc[i] - sorted_asc[i - 1]).days == 1:
            current += 1
            best = max(best, current)
        else:
            current = 1

    return streak, max(best, streak)


@router.get("/today")
async def progress_today(bg: BackgroundTasks, user: dict = Depends(require_auth)):
    """Home screen data: streak, today's logs, insight."""
    from main import db

    user_id = user.get("sub", "")
    db_user = await _get_user_internal(db, user_id)
    if not db_user:
        return {"streak": 0, "today_logs": [], "insight": "Start logging to see insights."}

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    streak_since = datetime.utcnow() - timedelta(days=_STREAK_LOOKBACK_DAYS)

    # Run both queries concurrently
    today_logs, exercise_logs = await asyncio.gather(
        db.activitylog.find_many(
            where={"user_id": db_user.id, "logged_at": {"gte": today_start}},
            order={"logged_at": "desc"},
            take=20,
        ),
        db.activitylog.find_many(
            where={"user_id": db_user.id, "domain": "exercise", "logged_at": {"gte": streak_since}},
            order={"logged_at": "desc"},
        ),
    )

    active_dates = [log.logged_at.date() for log in exercise_logs]
    streak, _ = _calculate_streak(active_dates)

    # Format recent logs for display
    recent = []
    for log in today_logs[:10]:
        data = json.loads(log.data) if isinstance(log.data, str) else log.data
        label = _format_log_label(log.category, data)
        recent.append({
            "id": log.id,
            "domain": log.domain,
            "category": log.category,
            "label": label,
            "logged_at": log.logged_at.isoformat(),
        })

    if not today_logs:
        insight = "Nothing logged today yet. Tell me what you've been up to."
    elif len(today_logs) >= 3:
        insight = f"Solid day. {len(today_logs)} things logged already."
    else:
        insight = "Good start. Keep the data coming."

    bg.add_task(posthog_capture, user_id, "progress_fetched", {"type": "today", "log_count": len(recent)})

    return {
        "streak": streak,
        "today_logs": recent,
        "insight": insight,
    }


@router.get("/trace")
async def progress_trace(user: dict = Depends(require_auth)):
    """Trace screen data: streak, best streak, heatmap, PRs, strength trend, recap."""
    from main import db

    user_id = user.get("sub", "")
    db_user = await _get_user_internal(db, user_id)
    if not db_user:
        return {
            "streak": 0, "best_streak": 0, "heatmap": [],
            "prs": [], "strength_trend": [], "recap": "No data yet.",
        }

    today = datetime.utcnow().date()
    lookback_start = datetime.utcnow() - timedelta(days=_STREAK_LOOKBACK_DAYS)
    week_ago = datetime.utcnow() - timedelta(days=7)

    # Run exercise logs + weekly recap logs concurrently
    exercise_logs, week_logs = await asyncio.gather(
        db.activitylog.find_many(
            where={"user_id": db_user.id, "domain": "exercise", "logged_at": {"gte": lookback_start}},
            order={"logged_at": "asc"},
        ),
        db.activitylog.find_many(
            where={"user_id": db_user.id, "logged_at": {"gte": week_ago}},
            order={"logged_at": "asc"},
            take=200,
        ),
    )

    active_dates = [log.logged_at.date() for log in exercise_logs]
    streak, best_streak = _calculate_streak(active_dates)

    # Heatmap: last 90 days
    heatmap = []
    active_set = set(active_dates)
    for i in range(89, -1, -1):
        d = today - timedelta(days=i)
        heatmap.append(1 if d in active_set else 0)

    # PRs per category
    prs_map: dict = {}
    for log in exercise_logs:
        data = json.loads(log.data) if isinstance(log.data, str) else log.data
        cat = log.category
        reps = data.get("reps", 0)
        weight = data.get("weight", 0)
        val = weight if weight else reps
        unit = "kg" if weight else "reps"
        if val and (cat not in prs_map or val > prs_map[cat]["value"]):
            prs_map[cat] = {
                "category": cat,
                "value": val,
                "unit": unit,
                "date": log.logged_at.strftime("%b %d"),
            }
    prs = list(prs_map.values())

    # Strength trend: weekly exercise count for last 8 weeks
    strength_trend = []
    for w in range(7, -1, -1):
        week_start = today - timedelta(days=today.weekday() + 7 * w)
        week_end = week_start + timedelta(days=7)
        count = sum(1 for d in active_dates if week_start <= d < week_end)
        strength_trend.append(count)

    # Weekly recap
    if week_logs:
        domains: dict = {}
        for l in week_logs:
            domains[l.domain] = domains.get(l.domain, 0) + 1
        parts = [f"{count} {domain}" for domain, count in domains.items()]
        recap = f"This week: {', '.join(parts)} entries logged."
    else:
        recap = "No activity this week. Let's change that."

    return {
        "streak": streak,
        "best_streak": best_streak,
        "heatmap": heatmap,
        "prs": prs,
        "strength_trend": strength_trend,
        "recap": recap,
    }


@router.get("/chart")
async def progress_chart(
    metric: str = Query(..., description="Category to chart, e.g. 'pushup', 'sleep'"),
    period: str = Query("30d", description="Period like '7d', '30d', '90d'"),
    user: dict = Depends(require_auth),
):
    """Line chart data for a specific metric over time."""
    from main import db

    user_id = user.get("sub", "")
    db_user = await _get_user_internal(db, user_id)
    if not db_user:
        return {"points": [], "unit": "", "label": metric}

    days = min(int(period.replace("d", "")), 365)
    since = datetime.utcnow() - timedelta(days=days)

    logs = await db.activitylog.find_many(
        where={
            "user_id": db_user.id,
            "category": metric,
            "logged_at": {"gte": since},
        },
        order={"logged_at": "asc"},
        take=500,
    )

    points = []
    unit = ""
    for log in logs:
        data = json.loads(log.data) if isinstance(log.data, str) else log.data
        value, u = _extract_chart_value(log.category, data)
        if value is not None:
            unit = u
            points.append({
                "date": log.logged_at.strftime("%Y-%m-%d"),
                "value": value,
            })

    return {"points": points, "unit": unit, "label": metric.replace("_", " ").title()}


@router.get("/metrics")
async def progress_metrics(user: dict = Depends(require_auth)):
    """Get available metrics (categories the user has logged)."""
    from main import db

    user_id = user.get("sub", "")
    db_user = await _get_user_internal(db, user_id)
    if not db_user:
        return {"metrics": []}

    # Only need distinct categories — fetch recent logs with limited fields
    logs = await db.activitylog.find_many(
        where={
            "user_id": db_user.id,
            "logged_at": {"gte": datetime.utcnow() - timedelta(days=90)},
        },
        order={"logged_at": "desc"},
        take=500,
    )

    seen = {}
    for log in logs:
        if log.category not in seen:
            seen[log.category] = log.domain

    metrics = [
        {"key": cat, "label": cat.replace("_", " ").title(), "domain": domain}
        for cat, domain in sorted(seen.items())
    ]

    return {"metrics": metrics}


def _format_log_label(category: str, data: dict) -> str:
    """Create a human-readable label for a log entry."""
    if category in ("pushup", "pull_up", "dips", "burpees"):
        reps = data.get("reps", "?")
        sets = data.get("sets")
        return f"{sets}x{reps} {category}s" if sets else f"{reps} {category}s"
    if category in ("squat", "bench_press", "deadlift", "overhead_press"):
        w = data.get("weight", "?")
        u = data.get("weight_unit", "kg")
        reps = data.get("reps", "?")
        return f"{category.replace('_', ' ')} {w}{u} x{reps}"
    if category == "meal":
        name = data.get("meal_name", "Meal")
        cal = data.get("calories")
        return f"{name} · {cal} cal" if cal else name
    if category == "sleep":
        h = data.get("hours", "?")
        q = data.get("quality", "")
        return f"{h}h sleep" + (f" ({q})" if q else "")
    if category == "water":
        return f"{data.get('amount_ml', '?')}ml water"
    if category == "weight_check":
        return f"{data.get('weight_kg', '?')} kg"
    if category in ("running", "cycling", "walking"):
        d = data.get("distance_km", "?")
        return f"{d}km {category}"
    return category.replace("_", " ")


def _extract_chart_value(category: str, data: dict) -> tuple:
    """Extract the primary numeric value and unit for charting."""
    if "reps" in data:
        return data["reps"], "reps"
    if "weight" in data:
        return data["weight"], data.get("weight_unit", "kg")
    if "hours" in data:
        return data["hours"], "hours"
    if "calories" in data:
        return data["calories"], "cal"
    if "distance_km" in data:
        return data["distance_km"], "km"
    if "duration_min" in data:
        return data["duration_min"], "min"
    if "weight_kg" in data:
        return data["weight_kg"], "kg"
    if "level" in data:
        return data["level"], "/5"
    if "amount_ml" in data:
        return data["amount_ml"], "ml"
    return None, ""
