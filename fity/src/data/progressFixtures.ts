export interface PR {
  id: string;
  lift: string;
  value: number;
  unit: 'kg' | 'reps' | 's';
}

export interface ProgressSeed {
  streak: number;
  bestStreak: number;
  sessions: number;
  prs: PR[];
  /** 12 weeks × 7 days flattened (84 values, 0 = rest, 1–3 intensity). */
  heatmap: number[];
  /** 12-week strength trend (arbitrary units for the bar chart). */
  strength: number[];
  recap: string;
}

/**
 * First-run demo data. Seeds progressStore so the app feels populated from
 * day one without needing real workout history.
 */
export const PROGRESS_SEED: ProgressSeed = {
  streak: 1,
  bestStreak: 1,
  sessions: 1,
  prs: [
    { id: 'pr-squat', lift: 'Squat', value: 60, unit: 'kg' },
    { id: 'pr-bench', lift: 'Bench', value: 40, unit: 'kg' },
    { id: 'pr-plank', lift: 'Plank', value: 45, unit: 's' },
    { id: 'pr-pushup', lift: 'Push-up', value: 12, unit: 'reps' },
  ],
  heatmap: buildHeatmap(),
  strength: [12, 14, 15, 18, 20, 22, 24, 27, 30, 32, 34, 38],
  recap:
    'Strong start. You showed up, moved well, and set the pace for week one. Keep it light, keep it honest.',
};

function buildHeatmap(): number[] {
  // 12 weeks × 7 days = 84. Most-recent cell (last) = light activity.
  const cells = new Array(84).fill(0);
  cells[83] = 2;
  return cells;
}
