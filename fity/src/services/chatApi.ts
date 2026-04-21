import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

async function getToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export interface SSEEvent {
  type: 'token' | 'extraction' | 'done' | 'error';
  content?: string;
  logs?: Array<{ tool: string; result: string }>;
  message?: string;
}

export async function sendMessage(
  text: string,
  onEvent: (event: SSEEvent) => void,
): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_URL}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message: text }),
  });

  if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      try {
        const event: SSEEvent = JSON.parse(line.slice(6));
        onEvent(event);
      } catch {
        // skip malformed events
      }
    }
  }
}

export interface ChatMessageRecord {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: any;
  created_at: string;
}

export async function getHistory(
  before?: string,
  limit = 20,
): Promise<{ messages: ChatMessageRecord[]; has_more: boolean }> {
  const token = await getToken();
  if (!token) return { messages: [], has_more: false };

  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set('before', before);

  const res = await fetch(`${BASE_URL}/chat/history?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return { messages: [], has_more: false };
  return res.json();
}

export async function getProactiveMessage(): Promise<string> {
  const token = await getToken();
  if (!token) return '';

  const res = await fetch(`${BASE_URL}/chat/context`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return '';
  const data = await res.json();
  return data.opener || '';
}
