import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from routes.notifications import check_and_nudge

logger = logging.getLogger(__name__)

_scheduler: AsyncIOScheduler | None = None


async def nudge_all_users(db):
    """Fetch all users with a OneSignal ID and send nudges where appropriate."""
    users = await db.user.find_many(where={"onesignal_id": {"not": None}})
    logger.info("Running nudge job for %d users", len(users))
    for user in users:
        try:
            await check_and_nudge(db, user.supabase_id)
        except Exception:
            logger.exception("Nudge failed for user %s", user.id)


def start_scheduler(db):
    """Create and start the APScheduler with the hourly nudge job."""
    global _scheduler
    _scheduler = AsyncIOScheduler()
    _scheduler.add_job(nudge_all_users, "interval", hours=1, args=[db], id="nudge_all")
    _scheduler.start()
    logger.info("Scheduler started — nudge job runs every hour")


def stop_scheduler():
    """Shut down the scheduler gracefully."""
    global _scheduler
    if _scheduler:
        _scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
        _scheduler = None
