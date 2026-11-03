/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Strip enclosing quotes if accidentally pasted
  url = url.replace(/^['"]+|['"]+$/g, '');
  // Strip PostgREST path suffix if user mistakenly copied REST URL instead of Project URL
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/auth\/v1\/?$/i, '');
  // Strip trailing slashes
  url = url.replace(/\/+$/, '');
  return url;
}

function sanitizeSupabaseKey(rawKey?: string): string {
  if (!rawKey) return '';
  let key = rawKey.trim();
  key = key.replace(/^['"]+|['"]+$/g, '');
  return key;
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const cleanSupabaseUrl = sanitizeSupabaseUrl(rawUrl);
export const cleanSupabaseAnonKey = sanitizeSupabaseKey(rawAnonKey);

export const isSupabaseConfigured = Boolean(
  cleanSupabaseUrl &&
  cleanSupabaseAnonKey &&
  cleanSupabaseUrl !== 'MY_SUPABASE_URL' &&
  cleanSupabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(cleanSupabaseUrl, cleanSupabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Helper to test Supabase connection status
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  if (!supabase) {
    return {
      success: false,
      message: 'Cloud sync environment configuration not detected.',
    };
  }
  try {
    const { error } = await supabase.from('media_items').select('id').limit(1);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected to cloud sync successfully!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: errorMsg };
  }
}
