import { supabase } from './supabase';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

async function authFetch(path: string): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return null;

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return null;
  return res.json();
}

export interface TodayLog {
  id: string;
  domain: string;
  category: string;
  label: string;
  logged_at: string;
}

export interface TodayData {
  streak: number;
  today_logs: TodayLog[];
  insight: string;
}

export async function getToday(): Promise<TodayData | null> {
  return authFetch('/progress/today');
}

export interface TracePR {
  category: string;
  value: number;
  unit: string;
  date: string;
}

export interface TraceData {
  streak: number;
  best_streak: number;
  heatmap: number[];
  prs: TracePR[];
  strength_trend: number[];
  recap: string;
}

export async function getTrace(): Promise<TraceData | null> {
  return authFetch('/progress/trace');
}

export interface ChartPoint {
  date: string;
  value: number;
}

export interface ChartData {
  points: ChartPoint[];
  unit: string;
  label: string;
}

export async function getChart(metric: string, period = '30d'): Promise<ChartData | null> {
  return authFetch(`/progress/chart?metric=${metric}&period=${period}`);
}

export interface MetricItem {
  key: string;
  label: string;
  domain: string;
}

export async function getMetrics(): Promise<MetricItem[]> {
  const data = await authFetch('/progress/metrics');
  return data?.metrics ?? [];
}
