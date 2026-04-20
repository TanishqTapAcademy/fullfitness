import asyncio
from typing import Any, Optional

from fastapi import APIRouter, Depends
from prisma import Json
from pydantic import BaseModel

from admin_auth import require_admin

router = APIRouter()


def get_db():
    from main import db
    return db


class QuestionCreate(BaseModel):
    step_id: str
    type: str
    title: str
    order: int
    subtitle: Optional[str] = None
    options: Optional[Any] = None
    config: Optional[Any] = None
    coach_response: Optional[Any] = None
    is_active: bool = True


class QuestionUpdate(BaseModel):
    step_id: Optional[str] = None
    type: Optional[str] = None
    title: Optional[str] = None
    order: Optional[int] = None
    subtitle: Optional[str] = None
    options: Optional[Any] = None
    config: Optional[Any] = None
    coach_response: Optional[Any] = None
    is_active: Optional[bool] = None


class ReorderItem(BaseModel):
    id: str
    order: int


class ReorderBody(BaseModel):
    order: list[ReorderItem]


@router.get("/questions")
async def get_all_questions(_=Depends(require_admin)):
    db = get_db()
    questions = await db.question.find_many(order={"order": "asc"})
    return {"questions": questions}


def _wrap_json_fields(data: dict) -> dict:
    """Wrap JSON-type fields with prisma.Json() for Prisma Python."""
    for key in ("options", "config", "coach_response"):
        if key in data and data[key] is not None:
            data[key] = Json(data[key])
    return data


@router.post("/questions")
async def create_question(body: QuestionCreate, _=Depends(require_admin)):
    db = get_db()
    data = _wrap_json_fields(body.model_dump())
    question = await db.question.create(data=data)
    return {"question": question}


@router.put("/questions/reorder")
async def reorder_questions(body: ReorderBody, _=Depends(require_admin)):
    db = get_db()
    async with db.tx() as tx:
        for item in body.order:
            await tx.question.update(
                where={"id": item.id},
                data={"order": item.order},
            )
    return {"success": True}


@router.put("/questions/{question_id}")
async def update_question(question_id: str, body: QuestionUpdate, _=Depends(require_admin)):
    db = get_db()
    data = _wrap_json_fields(body.model_dump(exclude_none=True))
    question = await db.question.update(
        where={"id": question_id},
        data=data,
    )
    return {"question": question}


@router.delete("/questions/{question_id}")
async def delete_question(question_id: str, _=Depends(require_admin)):
    db = get_db()
    question = await db.question.delete(
        where={"id": question_id},
    )
    return {"question": question}


@router.get("/responses")
async def get_response_analytics(_=Depends(require_admin)):
    db = get_db()
    all_responses, questions = await asyncio.gather(
        db.response.find_many(),
        db.question.find_many(where={"is_active": True}, order={"order": "asc"}),
    )
    total_questions = len(questions)

    # Per-question stats: count how many devices answered each question
    q_counts: dict[str, int] = {}
    for r in all_responses:
        answers = r.answers if isinstance(r.answers, dict) else {}
        for qid in answers:
            q_counts[qid] = q_counts.get(qid, 0) + 1

    question_stats = [
        {
            "id": q.id,
            "step_id": q.step_id,
            "title": q.title,
            "order": q.order,
            "response_count": q_counts.get(q.id, 0),
        }
        for q in questions
    ]

    # Device stats
    devices = []
    for r in all_responses:
        answers = r.answers if isinstance(r.answers, dict) else {}
        answered = len(answers)
        devices.append({
            "device_id": r.device_id,
            "answered": answered,
            "total": total_questions,
            "percent": round((answered / total_questions) * 100) if total_questions > 0 else 0,
            "answers": answers,
            "created_at": r.created_at.isoformat(),
            "updated_at": r.updated_at.isoformat(),
        })

    total_devices = len(all_responses)
    avg_completion = (
        round(sum(d["percent"] for d in devices) / total_devices)
        if total_devices > 0
        else 0
    )

    return {
        "total_devices": total_devices,
        "avg_completion": avg_completion,
        "question_stats": question_stats,
        "devices": devices,
    }
