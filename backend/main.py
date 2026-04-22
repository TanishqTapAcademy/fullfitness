import logging
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO, force=True)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma

from routes.onboarding import router as onboarding_router
from routes.admin import router as admin_router
from routes.users import router as users_router
from routes.admin_auth import router as auth_router
from routes.chat import router as chat_router
from routes.progress import router as progress_router
from routes.notifications import router as notifications_router
from routes.subscription import router as subscription_router

load_dotenv()

db = Prisma()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    # Pre-warm JWKS cache so first auth request is fast
    try:
        from auth import _get_jwks
        await _get_jwks()
    except Exception:
        pass  # Non-critical — will fetch on first request

    from scheduler import start_scheduler, stop_scheduler
    start_scheduler(db)

    # Pre-warm mem0 + spaCy in background thread so first chat isn't slow
    import threading
    def _warmup_mem0():
        try:
            from memory.client import get_mem0
            logger = logging.getLogger("warmup")
            logger.info("Pre-warming mem0...")
            mem0 = get_mem0()
            if mem0:
                logger.info("mem0 ready")
        except Exception as e:
            logging.getLogger("warmup").warning("mem0 warmup failed: %s", e)
    threading.Thread(target=_warmup_mem0, daemon=True).start()

    yield

    stop_scheduler()
    await db.disconnect()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(onboarding_router, prefix="/api/onboarding")
app.include_router(admin_router, prefix="/api/admin")
app.include_router(users_router, prefix="/api/users")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(chat_router, prefix="/api/chat")
app.include_router(progress_router, prefix="/api/progress")
app.include_router(notifications_router, prefix="/api/notifications")
app.include_router(subscription_router, prefix="/api/webhooks")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "3001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
