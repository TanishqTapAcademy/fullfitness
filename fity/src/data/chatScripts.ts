export interface ScriptedMessage {
  id: string;
  text: string;
  /** Optional delay (ms) before this message begins typing. */
  delay?: number;
  /** Optional inline CTA to render after the message. */
  cta?: { label: string; action: 'open_baseline' };
}

/**
 * First coach sequence shown when the user lands in the chat after
 * onboarding. Order matters — messages are rendered as they resolve.
 */
export const FIRST_MESSAGES: ScriptedMessage[] = [
  {
    id: 'intro-1',
    text: "Nice — you're in. I'm Coach.",
    delay: 400,
  },
  {
    id: 'intro-2',
    text: "Before your first session, I want to see how you move. Four quick tests, ~90 seconds.",
    delay: 600,
  },
  {
    id: 'intro-3',
    text: "It helps me scale your plan so you win week one.",
    delay: 500,
    cta: { label: 'Do the baseline now', action: 'open_baseline' },
  },
];

export const POST_BASELINE_MESSAGE =
  'Baseline captured. I just tuned your week 1 — tap the home tab to see it.';
