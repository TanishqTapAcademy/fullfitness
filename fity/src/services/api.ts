import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    return { Authorization: `Bearer ${session.access_token}` };
  }
  return {};
}

export interface BackendQuestion {
  id: string;
  step_id: string;
  type: string;
  title: string;
  subtitle: string | null;
  options: Array<{ id: string; label: string; desc?: string; icon?: string }> | null;
  config: Record<string, any> | null;
  coach_response: Record<string, any> | null;
  order: number;
  is_active: boolean;
}

export const onboardingApi = {
  getQuestions: async (): Promise<{ questions: BackendQuestion[] }> => {
    const res = await fetch(`${BASE_URL}/onboarding/questions`);
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  },

  saveResponse: async (deviceId: string, questionId: string, answer: any) => {
    const headers = await authHeaders();
    const { data: { session } } = await supabase.auth.getSession();

    const body: Record<string, any> = { question_id: questionId, answer };
    if (session?.user?.id) {
      body.user_id = session.user.id;
    } else {
      body.device_id = deviceId;
    }

    const res = await fetch(`${BASE_URL}/onboarding/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error('Failed to save response');
    return res.json();
  },

  getResponses: async (deviceId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const identifier = session?.user?.id || deviceId;
    const res = await fetch(`${BASE_URL}/onboarding/responses/${identifier}`);
    if (!res.ok) throw new Error('Failed to fetch responses');
    return res.json();
  },

  syncUser: async (
    deviceId: string,
    opts?: { display_name?: string; avatar?: string }
  ): Promise<{ success: boolean; is_new_user: boolean; user: any }> => {
    const headers = await authHeaders();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await fetch(`${BASE_URL}/users/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ device_id: deviceId, timezone, ...opts }),
    });
    if (!res.ok) throw new Error('Failed to sync user');
    return res.json();
  },

  getMe: async (): Promise<{ user: any }> => {
    const headers = await authHeaders();
    const res = await fetch(`${BASE_URL}/users/me`, {
      headers: { ...headers },
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },
};
