import { PostHog } from 'posthog-react-native';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let posthogClient: PostHog | null = null;

export function initPostHog() {
  if (!POSTHOG_API_KEY) return;
  if (posthogClient) return;

  posthogClient = new PostHog(POSTHOG_API_KEY, {
    host: POSTHOG_HOST,
    enableSessionReplay: true,
  });
}

export function getPostHog(): PostHog | null {
  return posthogClient;
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  posthogClient?.identify(userId, properties);
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  posthogClient?.capture(event, properties);
}

export function resetUser() {
  posthogClient?.reset();
}
