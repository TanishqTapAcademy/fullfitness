import { create } from 'zustand';
import { supabase } from '../services/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import type { Session, User } from '@supabase/supabase-js';

// Configure Google Sign-In with Web Client ID
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
});

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  initialized: boolean;
  skippedAuth: boolean;

  initialize: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithApple: () => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  skipAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: false,
  initialized: false,
  skippedAuth: false,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    set({ session, user: session?.user ?? null, initialized: true });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null });
    });
  },

  signInWithEmail: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  signUpWithEmail: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signUp({ email, password });
    set({ loading: false });
    return { error: error?.message ?? null };
  },

  signInWithApple: async () => {
    if (Platform.OS !== 'ios') {
      return { error: 'Apple Sign-In is only available on iOS' };
    }
    set({ loading: true });
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        set({ loading: false });
        return { error: 'No identity token from Apple' };
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      set({ loading: false });
      return { error: error?.message ?? null };
    } catch (e: any) {
      set({ loading: false });
      if (e.code === 'ERR_REQUEST_CANCELED') return { error: null };
      return { error: e.message };
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true });
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!response.data?.idToken) {
        set({ loading: false });
        return { error: 'No ID token from Google' };
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.data.idToken,
      });

      set({ loading: false });
      return { error: error?.message ?? null };
    } catch (e: any) {
      set({ loading: false });
      if (e.code === 'SIGN_IN_CANCELLED') return { error: null };
      return { error: e.message };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, skippedAuth: false });
  },

  skipAuth: () => {
    set({ skippedAuth: true, initialized: true });
  },
}));
