import asyncio
from datetime import datetime, timedelta

from prisma import Prisma

from memory.client import get_mem0


async def get_user_profile(db: Prisma, user_id: str) -> str:
    user = await db.user.find_first(where={"supabase_id": user_id})
    if not user:
        return "New user, no profile yet."
    return await _build_profile(db, user)


async def _build_profile(db: Prisma, user) -> str:
    parts = []
    if user.display_name:
        parts.append(f"Name: {user.display_name}")
    if user.email:
        parts.append(f"Email: {user.email}")

    # Fetch onboarding answers and goals concurrently
    onboarding_task = db.response.find_first(where={"user_id": user.supabase_id})
    goals_task = db.usergoal.find_many(
        where={"user_id": user.id, "active": True},
        take=10,
    )
    onboarding, goals = await asyncio.gather(onboarding_task, goals_task)

    # Include onboarding data (goals, equipment, experience, height, weight)
    if onboarding and onboarding.answers:
        answers = onboarding.answers if isinstance(onboarding.answers, dict) else {}
        if answers.get("goals"):
            val = answers["goals"]
            labels = [v.get("label", v) if isinstance(v, dict) else v for v in val] if isinstance(val, list) else [val]
            parts.append(f"Goals: {', '.join(str(l) for l in labels)}")
        if answers.get("equipment"):
            val = answers["equipment"]
            label = val.get("label", val) if isinstance(val, dict) else val
            parts.append(f"Equipment: {label}")
        if answers.get("experience"):
            val = answers["experience"]
            label = val.get("label", val) if isinstance(val, dict) else val
            parts.append(f"Experience: {label}")
        if answers.get("height"):
            parts.append(f"Height: {answers['height']} cm")
        if answers.get("weight"):
            parts.append(f"Weight: {answers['weight']} kg")

    if goals:
        goal_strs = [f"{g.goal_type}: {g.target}" for g in goals]
        parts.append(f"Active goals: {', '.join(goal_strs)}")

    return " | ".join(parts) if parts else "No profile details."


async def get_recent_summary(db: Prisma, user_id: str) -> str:
    user = await db.user.find_first(where={"supabase_id": user_id})
    if not user:
        return "No activity data yet."
    return await get_recent_summary_for_user(db, user)


async def get_recent_summary_for_user(db: Prisma, user) -> str:
    """Get recent summary without an extra user lookup."""
    week_ago = datetime.utcnow() - timedelta(days=7)
    logs = await db.activitylog.find_many(
        where={
            "user_id": user.id,
            "logged_at": {"gte": week_ago},
        },
        order={"logged_at": "desc"},
        take=50,
    )

    if not logs:
        return "No activity in the last 7 days."

    lines = []
    for log in logs:
        day = log.logged_at.strftime("%a %b %d")
        lines.append(f"- {day}: {log.domain}/{log.category} — {log.data}")

    return "\n".join(lines)


async def get_full_context(db: Prisma, user_id: str, query: str) -> tuple[str, str, str, str]:
    """Fetch profile, summary, and memories in one call with single user lookup.
    Returns (profile, summary, memories, db_user_id)."""
    user = await db.user.find_first(where={"supabase_id": user_id})
    if not user:
        return "New user, no profile yet.", "No activity data yet.", "No memories.", ""

    # Run profile + summary concurrently
    profile_task = _build_profile(db, user)
    summary_task = get_recent_summary_for_user(db, user)
    profile, summary = await asyncio.gather(profile_task, summary_task)

    # Mem0 search — run in thread with 2s timeout so it doesn't stall the response
    if query:
        try:
            memories = await asyncio.wait_for(
                asyncio.to_thread(search_memories, user_id, query),
                timeout=2.0,
            )
        except asyncio.TimeoutError:
            memories = "No memories (timed out)."
    else:
        memories = "No memories."

    return profile, summary, memories, user.id


def search_memories(user_id: str, query: str) -> str:
    mem0 = get_mem0()
    if not mem0:
        return "Memory not configured."

    try:
        results = mem0.search(query, filters={"user_id": user_id}, limit=10)
        if not results or not results.get("results"):
            return "No relevant memories."

        lines = []
        for r in results["results"]:
            lines.append(f"- {r.get('memory', r.get('text', ''))}")
        return "\n".join(lines)
    except Exception as e:
        print(f"[mem0] search error: {e}")
        return "Memory search unavailable."


def save_memory(user_id: str, messages: list[dict]) -> None:
    mem0 = get_mem0()
    if not mem0:
        return

    try:
        mem0.add(messages, user_id=user_id)
    except Exception as e:
        print(f"[mem0] save error: {e}")
