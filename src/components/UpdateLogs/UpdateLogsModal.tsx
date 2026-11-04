/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Heart,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Database,
  Copy,
  Check,
  Rocket,
  Wrench,
  Zap,
  Bookmark,
  Share2,
} from 'lucide-react';
import { UpdateLog, UpdateLogCategory } from '../../types';
import { Language } from '../../lib/translations';

interface UpdateLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: UpdateLog[];
  isPrimaryAdmin: boolean;
  currentUserEmail?: string;
  onAddLog: (
    entry: Omit<UpdateLog, 'id' | 'likesCount' | 'likedBy' | 'createdAt'>
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdateLog: (
    id: string,
    updates: Partial<Omit<UpdateLog, 'id' | 'likesCount' | 'likedBy' | 'createdAt'>>
  ) => Promise<{ success: boolean; error?: string }>;
  onDeleteLog: (id: string) => Promise<{ success: boolean; error?: string }>;
  onToggleLike: (id: string, userIdentifier: string) => Promise<void>;
  language: Language;
}

export const UpdateLogsModal: React.FC<UpdateLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  isPrimaryAdmin,
  currentUserEmail,
  onAddLog,
  onUpdateLog,
  onDeleteLog,
  onToggleLike,
  language,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<UpdateLogCategory>('fitur_baru');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Deletion Candidate State (Simple Centered Modal)
  const [deletionCandidate, setDeletionCandidate] = useState<UpdateLog | null>(null);

  // SQL Tab State
  const [showSql, setShowSql] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const isId = language === 'id';
  const userIdentifier = currentUserEmail || 'guest-user';

  const sqlSnippet = `-- Jalankan di Supabase Dashboard -> SQL Editor:
CREATE TABLE IF NOT EXISTS public.update_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    version TEXT DEFAULT 'v1.0.0',
    date DATE DEFAULT CURRENT_DATE,
    category TEXT DEFAULT 'fitur_baru',
    description TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    liked_by JSONB DEFAULT '[]'::jsonb,
    created_by TEXT DEFAULT 'mike777rafael@gmail.com',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.update_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view update logs" ON public.update_logs
    FOR SELECT USING (true);

CREATE POLICY "Primary Admin can manage update logs" ON public.update_logs
    FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'mike777rafael@gmail.com')
    WITH CHECK (LOWER(auth.jwt() ->> 'email') = 'mike777rafael@gmail.com');

CREATE POLICY "Members can toggle like on update logs" ON public.update_logs
    FOR UPDATE USING (true)
    WITH CHECK (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleOpenAddForm = () => {
    setEditingLogId(null);
    setTitle('');
    setVersion('v1.3.0');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('fitur_baru');
    setDescription('');
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (log: UpdateLog) => {
    setEditingLogId(log.id);
    setTitle(log.title);
    setVersion(log.version);
    setDate(log.date);
    setCategory(log.category);
    setDescription(log.description);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError(isId ? 'Judul pembaruan wajib diisi.' : 'Title is required.');
      return;
    }
    if (!description.trim()) {
      setFormError(isId ? 'Rincian deskripsi wajib diisi.' : 'Description is required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      title: title.trim(),
      version: version.trim() || 'v1.0.0',
      date: date || new Date().toISOString().split('T')[0],
      category,
      description: description.trim(),
    };

    if (editingLogId) {
      const res = await onUpdateLog(editingLogId, payload);
      if (!res.success) {
        setFormError(res.error || (isId ? 'Gagal menyimpan perubahan.' : 'Failed to save changes.'));
        setSubmitting(false);
        return;
      }
    } else {
      const res = await onAddLog(payload);
      if (!res.success) {
        setFormError(res.error || (isId ? 'Gagal menambah catatan.' : 'Failed to add log.'));
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(false);
    setIsFormOpen(false);
    setEditingLogId(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletionCandidate) return;
    await onDeleteLog(deletionCandidate.id);
    setDeletionCandidate(null);
  };

  const getCategoryMeta = (cat: UpdateLogCategory) => {
    switch (cat) {
      case 'fitur_baru':
        return {
          label: isId ? 'Fitur Baru' : 'New Feature',
          icon: Rocket,
          badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
        };
      case 'peningkatan':
        return {
          label: isId ? 'Peningkatan' : 'Improvement',
          icon: Zap,
          badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25',
        };
      case 'perbaikan':
        return {
          label: isId ? 'Perbaikan' : 'Bug Fix',
          icon: Wrench,
          badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/25',
        };
      case 'rencana':
        return {
          label: isId ? 'Rencana Roadmap' : 'Roadmap Plan',
          icon: Bookmark,
          badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/25',
        };
      default:
        return {
          label: cat,
          icon: Tag,
          badgeClass: 'bg-stone-500/15 text-stone-700 dark:text-stone-300 border-stone-500/25',
        };
    }
  };

  const filteredLogs = logs.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] dark:bg-[#1A1613] text-[#2D2823] dark:text-[#EAE3DA] rounded-2xl border border-[#E5DDD2] dark:border-[#38312B] shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E5DDD2] dark:border-[#38312B] flex items-center justify-between bg-[#FFFDF9] dark:bg-[#201B17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/20 flex items-center justify-center text-[#C85A32] shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
                  {isId ? 'Log Pembaruan & Roadmap' : 'Update Logs & Roadmap'}
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#C85A32]/15 text-[#C85A32]">
                  {logs.length} {isId ? 'Rilis' : 'Releases'}
                </span>
              </div>
              <p className="text-xs text-[#8F8275] dark:text-[#7A7067] mt-0.5">
                {isId
                  ? 'Catatan rilis fitur, perbaikan bug, dan rencana masa depan Notome'
                  : 'Release notes, recent improvements, and upcoming roadmap plans'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#8F8275] hover:text-[#2D2823] dark:hover:text-[#EAE3DA] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filter Pills Bar */}
        <div className="px-4 sm:px-5 py-3 border-b border-[#E5DDD2] dark:border-[#38312B] bg-[#FFFDF9]/60 dark:bg-[#201B17]/60 flex flex-wrap items-center justify-between gap-2.5">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-full">
            {[
              { id: 'all', label: isId ? 'Semua' : 'All' },
              { id: 'fitur_baru', label: isId ? 'Fitur Baru' : 'New Features' },
              { id: 'peningkatan', label: isId ? 'Peningkatan' : 'Improvements' },
              { id: 'perbaikan', label: isId ? 'Perbaikan' : 'Fixes' },
              { id: 'rencana', label: isId ? 'Rencana' : 'Roadmap' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSelectedCategory(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === f.id
                    ? 'bg-[#C85A32] text-white font-semibold shadow-xs'
                    : 'text-[#6F645A] dark:text-[#A89C90] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Admin Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isPrimaryAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setShowSql((v) => !v)}
                  className="px-2.5 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] text-xs font-medium text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] flex items-center gap-1 cursor-pointer transition-colors"
                  title="Lihat skrip SQL Supabase"
                >
                  <Database className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span className="hidden sm:inline">SQL</span>
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddForm}
                  className="px-3 py-1.5 rounded-lg bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B34B25] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isId ? 'Catat Pembaruan' : 'Add Update'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Optional Collapsible SQL Helper */}
        {showSql && isPrimaryAdmin && (
          <div className="p-4 bg-[#231E1A] text-[#E0D7CB] border-b border-[#38312B] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#C85A32]" />
                {isId ? 'Skrip SQL Tabel Update Logs (Supabase)' : 'Supabase SQL Table Script'}
              </span>
              <button
                type="button"
                onClick={handleCopySql}
                className="px-2.5 py-1 rounded-md bg-[#C85A32] text-white text-xs flex items-center gap-1 hover:bg-[#B34B25] cursor-pointer"
              >
                {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Disalin!' : 'Salin SQL'}</span>
              </button>
            </div>
            <pre className="font-mono text-[11px] p-2.5 rounded-lg bg-black/40 overflow-x-auto max-h-36 scrollbar-thin text-amber-200/90">
              {sqlSnippet}
            </pre>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-[#E0D7CB] dark:border-[#38312B] rounded-2xl text-xs text-[#8F8275]">
              {isId
                ? 'Belum ada catatan pembaruan untuk kategori ini.'
                : 'No update notes available for this category.'}
            </div>
          ) : (
            filteredLogs.map((item) => {
              const meta = getCategoryMeta(item.category);
              const CategoryIcon = meta.icon;
              const hasLiked = item.likedBy.some(
                (uid) => uid.toLowerCase() === userIdentifier.toLowerCase()
              );

              return (
                <article
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl border border-[#E5DDD2] dark:border-[#332B25] bg-[#FFFDF9] dark:bg-[#1E1915] shadow-xs hover:border-[#C85A32]/30 transition-all space-y-3"
                >
                  {/* Top Meta row */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/20">
                        {item.version}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md border font-medium flex items-center gap-1 ${meta.badgeClass}`}
                      >
                        <CategoryIcon className="w-3 h-3" />
                        <span>{meta.label}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#8F8275] font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#8F8275]" />
                      <span>{new Date(item.date).toLocaleDateString(isId ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Title & Author */}
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B241E] dark:text-[#EFE9E2] leading-snug">
                      {item.title}
                    </h3>
                    <div className="text-[11px] text-[#8F8275] dark:text-[#7A7067] mt-0.5">
                      {item.authorName || 'Mike Rafael (Primary Admin)'}
                    </div>
                  </div>

                  {/* Description / Content Body */}
                  <div className="text-xs sm:text-sm text-[#4E4339] dark:text-[#C5B8AA] leading-relaxed whitespace-pre-line border-l-2 border-[#C85A32]/30 pl-3 py-0.5">
                    {item.description}
                  </div>

                  {/* Footer Row: Like Button & Admin Action Buttons */}
                  <div className="pt-2 border-t border-[#EFE8DD] dark:border-[#2C241F] flex items-center justify-between gap-3">
                    {/* Interactive Like Button */}
                    <button
                      type="button"
                      onClick={() => onToggleLike(item.id, userIdentifier)}
                      className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer active:scale-95 touch-manipulation ${
                        hasLiked
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-xs'
                          : 'bg-[#FAF7F2] dark:bg-[#161311] border-[#E0D7CB] dark:border-[#38312B] text-[#6F645A] dark:text-[#A89C90] hover:text-rose-600 hover:border-rose-400'
                      }`}
                      title={hasLiked ? (isId ? 'Batalkan suka' : 'Unlike') : (isId ? 'Beri suka' : 'Like')}
                    >
                      <Heart
                        className={`w-4 h-4 transition-transform ${
                          hasLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                        }`}
                      />
                      <span>
                        {item.likesCount}{' '}
                        <span className="font-normal text-[11px]">
                          {isId ? 'Suka' : 'Likes'}
                        </span>
                      </span>
                    </button>

                    {/* Admin Actions */}
                    {isPrimaryAdmin && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditForm(item)}
                          className="p-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-[#FAF7F2] dark:bg-[#161311] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] text-xs text-[#594E44] dark:text-[#C5B8AA] flex items-center gap-1 cursor-pointer transition-colors"
                          title={isId ? 'Edit Catatan' : 'Edit Note'}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#8F8275]" />
                          <span className="hidden sm:inline">{isId ? 'Edit' : 'Edit'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletionCandidate(item)}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                          title={isId ? 'Hapus Catatan' : 'Delete Note'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">{isId ? 'Hapus' : 'Delete'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-[#E5DDD2] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#201B17] flex items-center justify-between text-xs text-[#8F8275]">
          <span>
            {isId ? 'Pembaruan otomatis dari Notome Team' : 'Official updates from Notome Team'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#EFE8DD] dark:bg-[#2E2822] text-[#2D2823] dark:text-[#EAE3DA] font-medium hover:bg-[#E5DDD2] cursor-pointer transition-colors"
          >
            {isId ? 'Tutup' : 'Close'}
          </button>
        </div>
      </div>

      {/* SUB-MODAL 1: ADD / EDIT FORM MODAL (CENTERED) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF7F2] dark:bg-[#1A1613] text-[#2D2823] dark:text-[#EAE3DA] rounded-2xl border border-[#E5DDD2] dark:border-[#38312B] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#E5DDD2] dark:border-[#38312B] flex items-center justify-between bg-[#FFFDF9] dark:bg-[#201B17]">
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                {editingLogId
                  ? isId
                    ? 'Edit Catatan Pembaruan'
                    : 'Edit Update Log'
                  : isId
                  ? 'Tambah Catatan Pembaruan Baru'
                  : 'Add New Update Log'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-[#8F8275] hover:text-[#2D2823] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-4 sm:p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA]">
                  {isId ? 'Judul Pembaruan / Rencana' : 'Update Title'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isId
                      ? 'Contoh: Perbaikan Responsif & Keamanan Hapus Data'
                      : 'E.g., Responsive Header & Delete Protection'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              {/* Version & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA]">
                    {isId ? 'Nomor Versi / Label' : 'Version / Label'}
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="v1.3.0 / Roadmap"
                    className="w-full px-3 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs font-mono focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA]">
                    {isId ? 'Tanggal' : 'Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA]">
                  {isId ? 'Kategori Pembaruan' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as UpdateLogCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
                >
                  <option value="fitur_baru">{isId ? '🚀 Fitur Baru' : '🚀 New Feature'}</option>
                  <option value="peningkatan">{isId ? '⚡ Peningkatan' : '⚡ Improvement'}</option>
                  <option value="perbaikan">{isId ? '🛠️ Perbaikan Bug' : '🛠️ Bug Fix'}</option>
                  <option value="rencana">{isId ? '📌 Rencana Roadmap' : '📌 Roadmap Plan'}</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA]">
                  {isId ? 'Rincian Penjelasan (Mendukung Multi-Baris)' : 'Description (Multi-line)'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isId
                      ? '• Detail poin pembaruan...\n• Apa saja yang diperbaiki...\n• Manfaat untuk anggota...'
                      : '• Key update points...\n• What has been improved...'
                  }
                  className="w-full px-3 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs leading-relaxed focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] text-xs font-medium hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] cursor-pointer"
                >
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B34B25] shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? isId
                      ? 'Menyimpan...'
                      : 'Saving...'
                    : isId
                    ? 'Simpan Pembaruan'
                    : 'Save Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: SIMPLE CENTERED DELETE CONFIRMATION DIALOG */}
      {deletionCandidate && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FAF7F2] dark:bg-[#1A1613] text-[#2D2823] dark:text-[#EAE3DA] rounded-2xl border border-[#E5DDD2] dark:border-[#38312B] shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm sm:text-base text-[#2B241E] dark:text-[#EFE9E2]">
                  {isId ? 'Hapus Catatan Pembaruan?' : 'Delete Update Log?'}
                </h4>
                <p className="text-xs text-[#8F8275] dark:text-[#7A7067] mt-0.5">
                  {deletionCandidate.title}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#594E44] dark:text-[#C5B8AA] leading-relaxed">
              {isId
                ? 'Catatan pembaruan ini akan dihapus dari riwayat publik anggota.'
                : 'This update note will be removed from the public changelog.'}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletionCandidate(null)}
                className="px-4 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] text-xs font-medium hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] cursor-pointer"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                {isId ? 'Hapus Sekarang' : 'Delete Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
