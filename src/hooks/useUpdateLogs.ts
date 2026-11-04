/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { UpdateLog, UpdateLogCategory } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PRIMARY_ADMIN_EMAIL } from './useAuth';

const LOCAL_UPDATE_LOGS_KEY = 'notome_update_logs_v1';

const SEED_UPDATE_LOGS: UpdateLog[] = [
  {
    id: 'log-003',
    title: 'Keamanan Hapus Modul, Reset Data Terproteksi & Responsif Desktop',
    version: 'v1.2.1',
    date: '2026-11-04',
    category: 'peningkatan',
    description: `• Dialog konfirmasi modal di tengah layar untuk setiap tombol hapus konten di seluruh modul (Film, Nutrisi, Hewan, Kalender, Catatan, Mimpi).
• Proteksi reset data masif dengan validasi ketik 'HAPUS' sebelum eksekusi.
• Penataan ulang header desktop ramping dan ringkas (max-w-6xl) agar proporsional dan tidak melebar berlebihan.
• Tombol akses Admin Panel langsung di bilah navigasi ponsel Android/iPhone dan menu profil.`,
    likesCount: 6,
    likedBy: ['mike777rafael@gmail.com', 'guest-reviewer-1'],
    createdBy: PRIMARY_ADMIN_EMAIL,
    authorName: 'Mike Rafael (Primary Admin)',
    createdAt: '2026-11-04T08:30:00.000Z',
  },
  {
    id: 'log-002',
    title: 'Panel Akses & Notifikasi Undangan Anggota Resmi',
    version: 'v1.1.0',
    date: '2026-11-03',
    category: 'fitur_baru',
    description: `• Sistem proteksi whitelist privat dengan integrasi Supabase Database & Google OAuth.
• Pengelolaan anggota keluarga/teman dengan status aktif atau nonaktif.
• Fitur pengiriman email undangan resmi via template Gmail 1-klik untuk anggota baru.`,
    likesCount: 9,
    likedBy: ['mike777rafael@gmail.com', 'guest-fan-2', 'guest-fan-3'],
    createdBy: PRIMARY_ADMIN_EMAIL,
    authorName: 'Mike Rafael (Primary Admin)',
    createdAt: '2026-11-03T10:00:00.000Z',
  },
  {
    id: 'log-001',
    title: 'Rencana Roadmap: Ekspor PDF Laporan & Sinkronisasi Offline PWA',
    version: 'Roadmap',
    date: '2026-11-12',
    category: 'rencana',
    description: `• Fitur ekspor ringkasan nutrisi bulanan dan rekam medis vaksin hewan ke format dokumen PDF siap cetak.
• Penyempurnaan mode offline service worker untuk akses tanpa jaringan internet di ponsel.
• Kustomisasi tag dan warna penanda kategori pada kalender utama.`,
    likesCount: 14,
    likedBy: ['mike777rafael@gmail.com', 'guest-member-5'],
    createdBy: PRIMARY_ADMIN_EMAIL,
    authorName: 'Mike Rafael (Primary Admin)',
    createdAt: '2026-11-02T14:00:00.000Z',
  },
];

function loadLocalLogs(): UpdateLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_UPDATE_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse local update logs', e);
  }
  return SEED_UPDATE_LOGS;
}

function saveLocalLogs(logs: UpdateLog[]) {
  try {
    localStorage.setItem(LOCAL_UPDATE_LOGS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save update logs locally', e);
  }
}

export function useUpdateLogs() {
  const [logs, setLogs] = useState<UpdateLog[]>(loadLocalLogs);
  const [loading, setLoading] = useState(false);

  // Fetch logs from Supabase or fallback to local
  const fetchLogs = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setLogs(loadLocalLogs());
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('update_logs')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        // Table might not exist yet, fallback to local storage
        console.warn('Supabase update_logs query note (using local cache):', error.message);
        setLogs(loadLocalLogs());
      } else if (data && data.length > 0) {
        const mapped: UpdateLog[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          version: d.version || 'v1.0.0',
          date: d.date || new Date().toISOString().split('T')[0],
          category: (d.category as UpdateLogCategory) || 'fitur_baru',
          description: d.description || '',
          likesCount: typeof d.likes_count === 'number' ? d.likes_count : 0,
          likedBy: Array.isArray(d.liked_by) ? d.liked_by : [],
          createdBy: d.created_by,
          authorName: d.author_name || 'Mike Rafael (Admin)',
          createdAt: d.created_at || new Date().toISOString(),
          updatedAt: d.updated_at,
        }));
        setLogs(mapped);
        saveLocalLogs(mapped);
      } else {
        // Table exists but is empty: seed local logs
        setLogs(loadLocalLogs());
      }
    } catch (err) {
      console.error('Exception fetching update logs:', err);
      setLogs(loadLocalLogs());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Admin: Add new update log
  const addLog = useCallback(
    async (
      entry: Omit<UpdateLog, 'id' | 'likesCount' | 'likedBy' | 'createdAt'>
    ): Promise<{ success: boolean; error?: string }> => {
      const newId = `log-${Date.now()}`;
      const nowIso = new Date().toISOString();

      const newLog: UpdateLog = {
        ...entry,
        id: newId,
        likesCount: 0,
        likedBy: [],
        createdBy: PRIMARY_ADMIN_EMAIL,
        authorName: 'Mike Rafael (Admin)',
        createdAt: nowIso,
      };

      setLogs((prev) => {
        const next = [newLog, ...prev];
        saveLocalLogs(next);
        return next;
      });

      if (isSupabaseConfigured && supabase) {
        try {
          const { error } = await supabase.from('update_logs').insert([
            {
              title: newLog.title,
              version: newLog.version,
              date: newLog.date,
              category: newLog.category,
              description: newLog.description,
              likes_count: 0,
              liked_by: [],
              created_by: PRIMARY_ADMIN_EMAIL,
            },
          ]);
          if (error) {
            console.warn('Supabase insert update_logs note:', error.message);
          }
        } catch (err) {
          console.error('Error inserting log to Supabase:', err);
        }
      }

      return { success: true };
    },
    []
  );

  // Admin: Update existing log
  const updateLog = useCallback(
    async (
      id: string,
      updates: Partial<Omit<UpdateLog, 'id' | 'likesCount' | 'likedBy' | 'createdAt'>>
    ): Promise<{ success: boolean; error?: string }> => {
      setLogs((prev) => {
        const next = prev.map((item) =>
          item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
        );
        saveLocalLogs(next);
        return next;
      });

      if (isSupabaseConfigured && supabase) {
        try {
          const payload: any = { updated_at: new Date().toISOString() };
          if (updates.title) payload.title = updates.title;
          if (updates.version) payload.version = updates.version;
          if (updates.date) payload.date = updates.date;
          if (updates.category) payload.category = updates.category;
          if (updates.description) payload.description = updates.description;

          await supabase.from('update_logs').update(payload).eq('id', id);
        } catch (err) {
          console.error('Error updating log in Supabase:', err);
        }
      }

      return { success: true };
    },
    []
  );

  // Admin: Delete log
  const deleteLog = useCallback(
    async (id: string): Promise<{ success: boolean; error?: string }> => {
      setLogs((prev) => {
        const next = prev.filter((item) => item.id !== id);
        saveLocalLogs(next);
        return next;
      });

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('update_logs').delete().eq('id', id);
        } catch (err) {
          console.error('Error deleting log from Supabase:', err);
        }
      }

      return { success: true };
    },
    []
  );

  // Any user: Toggle Like on an update log
  const toggleLike = useCallback(
    async (id: string, userIdentifier: string) => {
      if (!userIdentifier) return;

      const cleanUserId = userIdentifier.trim().toLowerCase();

      let targetLikesCount = 0;
      let targetLikedBy: string[] = [];

      setLogs((prev) => {
        const next = prev.map((item) => {
          if (item.id !== id) return item;

          const alreadyLiked = item.likedBy.some(
            (uid) => uid.toLowerCase() === cleanUserId
          );

          let updatedLikedBy: string[];
          let updatedLikesCount: number;

          if (alreadyLiked) {
            updatedLikedBy = item.likedBy.filter(
              (uid) => uid.toLowerCase() !== cleanUserId
            );
            updatedLikesCount = Math.max(0, item.likesCount - 1);
          } else {
            updatedLikedBy = [...item.likedBy, cleanUserId];
            updatedLikesCount = item.likesCount + 1;
          }

          targetLikesCount = updatedLikesCount;
          targetLikedBy = updatedLikedBy;

          return {
            ...item,
            likesCount: updatedLikesCount,
            likedBy: updatedLikedBy,
          };
        });

        saveLocalLogs(next);
        return next;
      });

      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from('update_logs')
            .update({
              likes_count: targetLikesCount,
              liked_by: targetLikedBy,
            })
            .eq('id', id);
        } catch (err) {
          console.warn('Note updating like in Supabase:', err);
        }
      }
    },
    []
  );

  return {
    logs,
    loading,
    fetchLogs,
    addLog,
    updateLog,
    deleteLog,
    toggleLike,
  };
}
