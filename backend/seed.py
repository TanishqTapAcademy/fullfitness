import asyncio

import bcrypt
from dotenv import load_dotenv
from prisma import Json, Prisma

load_dotenv()

SEED_QUESTIONS = [
    {
        "step_id": "goals",
        "type": "multi_select",
        "title": "What are your goals?",
        "subtitle": "Select what matters. I'll program the rest.",
        "order": 1,
        "options": [
            {"id": "lose_fat", "icon": "fire", "label": "Lose fat", "desc": "Cut body fat, look leaner"},
            {"id": "build_muscle", "icon": "dumbbell", "label": "Build muscle", "desc": "Gain size and strength"},
            {"id": "get_fit", "icon": "target", "label": "Get fit", "desc": "Improve overall fitness"},
            {"id": "stay_healthy", "icon": "heart", "label": "Stay healthy", "desc": "Move daily, feel good"},
            {"id": "gain_energy", "icon": "bolt", "label": "More energy", "desc": "Beat fatigue, feel sharp"},
            {"id": "mental", "icon": "brain", "label": "Mental clarity", "desc": "Reduce stress, focus better"},
        ],
        "config": {"min_select": 1, "max_select": 6},
        "coach_response": {
            "single": "Great pick. We'll focus on {label}.",
            "multi": "Nice combo — we'll balance {count} goals in your plan.",
        },
    },
    {
        "step_id": "equipment",
        "type": "grid_select",
        "title": "What can you use?",
        "subtitle": "This shapes every exercise I pick.",
        "order": 2,
        "options": [
            {"id": "full_gym", "icon": "gym", "label": "Full gym", "desc": "Access to everything"},
            {"id": "home", "icon": "home", "label": "Home setup", "desc": "Some dumbbells / bands"},
            {"id": "bodyweight", "icon": "body", "label": "Bodyweight", "desc": "No equipment needed"},
            {"id": "not_sure", "icon": "question", "label": "Not sure", "desc": "We'll figure it out"},
        ],
        "config": {"columns": 2, "select_mode": "single"},
        "coach_response": {
            "default": "Locked in — I'll only pick moves that fit your setup.",
        },
    },
    {
        "step_id": "experience",
        "type": "single_select",
        "title": "How experienced are you?",
        "subtitle": "So we pick the right starting intensity.",
        "order": 3,
        "options": [
            {"id": "beginner", "label": "Beginner", "desc": "New to training"},
            {"id": "some", "label": "Some experience", "desc": "Trained on and off"},
            {"id": "consistent", "label": "Consistent", "desc": "Train 2-3x a week"},
            {"id": "advanced", "label": "Advanced", "desc": "4+ sessions weekly"},
        ],
        "config": None,
        "coach_response": {
            "default": "Got it. We'll start where you are and progress from there.",
        },
    },
    {
        "step_id": "height",
        "type": "wheel",
        "title": "How tall are you?",
        "subtitle": "Quick stats for precision. Skip if you want.",
        "order": 4,
        "options": None,
        "config": {"min": 140, "max": 220, "default": 175, "suffix": "cm"},
        "coach_response": None,
    },
    {
        "step_id": "weight",
        "type": "wheel",
        "title": "What do you weigh?",
        "subtitle": "Quick stats for precision. Skip if you want.",
        "order": 5,
        "options": None,
        "config": {"min": 35, "max": 180, "default": 70, "suffix": "kg"},
        "coach_response": None,
    },
]


async def main():
    db = Prisma()
    await db.connect()

    print("Seeding questions...")
    for q in SEED_QUESTIONS:
        data = {k: v for k, v in q.items()}
        for key in ("options", "config", "coach_response"):
            if key in data:
                if data[key] is not None:
                    data[key] = Json(data[key])
                else:
                    del data[key]
        await db.question.upsert(
            where={"step_id": q["step_id"]},
            data={"create": data, "update": data},
        )
        print(f"  ✓ {q['step_id']}")

    # Seed default admin user
    print("Seeding admin user...")
    admin_email = "admin@fitness.com"
    existing = await db.adminuser.find_unique(where={"email": admin_email})
    if not existing:
        hashed = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
        await db.adminuser.create(data={"email": admin_email, "password": hashed})
        print(f"  ✓ Created admin: {admin_email} / admin123")
    else:
        print(f"  ✓ Admin already exists: {admin_email}")

    print("Seed complete!")
    await db.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
