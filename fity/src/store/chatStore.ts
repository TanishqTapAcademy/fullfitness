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
  streaming?: boolean;
  imageUri?: string;
}

export interface ExtractionLog {
  tool: string;
  result: string;
}

interface ChatState {
  messages: Msg[];
  didSeeIntro: boolean;
  openerShownThisSession: boolean;
  historyLoaded: boolean;
  loading: boolean;
  streaming: boolean;
  streamingMsgId: string | null;
  extractions: ExtractionLog[];

  push: (m: Omit<Msg, 'ts'> & { ts?: number }) => void;
  markIntroSeen: () => void;
  markOpenerShown: () => void;
  markHistoryLoaded: () => void;

  /** Start a new streaming assistant message */
  startStream: (msgId: string) => void;
  /** Append a token to the current streaming message */
  appendToStream: (msgId: string, token: string) => void;
  /** Mark the streaming message as done */
  finishStream: (msgId: string) => void;

  /** Add extraction logs from tool calls */
  addExtraction: (logs: ExtractionLog[]) => void;

  /** Replace messages with loaded history */
  loadHistory: (msgs: Msg[]) => void;

  setLoading: (v: boolean) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  didSeeIntro: false,
  openerShownThisSession: false,
  historyLoaded: false,
  loading: false,
  streaming: false,
  streamingMsgId: null,
  extractions: [],

  push: (m) =>
    set((s) => ({
      messages: [...s.messages, { ...m, ts: m.ts ?? Date.now() }],
    })),

  markIntroSeen: () => set({ didSeeIntro: true }),
  markOpenerShown: () => set({ openerShownThisSession: true }),
  markHistoryLoaded: () => set({ historyLoaded: true }),

  startStream: (msgId) =>
    set((s) => ({
      streaming: true,
      streamingMsgId: msgId,
      messages: [
        ...s.messages,
        { id: msgId, from: 'coach', text: '', ts: Date.now(), streaming: true },
      ],
    })),

  appendToStream: (msgId, token) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === msgId ? { ...m, text: m.text + token } : m,
      ),
    })),

  finishStream: (msgId) =>
    set((s) => ({
      streaming: false,
      streamingMsgId: null,
      messages: s.messages.map((m) =>
        m.id === msgId ? { ...m, streaming: false } : m,
      ),
    })),

  addExtraction: (logs) =>
    set((s) => ({ extractions: [...s.extractions, ...logs] })),

  loadHistory: (msgs) =>
    set({ messages: msgs }),

  setLoading: (v) => set({ loading: v }),

  reset: () =>
    set({
      messages: [],
      didSeeIntro: false,
      historyLoaded: false,
      loading: false,
      streaming: false,
      streamingMsgId: null,
      extractions: [],
    }),
}));
