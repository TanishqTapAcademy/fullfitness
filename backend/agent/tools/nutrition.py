import json
from datetime import datetime, timedelta
from typing import Optional

from langchain_core.tools import tool
from prisma import Prisma


def _get_db() -> Prisma:
    from main import db
    return db


@tool
async def log_nutrition(
    category: str,
    user_id: str,
    meal_name: Optional[str] = None,
    calories: Optional[int] = None,
    protein_g: Optional[float] = None,
    carbs_g: Optional[float] = None,
    fat_g: Optional[float] = None,
    amount_ml: Optional[int] = None,
    name: Optional[str] = None,
    description: str = "",
) -> str:
    """Log a nutrition entry. Call this when the user mentions eating, drinking, or supplements.
    Categories: meal, snack, water, supplement, coffee, alcohol, fasting, custom_food."""
    db = _get_db()
    user = await db.user.find_first(where={"supabase_id": user_id})
    if not user:
        return "Error: user not found."

    data = {}
    if meal_name:
        data["meal_name"] = meal_name
    if name:
        data["name"] = name
    if calories is not None:
        data["calories"] = calories
    if protein_g is not None:
        data["protein_g"] = protein_g
    if carbs_g is not None:
        data["carbs_g"] = carbs_g
    if fat_g is not None:
        data["fat_g"] = fat_g
    if amount_ml is not None:
        data["amount_ml"] = amount_ml
    if description:
        data["description"] = description

    log = await db.activitylog.create(
        data={
            "user_id": user.id,
            "domain": "nutrition",
            "category": category,
            "data": json.dumps(data),
            "logged_at": datetime.utcnow(),
        }
    )

    label = meal_name or name or category
    parts = [f"Logged {label}"]
    if calories:
        parts.append(f"{calories} cal")
    if protein_g:
        parts.append(f"{protein_g}g protein")

    return " · ".join(parts) + f" (id: {log.id})"


@tool
async def get_nutrition_stats(
    user_id: str,
    days: int = 1,
) -> str:
    """Get nutrition stats for today or recent days. Shows total calories and macro breakdown."""
    db = _get_db()
    user = await db.user.find_first(where={"supabase_id": user_id})
    if not user:
        return "No data."

    since = datetime.utcnow() - timedelta(days=days)
    logs = await db.activitylog.find_many(
        where={
            "user_id": user.id,
            "domain": "nutrition",
            "logged_at": {"gte": since},
        },
        order={"logged_at": "desc"},
        take=50,
    )

    if not logs:
        return f"No nutrition logs in the last {'day' if days == 1 else f'{days} days'}."

    total_cal = 0
    total_protein = 0.0
    items = []
    for log in logs:
        d = json.loads(log.data) if isinstance(log.data, str) else log.data
        total_cal += d.get("calories", 0)
        total_protein += d.get("protein_g", 0)
        label = d.get("meal_name") or d.get("name") or log.category
        items.append(label)

    summary = f"Total: {total_cal} cal, {total_protein:.0f}g protein"
    summary += f"\nItems: {', '.join(items)}"
    return summary
