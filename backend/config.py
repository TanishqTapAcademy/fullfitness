import os

from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "")
DIRECT_URL = os.getenv("DIRECT_URL", "")

# Server
PORT = int(os.getenv("PORT", "3001"))

# Supabase
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")

# Admin
ADMIN_JWT_SECRET = os.getenv("ADMIN_JWT_SECRET", "")

# OpenRouter (LLM)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")

# OpenAI (embeddings for Mem0)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
MEM0_LLM_MODEL = os.getenv("MEM0_LLM_MODEL", "gpt-4o-mini")

# OneSignal
ONESIGNAL_APP_ID = os.getenv("ONESIGNAL_APP_ID", "")
ONESIGNAL_REST_API_KEY = os.getenv("ONESIGNAL_REST_API_KEY", "")

# PostHog
POSTHOG_API_KEY = os.getenv("POSTHOG_API_KEY", "")
POSTHOG_HOST = os.getenv("POSTHOG_HOST", "https://us.i.posthog.com")
