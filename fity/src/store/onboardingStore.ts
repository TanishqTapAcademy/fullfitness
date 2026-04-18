import { create } from 'zustand';
import type { Goal, Equipment, Level, QuitReason } from '../data/onboarding';
import { onboardingApi, type BackendQuestion } from '../services/api';
import { getOrCreateUserId } from '../services/userId';

export interface NotificationPrefs {
  workoutReminders: boolean;
  progressUpdates: boolean;
  motivation: boolean;
}

interface OnboardingState {
  // Legacy typed fields (still used by auth/notifications screens)
  goals: Goal[];
  equip: Equipment | null;
  level: Level | null;
  height: number;
  weight: number;
  quit: QuitReason | null;
  notifs: NotificationPrefs;

  // Dynamic question state
  questions: BackendQuestion[];
  answers: Record<string, any>;
  currentIndex: number;
  userId: string | null;
  loading: boolean;
  error: string | null;

  // Legacy actions
  toggleGoal: (g: Goal) => void;
  setEquip: (e: Equipment) => void;
  setLevel: (l: Level) => void;
  setHeight: (h: number) => void;
  setWeight: (w: number) => void;
  setQuit: (q: QuitReason) => void;
  setNotif: (k: keyof NotificationPrefs, v: boolean) => void;

  // Dynamic actions
  fetchQuestions: () => Promise<void>;
  setAnswer: (stepId: string, questionId: string, answer: any) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  hasAnswer: () => boolean;

  reset: () => void;
}

// Sync dynamic answers back to legacy typed fields
function syncLegacyFields(answers: Record<string, any>) {
  const patch: Partial<OnboardingState> = {};
  if (answers.goals) patch.goals = answers.goals;
  if (answers.equipment) patch.equip = answers.equipment;
  if (answers.experience) patch.level = answers.experience;
  if (answers.height) patch.height = answers.height;
  if (answers.weight) patch.weight = answers.weight;
  if (answers.quit_reason) patch.quit = answers.quit_reason;
  return patch;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  // Legacy defaults
  goals: [],
  equip: null,
  level: null,
  height: 175,
  weight: 70,
  quit: null,
  notifs: { workoutReminders: true, progressUpdates: true, motivation: false },

  // Dynamic defaults
  questions: [],
  answers: {},
  currentIndex: 0,
  userId: null,
  loading: false,
  error: null,

  // Legacy actions
  toggleGoal: (g) => set((s) => ({ goals: s.goals.includes(g) ? s.goals.filter((x) => x !== g) : [...s.goals, g] })),
  setEquip: (e) => set({ equip: e }),
  setLevel: (l) => set({ level: l }),
  setHeight: (h) => set({ height: h }),
  setWeight: (w) => set({ weight: w }),
  setQuit: (q) => set({ quit: q }),
  setNotif: (k, v) => set((s) => ({ notifs: { ...s.notifs, [k]: v } })),

  // Dynamic actions
  fetchQuestions: async () => {
    set({ loading: true, error: null });
    const uid = await getOrCreateUserId();
    const data = await onboardingApi.getQuestions();
    set({ questions: data.questions, userId: uid, loading: false });
  },

  setAnswer: (stepId, questionId, answer) => {
    const { userId, answers } = get();
    const newAnswers = { ...answers, [stepId]: answer };
    set({ answers: newAnswers, ...syncLegacyFields(newAnswers) });

    // Fire-and-forget save to backend
    if (userId) {
      onboardingApi.saveResponse(userId, questionId, answer).catch(() => {});
    }
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  hasAnswer: () => {
    const { questions, currentIndex, answers } = get();
    const q = questions[currentIndex];
    if (!q) return false;
    const ans = answers[q.step_id];
    if (ans === undefined || ans === null) return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    return true;
  },

  reset: () =>
    set({
      goals: [],
      equip: null,
      level: null,
      height: 175,
      weight: 70,
      quit: null,
      notifs: { workoutReminders: true, progressUpdates: true, motivation: false },
      questions: [],
      answers: {},
      currentIndex: 0,
      loading: false,
      error: null,
    }),
}));
