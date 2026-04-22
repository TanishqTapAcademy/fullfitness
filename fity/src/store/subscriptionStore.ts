import { create } from 'zustand';
import { checkPremium } from '../services/adapty';

const FREE_DAILY_LIMIT = 5;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

interface SubscriptionState {
  isPremium: boolean;
  dailyMessageCount: number;
  lastCountDate: string;
  loading: boolean;

  checkSubscription: () => Promise<void>;
  incrementMessageCount: () => void;
  canSendMessage: () => boolean;
  remainingMessages: () => number;
  resetIfNewDay: () => void;
  setPremium: (val: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  isPremium: false,
  dailyMessageCount: 0,
  lastCountDate: todayKey(),
  loading: false,

  checkSubscription: async () => {
    set({ loading: true });
    const premium = await checkPremium();
    set({ isPremium: premium, loading: false });
  },

  incrementMessageCount: () => {
    const state = get();
    const today = todayKey();
    if (state.lastCountDate !== today) {
      set({ dailyMessageCount: 1, lastCountDate: today });
    } else {
      set({ dailyMessageCount: state.dailyMessageCount + 1 });
    }
  },

  canSendMessage: () => {
    const state = get();
    if (state.isPremium) return true;
    const today = todayKey();
    const count = state.lastCountDate !== today ? 0 : state.dailyMessageCount;
    return count < FREE_DAILY_LIMIT;
  },

  remainingMessages: () => {
    const state = get();
    if (state.isPremium) return Infinity;
    const today = todayKey();
    const count = state.lastCountDate !== today ? 0 : state.dailyMessageCount;
    return Math.max(0, FREE_DAILY_LIMIT - count);
  },

  resetIfNewDay: () => {
    const today = todayKey();
    if (get().lastCountDate !== today) {
      set({ dailyMessageCount: 0, lastCountDate: today });
    }
  },

  setPremium: (val) => set({ isPremium: val }),
}));
