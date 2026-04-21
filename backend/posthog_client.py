import logging

from posthog import Posthog
from config import POSTHOG_API_KEY, POSTHOG_HOST

logger = logging.getLogger(__name__)

# PostHog Python SDK already batches & sends async via a background thread,
# but we wrap capture in try/except so it never blocks or crashes a request.
posthog = Posthog(POSTHOG_API_KEY, host=POSTHOG_HOST) if POSTHOG_API_KEY else None


def capture(user_id: str, event: str, properties: dict | None = None):
    if posthog:
        try:
            posthog.capture(user_id, event, properties or {})
        except Exception:
            logger.debug("PostHog capture failed for %s", event, exc_info=True)
