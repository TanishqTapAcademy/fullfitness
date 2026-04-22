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
  imageUri?: string,
): Promise<void> {
  const token = await getToken();
  if (!token) throw new Error('Not authenticated');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${BASE_URL}/chat/stream`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = 60000;

    let lastIndex = 0;
    let buffer = '';

    const parseChunk = (raw: string) => {
      buffer += raw;
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
    };

    xhr.onprogress = () => {
      const newData = xhr.responseText.slice(lastIndex);
      lastIndex = xhr.responseText.length;
      if (newData) parseChunk(newData);
    };

    xhr.onload = () => {
      // Parse any remaining buffered data
      const remaining = xhr.responseText.slice(lastIndex);
      if (remaining) parseChunk(remaining);
      if (buffer.trim()) parseChunk(buffer + '\n');

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Chat failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Request timed out'));

    if (imageUri) {
      // Multipart form data with image
      const formData = new FormData();
      formData.append('message', text);
      const ext = imageUri.split('.').pop()?.toLowerCase() ?? 'jpg';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      formData.append('image', {
        uri: imageUri,
        name: `photo.${ext}`,
        type: mimeType,
      } as any);
      xhr.send(formData);
    } else {
      // Text-only — use form data to match the new backend signature
      const formData = new FormData();
      formData.append('message', text);
      xhr.send(formData);
    }
  });
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

export async function streamOpener(
  onEvent: (event: SSEEvent) => void,
): Promise<void> {
  const token = await getToken();
  if (!token) return;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${BASE_URL}/chat/context`);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.timeout = 15000;

    let lastIndex = 0;
    let buffer = '';

    const parseChunk = (raw: string) => {
      buffer += raw;
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
    };

    xhr.onprogress = () => {
      const newData = xhr.responseText.slice(lastIndex);
      lastIndex = xhr.responseText.length;
      if (newData) parseChunk(newData);
    };

    xhr.onload = () => {
      const remaining = xhr.responseText.slice(lastIndex);
      if (remaining) parseChunk(remaining);
      if (buffer.trim()) parseChunk(buffer + '\n');
      resolve();
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Request timed out'));

    xhr.send();
  });
}
