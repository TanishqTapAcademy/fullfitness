import { OneSignal } from 'react-native-onesignal';
import { supabase } from './supabase';

const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export function initOneSignal() {
  if (!ONESIGNAL_APP_ID) return;

  OneSignal.initialize(ONESIGNAL_APP_ID);
  OneSignal.Notifications.requestPermission(true);
}

export async function registerPushToken() {
  if (!ONESIGNAL_APP_ID) return;

  const playerId = OneSignal.User.pushSubscription.getPushSubscriptionId();
  if (!playerId) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return;

  try {
    await fetch(`${BASE_URL}/notifications/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ player_id: playerId }),
    });
  } catch {
    // Non-critical
  }
}

export function setupNotificationHandler(navigateToChat: () => void) {
  OneSignal.Notifications.addEventListener('click', (event) => {
    const route = event.notification.additionalData?.route;
    if (route === 'chat') {
      navigateToChat();
    }
  });
}
