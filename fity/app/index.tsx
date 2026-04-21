import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const session = useAuthStore((s) => s.session);

  if (session) {
    return <Redirect href="/(app)/chat" />;
  }

  return <Redirect href="/onboarding/welcome" />;
}
