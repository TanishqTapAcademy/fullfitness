const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

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
    const res = await fetch(`${BASE_URL}/onboarding/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, question_id: questionId, answer }),
    });
    if (!res.ok) throw new Error('Failed to save response');
    return res.json();
  },

  getResponses: async (deviceId: string) => {
    const res = await fetch(`${BASE_URL}/onboarding/responses/${deviceId}`);
    if (!res.ok) throw new Error('Failed to fetch responses');
    return res.json();
  },
};
