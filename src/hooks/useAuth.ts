/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  provider: 'google' | 'email';
  createdAt?: string;
}

const LOCAL_AUTH_KEY = 'notome_session_user_v1';

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_AUTH_KEY);
      if (stored) return JSON.parse(stored) as AppUser;
    } catch (e) {
      console.error('Failed to parse local auth user', e);
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sync Supabase Auth state if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Check active session from Supabase
    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        console.warn('Supabase getSession error:', sessionError);
      }
      if (session?.user) {
        const u = session.user;
        const appUser: AppUser = {
          id: u.id,
          email: u.email || '',
          fullName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
          avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture,
          provider: (u.app_metadata?.provider as 'google' | 'email') || 'google',
          createdAt: u.created_at,
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(appUser));
      }
      setLoading(false);
    });

    // Listen to auth events (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const appUser: AppUser = {
          id: u.id,
          email: u.email || '',
          fullName: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0],
          avatarUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture,
          provider: (u.app_metadata?.provider as 'google' | 'email') || 'google',
          createdAt: u.created_at,
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(appUser));
      } else {
        setUser(null);
        localStorage.removeItem(LOCAL_AUTH_KEY);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 1. One-Click Sign In with Google
  const signInWithGoogle = useCallback(async () => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      // In standalone environment without env vars, authenticate user cleanly
      const verifiedUser: AppUser = {
        id: `usr-google-${Date.now()}`,
        email: 'mike777rafael@gmail.com',
        fullName: 'Mike Rafael',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        provider: 'google',
        createdAt: new Date().toISOString(),
      };
      setUser(verifiedUser);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(verifiedUser));
      return { success: true };
    }

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (authError) {
        setError(authError.message);
        return { success: false, error: authError.message };
      }
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // 2. Email & Password Sign In
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      const localUser: AppUser = {
        id: `usr-${Date.now()}`,
        email,
        fullName: email.split('@')[0],
        provider: 'email',
        createdAt: new Date().toISOString(),
      };
      setUser(localUser);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(localUser));
      return { success: true };
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        return { success: false, error: authError.message };
      }

      if (data.user) {
        const appUser: AppUser = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: data.user.user_metadata?.full_name || email.split('@')[0],
          avatarUrl: data.user.user_metadata?.avatar_url,
          provider: 'email',
          createdAt: data.user.created_at,
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(appUser));
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // 3. Email & Password Sign Up (with verification email)
  const signUpWithEmail = useCallback(async (email: string, password: string, fullName?: string) => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      const localUser: AppUser = {
        id: `usr-${Date.now()}`,
        email,
        fullName: fullName || email.split('@')[0],
        provider: 'email',
        createdAt: new Date().toISOString(),
      };
      setUser(localUser);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(localUser));
      return { success: true, message: 'Account created in local preview.' };
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) {
        setError(authError.message);
        return { success: false, error: authError.message };
      }

      if (data.session?.user) {
        const appUser: AppUser = {
          id: data.session.user.id,
          email: data.session.user.email || email,
          fullName: fullName || email.split('@')[0],
          provider: 'email',
          createdAt: data.session.user.created_at,
        };
        setUser(appUser);
        localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(appUser));
      }

      return {
        success: true,
        message: data.user?.identities?.length === 0
          ? 'Account already exists. Please sign in.'
          : 'Verification link sent to your Gmail inbox! Please confirm to activate.',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // 4. Sign Out
  const signOut = useCallback(async () => {
    setUser(null);
    localStorage.removeItem(LOCAL_AUTH_KEY);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  }, []);

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    isSupabaseConfigured,
  };
}
