"""Nudge notification tone system — weighted random tone selection, prompt building, and response parsing."""

import logging
import random
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class NudgeTone:
    name: str
    weight: int
    persona: str
    heading_style: str


TONES = [
    NudgeTone(
        name="caring",
        weight=30,
        persona="You're a warm, affectionate partner who genuinely cares about the user's wellbeing. Loving, supportive, a little sweet.",
        heading_style="Use the user's first name or a warm greeting like 'Hey {name}' or 'Missing you'.",
    ),
    NudgeTone(
        name="challenging",
        weight=25,
        persona="You're a tough but fair coach. Provocative, competitive, no-nonsense. Push them.",
        heading_style="Use bold coach-like headings like 'No excuses', 'Let's go', or 'Step up'.",
    ),
    NudgeTone(
        name="data_driven",
        weight=15,
        persona="You're an analytical fitness tracker. Lead with data, streaks, or stats. Matter-of-fact.",
        heading_style="Use factual headings like 'Quick check-in', 'Your streak', or 'Daily log'.",
    ),
    NudgeTone(
        name="playful_guilt",
        weight=20,
        persona="You're a playful friend who teases with light humor and gentle guilt-tripping. Witty, not mean.",
        heading_style="Use teasing headings like '{name}...', 'Forgot something?', or 'Hmm'.",
    ),
    NudgeTone(
        name="direct",
        weight=10,
        persona="You're ultra-brief and blunt. Minimal words, maximum impact.",
        heading_style="Use one-word or very short headings like 'Log it', 'Fity', or 'Reminder'.",
    ),
]


def pick_tone() -> NudgeTone:
    """Select a tone using weighted random choice."""
    tone = random.choices(TONES, weights=[t.weight for t in TONES], k=1)[0]
    logger.info("Nudge tone selected: %s", tone.name)
    return tone


def build_nudge_prompt(
    display_name: str,
    domain: str,
    profile: str,
    recent_summary: str,
    tone: NudgeTone,
) -> str:
    """Build the LLM prompt for generating a nudge notification."""
    name = display_name or "there"
    return f"""You are a push notification writer for the Fity fitness app.

TONE: {tone.persona}

HEADING STYLE: {tone.heading_style}

TASK: Write a push notification nudging the user to log their {domain} today. They haven't logged it yet.

OUTPUT FORMAT (exactly two lines):
HEADING: <your heading here>
BODY: <your body here>

CONSTRAINTS:
- Heading: max 25 characters
- Body: max 90 characters
- At most 1 emoji in the body, none in the heading
- Do NOT use quotes around the text
- Be personal — use the user's name ({name}) if it fits the tone

USER CONTEXT:
Name: {name}
Profile: {profile}
Recent 7 days: {recent_summary}
Missing today: {domain}"""


def parse_nudge_response(
    raw: str,
    display_name: str,
    domain: str,
) -> tuple[str, str]:
    """Parse LLM output into (heading, body). Falls back to defaults on failure."""
    try:
        heading = None
        body = None
        for line in raw.strip().splitlines():
            line = line.strip()
            if line.upper().startswith("HEADING:"):
                heading = line.split(":", 1)[1].strip().strip('"').strip("'")
            elif line.upper().startswith("BODY:"):
                body = line.split(":", 1)[1].strip().strip('"').strip("'")

        if heading and body:
            # Truncate to limits
            heading = heading[:25]
            body = body[:90]
            return heading, body
    except Exception:
        logger.exception("Failed to parse nudge response")

    return _fallback_heading(display_name), _fallback_body(domain)


def _fallback_heading(display_name: str) -> str:
    if display_name:
        return f"Hey {display_name}"[:25]
    return "Fity"


def _fallback_body(domain: str) -> str:
    fallbacks = {
        "exercise": "Time to move! Log your workout today 💪",
        "nutrition": "What'd you eat today? Let's log it 🥗",
        "lifestyle": "How'd you sleep? Log your lifestyle 😴",
    }
    return fallbacks.get(domain, "Don't forget to log today!")
