const DAY_MS = 86_400_000;

const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' });
const fullFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

/** "Today" / "Yesterday" / "Monday" / "15 April 2026" */
export function dayLabel(ts: number): string {
  const now = new Date();
  const d = new Date(ts);

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const msgStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = todayStart - msgStart;

  if (diff === 0) return 'Today';
  if (diff === DAY_MS) return 'Yesterday';
  if (diff > 0 && diff < 7 * DAY_MS) return dayFormatter.format(d);
  return fullFormatter.format(d);
}

/** "2:34 PM" */
export function timeLabel(ts: number): string {
  return timeFormatter.format(new Date(ts));
}
