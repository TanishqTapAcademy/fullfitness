from .exercise import log_exercise, get_exercise_history
from .nutrition import log_nutrition, get_nutrition_stats
from .lifestyle import log_lifestyle, get_lifestyle_stats
from .stats import get_user_stats, get_progress_summary

all_tools = [
    log_exercise,
    get_exercise_history,
    log_nutrition,
    get_nutrition_stats,
    log_lifestyle,
    get_lifestyle_stats,
    get_user_stats,
    get_progress_summary,
]
