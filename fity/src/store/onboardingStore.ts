import { create } from 'zustand';
import type { Goal, Equipment, Level, QuitReason } from '../data/onboarding';

export interface NotificationPrefs {
  workoutReminders: boolean;
  progressUpdates: boolean;
  motivation: boolean;
}

interface OnboardingState {
  goals: Goal[];
  equip: Equipment | null;
  level: Level | null;
  height: number; // cm
  weight: number; // kg
  quit: QuitReason | null;
  notifs: NotificationPrefs;
  toggleGoal: (g: Goal) => void;
  setEquip: (e: Equipment) => void;
  setLevel: (l: Level) => void;
  setHeight: (h: number) => void;
  setWeight: (w: number) => void;
  setQuit: (q: QuitReason) => void;
  setNotif: (k: keyof NotificationPrefs, v: boolean) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  goals: [],
  equip: null,
  level: null,
  height: 175,
  weight: 70,
  quit: null,
  notifs: { workoutReminders: true, progressUpdates: true, motivation: false },
  toggleGoal: (g) =>
    set((s) => ({
      goals: s.goals.includes(g) ? s.goals.filter((x) => x !== g) : [...s.goals, g],
    })),
  setEquip: (e) => set({ equip: e }),
  setLevel: (l) => set({ level: l }),
  setHeight: (h) => set({ height: h }),
  setWeight: (w) => set({ weight: w }),
  setQuit: (q) => set({ quit: q }),
  setNotif: (k, v) => set((s) => ({ notifs: { ...s.notifs, [k]: v } })),
  reset: () =>
    set({
      goals: [],
      equip: null,
      level: null,
      height: 175,
      weight: 70,
      quit: null,
      notifs: { workoutReminders: true, progressUpdates: true, motivation: false },
    }),
}));
