/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { InvitedUser } from '../types';

export const PRIMARY_ADMIN_EMAIL = 'mike777rafael@gmail.com';

export interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  provider: 'google' | 'email' | 'guest';
  createdAt?: string;
}

export interface AuthNotice {
  type: 'success' | 'error' | 'info';
  message: string;
}

const LOCAL_AUTH_KEY = 'notome_session_user_v1';
const LOCAL_INVITED_USERS_KEY = 'notome_invited_users_v1';

const INITIAL_INVITED_USERS: InvitedUser[] = [
  {
    id: 'primary-admin-01',
    email: PRIMARY_ADMIN_EMAIL,
    fullName: 'Mike Rafael',
    notes: 'Primary Admin Permanen',
    role: 'primary_admin',
    status: 'active',
    invitedBy: 'system',
    createdAt: new Date().toISOString(),
  },
];

function loadLocalInvitedUsers(): InvitedUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_INVITED_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse local invited users', e);
  }
  return INITIAL_INVITED_USERS;
}

function saveLocalInvitedUsers(list: InvitedUser[]) {
  try {
    localStorage.setItem(LOCAL_INVITED_USERS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to persist invited users to localStorage', e);
  }
}

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
  const [notice, setNotice] = useState<AuthNotice | null>(() => {
    try {
      const hash = window.location.hash || '';
      if (hash.includes('error=')) {
        const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
        const desc = params.get('error_description');
        if (desc) {
          return {
            type: 'error',
            message: decodeURIComponent(desc).replace(/\+/g, ' '),
          };
        }
      }
      if (hash.includes('type=signup') || hash.includes('type=email_change')) {
        return {
          type: 'success',
          message: 'Email berhasil diverifikasi! Akun Anda kini aktif, selamat datang di Notome.',
        };
      }
      if (hash.includes('type=recovery')) {
        return {
          type: 'info',
          message: 'Tautan reset sandi berhasil diverifikasi.',
        };
      }
    } catch (e) {
      console.warn('Failed to parse URL hash', e);
    }
    return null;
  });

  const clearNotice = useCallback(() => {
    setNotice(null);
  }, []);

  const [isWhitelisted, setIsWhitelisted] = useState<boolean | null>(null);
  const [checkingWhitelist, setCheckingWhitelist] = useState<boolean>(false);
  const [invitedUsers, setInvitedUsers] = useState<InvitedUser[]>(loadLocalInvitedUsers);

  const isPrimaryAdmin = Boolean(
    user && user.email?.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL.toLowerCase().trim()
  );

  // Fetch invited users from Supabase for Primary Admin
  const fetchInvitedUsers = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setInvitedUsers(loadLocalInvitedUsers());
      return;
    }

    try {
      const { data, error: dbError } = await supabase
        .from('invited_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) {
        console.warn('Supabase fetch invited_users note:', dbError.message);
        setInvitedUsers(loadLocalInvitedUsers());
      } else if (data) {
        const mapped: InvitedUser[] = data.map((d: any) => ({
          id: d.id,
          email: d.email,
          fullName: d.full_name,
          notes: d.notes,
          role: d.role,
          status: d.status,
          invitedBy: d.invited_by,
          createdAt: d.created_at,
          lastLoginAt: d.last_login_at,
        }));
        setInvitedUsers(mapped);
        saveLocalInvitedUsers(mapped);
      }
    } catch (err) {
      console.error('Error fetching invited users:', err);
      setInvitedUsers(loadLocalInvitedUsers());
    }
  }, []);

  // Check Whitelist status when user changes
  useEffect(() => {
    if (!user) {
      setIsWhitelisted(null);
      setCheckingWhitelist(false);
      return;
    }

    // Primary admin is always authorized
    if (user.email?.toLowerCase().trim() === PRIMARY_ADMIN_EMAIL.toLowerCase().trim()) {
      setIsWhitelisted(true);
      setCheckingWhitelist(false);
      fetchInvitedUsers();
      return;
    }

    // Guest preview mode
    if (user.provider === 'guest') {
      setIsWhitelisted(true);
      setCheckingWhitelist(false);
      return;
    }

    // Check Supabase whitelist table for normal user
    if (isSupabaseConfigured && supabase) {
      setCheckingWhitelist(true);
      (async () => {
        try {
          const { data, error: dbError } = await supabase
            .from('invited_users')
            .select('*')
            .ilike('email', user.email.toLowerCase().trim())
            .eq('status', 'active')
            .maybeSingle();

          if (dbError) {
            console.warn('Whitelist query note (fallback to local cache):', dbError.message);
            const local = loadLocalInvitedUsers();
            const found = local.some(
              (u) =>
                u.email.toLowerCase().trim() === user.email.toLowerCase().trim() &&
                u.status === 'active'
            );
            setIsWhitelisted(found);
          } else if (data) {
            setIsWhitelisted(true);
          } else {
            const local = loadLocalInvitedUsers();
            const found = local.some(
              (u) =>
                u.email.toLowerCase().trim() === user.email.toLowerCase().trim() &&
                u.status === 'active'
            );
            setIsWhitelisted(found);
          }
        } catch {
          const local = loadLocalInvitedUsers();
          const found = local.some(
            (u) =>
              u.email.toLowerCase().trim() === user.email.toLowerCase().trim() &&
              u.status === 'active'
          );
          setIsWhitelisted(found);
        } finally {
          setCheckingWhitelist(false);
        }
      })();
    } else {
      const local = loadLocalInvitedUsers();
      const found = local.some(
        (u) =>
          u.email.toLowerCase().trim() === user.email.toLowerCase().trim() &&
          u.status === 'active'
      );
      setIsWhitelisted(found);
    }
  }, [user, fetchInvitedUsers]);

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

        // Detect if coming from email confirmation hash
        const currentHash = window.location.hash || '';
        if (currentHash.includes('type=signup') || currentHash.includes('type=email_change')) {
          setNotice({
            type: 'success',
            message: 'Email berhasil diverifikasi! Akun Anda kini aktif, selamat datang di Notome.',
          });
        }

        // Clean URL hash so tokens don't remain in browser address bar
        if (
          currentHash &&
          (currentHash.includes('access_token') ||
            currentHash.includes('type=') ||
            currentHash.includes('error='))
        ) {
          try {
            window.history.replaceState(null, document.title, window.location.pathname);
          } catch {
            // ignore
          }
        }
      } else {
        // If logged in as guest locally, don't clear unless explicitly signed out
        setUser((prev) => {
          if (prev?.provider === 'guest') return prev;
          localStorage.removeItem(LOCAL_AUTH_KEY);
          return null;
        });
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
        email: 'user@notome.app',
        fullName: 'Notome User',
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
        let msg = authError.message;
        if (msg.toLowerCase().includes('not enabled') || msg.toLowerCase().includes('unsupported provider')) {
          msg = 'Provider Google belum diaktifkan di dashboard Supabase Anda (Authentication > Providers > Google).';
        }
        setError(msg);
        return { success: false, error: msg };
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
        let msg = authError.message;
        if (msg.toLowerCase().includes('invalid login credentials')) {
          msg = 'Email atau kata sandi tidak cocok. Jika belum pernah mendaftar, silakan pilih tab "Buat Akun Baru" di atas.';
        } else if (msg.toLowerCase().includes('email not confirmed')) {
          msg = 'Email belum dikonfirmasi. Periksa kotak masuk Gmail Anda atau matikan toggle "Confirm email" di Dashboard Supabase.';
        }
        setError(msg);
        return { success: false, error: msg };
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
      return { success: true, message: 'Akun berhasil dibuat.' };
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
        let msg = authError.message;
        if (msg.toLowerCase().includes('user already registered')) {
          msg = 'Email ini sudah terdaftar. Silakan pindah ke tab "Masuk" untuk login.';
        } else if (msg.toLowerCase().includes('password should be at least')) {
          msg = 'Kata sandi minimal 6 karakter.';
        }
        setError(msg);
        return { success: false, error: msg };
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
        return { success: true, message: 'Akun berhasil dibuat dan Anda telah masuk!' };
      }

      return {
        success: true,
        message: data.user?.identities?.length === 0
          ? 'Akun sudah terdaftar. Silakan pilih tab "Masuk".'
          : 'Pendaftaran berhasil! Tautan konfirmasi telah dikirim ke email Anda. Periksa kotak masuk untuk mengaktifkan (atau matikan "Confirm email" di Supabase agar langsung aktif).',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  // 4. Instant Guest / Offline Mode (Never blocks the user)
  const signInAsGuest = useCallback((guestName?: string) => {
    const name = guestName?.trim() || 'Tamu / Offline';
    const guestUser: AppUser = {
      id: `usr-guest-${Date.now()}`,
      email: 'guest@notome.app',
      fullName: name,
      provider: 'guest',
      createdAt: new Date().toISOString(),
    };
    setUser(guestUser);
    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(guestUser));
    return { success: true };
  }, []);

  // 5. Admin: Add new invited user (Whitelist a Gmail account)
  const addInvitedUser = useCallback(
    async (email: string, fullName?: string, notes?: string): Promise<{ success: boolean; error?: string }> => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@')) {
        return { success: false, error: 'Alamat email tidak valid.' };
      }

      const newRecord: InvitedUser = {
        id: `inv-${Date.now()}`,
        email: cleanEmail,
        fullName: fullName?.trim() || '',
        notes: notes?.trim() || '',
        role: 'member',
        status: 'active',
        invitedBy: PRIMARY_ADMIN_EMAIL,
        createdAt: new Date().toISOString(),
      };

      // Optimistic state update
      setInvitedUsers((prev) => {
        const exists = prev.some((u) => u.email.toLowerCase() === cleanEmail);
        const next = exists
          ? prev.map((u) => (u.email.toLowerCase() === cleanEmail ? { ...u, status: 'active' as const } : u))
          : [newRecord, ...prev];
        saveLocalInvitedUsers(next);
        return next;
      });

      if (isSupabaseConfigured && supabase) {
        try {
          const { error: insertError } = await supabase.from('invited_users').upsert(
            {
              email: cleanEmail,
              full_name: fullName?.trim() || null,
              notes: notes?.trim() || null,
              role: 'member',
              status: 'active',
              invited_by: PRIMARY_ADMIN_EMAIL,
            },
            { onConflict: 'email' }
          );

          if (insertError) {
            console.warn('Supabase upsert invited_users note:', insertError.message);
          }
        } catch (err) {
          console.error('Supabase exception on addInvitedUser:', err);
        }
      }

      return { success: true };
    },
    []
  );

  // 6. Admin: Toggle/Update user status (active / revoked)
  const updateInvitedUserStatus = useCallback(
    async (id: string, newStatus: 'active' | 'revoked'): Promise<{ success: boolean; error?: string }> => {
      setInvitedUsers((prev) => {
        const next = prev.map((u) => (u.id === id ? { ...u, status: newStatus } : u));
        saveLocalInvitedUsers(next);
        return next;
      });

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('invited_users').update({ status: newStatus }).eq('id', id);
        } catch (err) {
          console.error('Supabase update status error:', err);
        }
      }

      return { success: true };
    },
    []
  );

  // 7. Admin: Delete invited user
  const deleteInvitedUser = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      setInvitedUsers((prev) => {
        const next = prev.filter((u) => u.id !== id);
        saveLocalInvitedUsers(next);
        return next;
      });

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('invited_users').delete().eq('id', id);
        } catch (err) {
          console.error('Supabase delete invited user error:', err);
        }
      }

      return { success: true };
    },
    []
  );

  // 8. Sign Out
  const signOut = useCallback(async () => {
    setUser(null);
    setIsWhitelisted(null);
    localStorage.removeItem(LOCAL_AUTH_KEY);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  }, []);

  return {
    user,
    loading,
    error,
    notice,
    clearNotice,
    isPrimaryAdmin,
    isWhitelisted,
    checkingWhitelist,
    invitedUsers,
    fetchInvitedUsers,
    addInvitedUser,
    updateInvitedUserStatus,
    deleteInvitedUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    signOut,
    isSupabaseConfigured,
  };
}
