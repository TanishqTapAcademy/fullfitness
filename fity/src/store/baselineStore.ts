import { create } from 'zustand';
import type { BaselineResult, BaselineTestId } from '../data/baselineTests';
import { BASELINE_TESTS } from '../data/baselineTests';

export type TestIndex = 0 | 1 | 2 | 3;

interface BaselineState {
  index: TestIndex;
  results: Partial<Record<BaselineTestId, BaselineResult>>;
  complete: boolean;
  setResult: (id: BaselineTestId, r: BaselineResult) => void;
  next: () => void;
  finish: () => void;
  reset: () => void;
}

export const useBaselineStore = create<BaselineState>((set, get) => ({
  index: 0,
  results: {},
  complete: false,
  setResult: (id, r) =>
    set((s) => ({ results: { ...s.results, [id]: r } })),
  next: () => {
    const { index } = get();
    const nextIdx = Math.min(BASELINE_TESTS.length - 1, index + 1) as TestIndex;
    set({ index: nextIdx });
  },
  finish: () => set({ complete: true }),
  reset: () => set({ index: 0, results: {}, complete: false }),
}));
