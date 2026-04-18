from typing import Any

from fastapi import APIRouter
from prisma import Json
from pydantic import BaseModel

router = APIRouter()


def get_db():
    from main import db
    return db


class ResponseSave(BaseModel):
    device_id: str
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
    # Get existing row for this device
    existing = await db.response.find_unique(where={"device_id": body.device_id})

    if existing:
        # Merge new answer into existing answers
        current = existing.answers if isinstance(existing.answers, dict) else {}
        current[body.question_id] = body.answer
        response = await db.response.update(
            where={"device_id": body.device_id},
            data={"answers": Json(current)},
        )
    else:
        # Create new row with first answer
        response = await db.response.create(
            data={
                "device_id": body.device_id,
                "answers": Json({body.question_id: body.answer}),
            }
        )

    return {"success": True, "response": response}


@router.get("/responses/{device_id}")
async def get_device_responses(device_id: str):
    db = get_db()
    response = await db.response.find_unique(where={"device_id": device_id})
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
