import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';

const KEY = 'device_id';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getOrCreateDeviceId(): Promise<string> {
  let id = await SecureStore.getItemAsync(KEY);
  if (!id) {
    id = generateUUID();
    await SecureStore.setItemAsync(KEY, id);
  }
  return id;
}

/** Returns Supabase user ID if authenticated, otherwise falls back to device ID. */
export async function getUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user?.id) {
    return session.user.id;
  }
  return getOrCreateDeviceId();
}
