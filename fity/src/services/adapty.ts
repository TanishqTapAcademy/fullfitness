import { adapty } from 'react-native-adapty';

const ADAPTY_KEY = process.env.EXPO_PUBLIC_ADAPTY_SDK_KEY
  || 'public_live_KBo5Rbfe.Pvjh379sTW2o2WJZkZjL';

/**
 * DEV TOGGLE — flip to test premium/free states without real purchases.
 * true  → app acts as premium (unlimited messages, no paywall)
 * false → app acts as free (5 msg/day, paywall triggers)
 * undefined → uses real Adapty (production)
 */
export const DEV_FORCE_PREMIUM: boolean | undefined = __DEV__ ? false : undefined;

export function initAdapty() {
  adapty.activate(ADAPTY_KEY, {
    logLevel: __DEV__ ? 'verbose' : 'error',
    __ignoreActivationOnFastRefresh: __DEV__,
  });
}

export async function identifyAdaptyUser(userId: string) {
  try {
    await adapty.identify(userId);
  } catch (e) {
    console.warn('[Adapty] identify failed:', e);
  }
}

export async function logoutAdapty() {
  try {
    await adapty.logout();
  } catch (e) {
    console.warn('[Adapty] logout failed:', e);
  }
}

export async function checkPremium(): Promise<boolean> {
  if (typeof DEV_FORCE_PREMIUM === 'boolean') return DEV_FORCE_PREMIUM;
  try {
    const profile = await adapty.getProfile();
    const level = profile.accessLevels?.premium;
    return !!(level?.isActive || level?.isInGracePeriod || level?.isLifetime);
  } catch {
    return false;
  }
}

export async function showAdaptyPaywall(placementId: string = 'coach-upgrade-placement') {
  try {
    const paywall = await adapty.getPaywall(placementId);
    return paywall;
  } catch (e) {
    console.warn('[Adapty] getPaywall failed:', e);
    return null;
  }
}
