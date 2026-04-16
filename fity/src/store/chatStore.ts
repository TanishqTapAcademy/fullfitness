import { create } from 'zustand';

export type MessageFrom = 'coach' | 'user';

export interface ChatCTA {
  label: string;
  action: 'open_baseline';
}

export interface Msg {
  id: string;
  from: MessageFrom;
  text: string;
  ts: number;
  cta?: ChatCTA;
}

interface ChatState {
  messages: Msg[];
  didSeeIntro: boolean;
  push: (m: Omit<Msg, 'ts'> & { ts?: number }) => void;
  markIntroSeen: () => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  didSeeIntro: false,
  push: (m) =>
    set((s) => ({
      messages: [...s.messages, { ...m, ts: m.ts ?? Date.now() }],
    })),
  markIntroSeen: () => set({ didSeeIntro: true }),
  reset: () => set({ messages: [], didSeeIntro: false }),
}));
