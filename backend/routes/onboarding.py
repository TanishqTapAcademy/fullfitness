from typing import Any, Optional

from fastapi import APIRouter
from prisma import Json
from pydantic import BaseModel

router = APIRouter()


def get_db():
    from main import db
    return db


class ResponseSave(BaseModel):
    device_id: Optional[str] = None
    user_id: Optional[str] = None
    question_id: str
    answer: Any


@router.get("/questions")
async def get_questions():
    db = get_db()
    questions = await db.question.find_many(
        where={"is_active": True},
        order={"order": "asc"},
    )
    return {"questions": questions}


@router.post("/responses")
async def save_response(body: ResponseSave):
    db = get_db()

    # Look up existing response by user_id first, then device_id
    existing = None
    lookup_key = None
    lookup_value = None

    if body.user_id:
        existing = await db.response.find_unique(where={"user_id": body.user_id})
        lookup_key = "user_id"
        lookup_value = body.user_id
    if not existing and body.device_id:
        existing = await db.response.find_unique(where={"device_id": body.device_id})
        lookup_key = "device_id"
        lookup_value = body.device_id

    if existing:
        current = existing.answers if isinstance(existing.answers, dict) else {}
        current[body.question_id] = body.answer
        response = await db.response.update(
            where={lookup_key: lookup_value},
            data={"answers": Json(current)},
        )
    else:
        # Create new row
        data = {"answers": Json({body.question_id: body.answer})}
        if body.user_id:
            data["user_id"] = body.user_id
        if body.device_id:
            data["device_id"] = body.device_id
        response = await db.response.create(data=data)

    return {"success": True, "response": response}


@router.get("/responses/{identifier}")
async def get_responses(identifier: str):
    db = get_db()
    # Try user_id first, then device_id
    response = await db.response.find_unique(where={"user_id": identifier})
    if not response:
        response = await db.response.find_unique(where={"device_id": identifier})
    total = await db.question.count(where={"is_active": True})
    answers = response.answers if response and isinstance(response.answers, dict) else {}
    answered = len(answers)
    return {
        "response": response,
        "completion": {
            "answered": answered,
            "total": total,
            "percent": round((answered / total) * 100) if total > 0 else 0,
        },
    }
