import { create } from 'zustand';
import { PROGRESS_SEED, type PR } from '../data/progressFixtures';

interface ProgressState {
  initialized: boolean;
  streak: number;
  bestStreak: number;
  sessions: number;
  prs: PR[];
  heatmap: number[];
  strength: number[];
  recap: string;
  /** Seeds the store from fixtures on first run. Idempotent. */
  init: () => void;
  bumpStreak: () => void;
  addPR: (pr: PR) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  initialized: false,
  streak: 0,
  bestStreak: 0,
  sessions: 0,
  prs: [],
  heatmap: [],
  strength: [],
  recap: '',
  init: () => {
    if (get().initialized) return;
    set({
      initialized: true,
      streak: PROGRESS_SEED.streak,
      bestStreak: PROGRESS_SEED.bestStreak,
      sessions: PROGRESS_SEED.sessions,
      prs: PROGRESS_SEED.prs,
      heatmap: PROGRESS_SEED.heatmap,
      strength: PROGRESS_SEED.strength,
      recap: PROGRESS_SEED.recap,
    });
  },
  bumpStreak: () =>
    set((s) => ({
      streak: s.streak + 1,
      bestStreak: Math.max(s.bestStreak, s.streak + 1),
    })),
  addPR: (pr) => set((s) => ({ prs: [...s.prs, pr] })),
  reset: () =>
    set({
      initialized: false,
      streak: 0,
      bestStreak: 0,
      sessions: 0,
      prs: [],
      heatmap: [],
      strength: [],
      recap: '',
    }),
}));
