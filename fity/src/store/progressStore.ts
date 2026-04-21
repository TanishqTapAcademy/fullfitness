import { create } from 'zustand';
import { PROGRESS_SEED, type PR } from '../data/progressFixtures';
import type { TodayLog, TracePR, ChartPoint, MetricItem } from '../services/progressApi';
import * as progressApi from '../services/progressApi';

interface ProgressState {
  initialized: boolean;
  streak: number;
  bestStreak: number;
  sessions: number;
  prs: PR[];
  heatmap: number[];
  strength: number[];
  recap: string;

  // Real data from API
  todayLogs: TodayLog[];
  insight: string;
  chartData: ChartPoint[];
  chartUnit: string;
  chartLabel: string;
  availableMetrics: MetricItem[];
  selectedMetric: string;

  /** Seeds from fixtures as fallback (keeps old behavior for unauthenticated users) */
  init: () => void;

  /** Fetch real data from backend for authenticated users */
  fetchToday: () => Promise<void>;
  fetchTrace: () => Promise<void>;
  fetchChart: (metric: string, period?: string) => Promise<void>;
  fetchMetrics: () => Promise<void>;

  /** Optimistic update when chat SSE returns extraction logs */
  handleExtraction: (logs: Array<{ tool: string; result: string }>) => void;

  setSelectedMetric: (key: string) => void;
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
  todayLogs: [],
  insight: '',
  chartData: [],
  chartUnit: '',
  chartLabel: '',
  availableMetrics: [],
  selectedMetric: '',

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

  fetchToday: async () => {
    const data = await progressApi.getToday();
    if (!data) return;
    set({
      initialized: true,
      streak: data.streak,
      todayLogs: data.today_logs,
      insight: data.insight,
    });
  },

  fetchTrace: async () => {
    const data = await progressApi.getTrace();
    if (!data) return;
    set({
      initialized: true,
      streak: data.streak,
      bestStreak: data.best_streak,
      heatmap: data.heatmap,
      prs: data.prs.map((p: TracePR) => ({
        id: `pr-${p.category}`,
        lift: p.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        value: p.value,
        unit: p.unit as 'kg' | 'reps' | 's',
      })),
      strength: data.strength_trend,
      recap: data.recap,
    });
  },

  fetchChart: async (metric, period = '30d') => {
    const data = await progressApi.getChart(metric, period);
    if (!data) return;
    set({
      chartData: data.points,
      chartUnit: data.unit,
      chartLabel: data.label,
      selectedMetric: metric,
    });
  },

  fetchMetrics: async () => {
    const metrics = await progressApi.getMetrics();
    set({ availableMetrics: metrics });
    if (metrics.length > 0 && !get().selectedMetric) {
      set({ selectedMetric: metrics[0].key });
    }
  },

  handleExtraction: (logs) => {
    // When the chat SSE emits extraction logs, optimistically add to todayLogs
    const newLogs: TodayLog[] = logs
      .filter((l) => l.tool.startsWith('log_'))
      .map((l) => ({
        id: `opt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        domain: l.tool.replace('log_', ''),
        category: '',
        label: l.result,
        logged_at: new Date().toISOString(),
      }));
    if (newLogs.length) {
      set((s) => ({ todayLogs: [...newLogs, ...s.todayLogs] }));
    }
  },

  setSelectedMetric: (key) => set({ selectedMetric: key }),

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
      todayLogs: [],
      insight: '',
      chartData: [],
      chartUnit: '',
      chartLabel: '',
      availableMetrics: [],
      selectedMetric: '',
    }),
}));
