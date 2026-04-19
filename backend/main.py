import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from prisma import Prisma

from routes.onboarding import router as onboarding_router
from routes.admin import router as admin_router
from routes.users import router as users_router

load_dotenv()

db = Prisma()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
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


@app.get("/api/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "3001"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
