/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  UserPlus,
  Users,
  Search,
  Check,
  Copy,
  Trash2,
  Power,
  Database,
  ExternalLink,
  Sparkles,
  Mail,
  Send,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { InvitedUser } from '../../types';
import { Language } from '../../lib/translations';
import { PRIMARY_ADMIN_EMAIL } from '../../hooks/useAuth';
import {
  notifyMemberInvited,
  notifyMemberRemoved,
  getInviteEmailContent,
  getRemovalEmailContent,
  buildGmailComposeUrl,
  buildMailtoUrl,
} from '../../lib/memberNotifications';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  invitedUsers: InvitedUser[];
  onAddUser: (email: string, fullName?: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateStatus: (id: string, status: 'active' | 'revoked') => Promise<{ success: boolean; error?: string }>;
  onDeleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  language: Language;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  invitedUsers,
  onAddUser,
  onUpdateStatus,
  onDeleteUser,
  language,
}) => {
  const [tab, setTab] = useState<'list' | 'add' | 'sql'>('list');
  const [search, setSearch] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [autoNotifyGmail, setAutoNotifyGmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Notification banners after invite / revoke
  const [notificationBanner, setNotificationBanner] = useState<{
    type: 'invited' | 'removed';
    email: string;
    name?: string;
    gmailUrl: string;
    mailtoUrl: string;
  } | null>(null);

  // Deletion modal state
  const [deletionCandidate, setDeletionCandidate] = useState<{
    id: string;
    email: string;
    name?: string;
  } | null>(null);

  if (!isOpen) return null;

  const isId = language === 'id';

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setSubmitting(true);
    setErrorMsg(null);

    const emailTrimmed = newEmail.trim();
    const nameTrimmed = newName.trim() || undefined;
    const notesTrimmed = newNotes.trim() || undefined;

    const res = await onAddUser(emailTrimmed, nameTrimmed, notesTrimmed);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    } else {
      // Trigger notification helper
      const notifResult = await notifyMemberInvited(emailTrimmed, nameTrimmed);

      // Auto-open Gmail if requested by admin
      if (autoNotifyGmail && notifResult.gmailComposeUrl) {
        window.open(notifResult.gmailComposeUrl, '_blank', 'noopener,noreferrer');
      }

      setNotificationBanner({
        type: 'invited',
        email: emailTrimmed,
        name: nameTrimmed,
        gmailUrl: notifResult.gmailComposeUrl,
        mailtoUrl: notifResult.mailtoUrl,
      });

      setNewEmail('');
      setNewName('');
      setNewNotes('');
      setTab('list');
    }
    setSubmitting(false);
  };

  const handleCopyInviteMessage = (email: string, id: string, name?: string) => {
    const { body } = getInviteEmailContent(email, name);
    navigator.clipboard.writeText(body);
    setCopiedInviteId(id);
    setTimeout(() => setCopiedInviteId(null), 2500);
  };

  const handleConfirmDelete = async (withGmailNotification: boolean) => {
    if (!deletionCandidate) return;
    const { id, email, name } = deletionCandidate;

    const res = await onDeleteUser(id);
    if (res.success) {
      const notifResult = await notifyMemberRemoved(email, name);

      if (withGmailNotification && notifResult.gmailComposeUrl) {
        window.open(notifResult.gmailComposeUrl, '_blank', 'noopener,noreferrer');
      }

      setNotificationBanner({
        type: 'removed',
        email,
        name,
        gmailUrl: notifResult.gmailComposeUrl,
        mailtoUrl: notifResult.mailtoUrl,
      });
    }

    setDeletionCandidate(null);
  };

  const sqlMigrationCode = `-- Jalankan di Supabase Dashboard -> SQL Editor:
CREATE TABLE IF NOT EXISTS public.invited_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    notes TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('primary_admin', 'member')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
    invited_by TEXT DEFAULT 'mike777rafael@gmail.com',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

ALTER TABLE public.invited_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can check own invite status" ON public.invited_users
    FOR SELECT USING (
        LOWER(email) = LOWER(auth.jwt() ->> 'email')
        OR LOWER(auth.jwt() ->> 'email') = 'mike777rafael@gmail.com'
    );

CREATE POLICY "Primary Admin full control on invites" ON public.invited_users
    FOR ALL USING (
        LOWER(auth.jwt() ->> 'email') = 'mike777rafael@gmail.com'
    )
    WITH CHECK (
        LOWER(auth.jwt() ->> 'email') = 'mike777rafael@gmail.com'
    );

INSERT INTO public.invited_users (email, full_name, notes, role, status, invited_by)
VALUES ('mike777rafael@gmail.com', 'Mike Rafael', 'Primary Admin Permanen', 'primary_admin', 'active', 'system')
ON CONFLICT (email) DO UPDATE SET role = 'primary_admin', status = 'active';`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlMigrationCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const filteredUsers = invitedUsers.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      u.email.toLowerCase().includes(q) ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.notes && u.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] dark:bg-[#1A1613] text-[#2D2823] dark:text-[#EAE3DA] rounded-2xl border border-[#E5DDD2] dark:border-[#38312B] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E5DDD2] dark:border-[#38312B] flex items-center justify-between bg-[#FFFDF9] dark:bg-[#201B17]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/20 flex items-center justify-center text-[#C85A32]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
                  {isId ? 'Panel Akses & Notifikasi Anggota' : 'Admin Access & Member Notifications'}
                </h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#C85A32]/15 text-[#C85A32]">
                  Primary Admin
                </span>
              </div>
              <p className="text-xs text-[#8F8275] dark:text-[#7A7067] mt-0.5">
                {isId
                  ? 'Kelola pendaftaran anggota & kirim notifikasi Gmail resmi secara otomatis'
                  : 'Manage member whitelist & dispatch official Gmail notifications automatically'}
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

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-[#E5DDD2] dark:border-[#38312B] bg-[#FFFDF9]/60 dark:bg-[#201B17]/60 flex items-center gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTab('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              tab === 'list'
                ? 'bg-[#C85A32] text-white font-semibold shadow-xs'
                : 'text-[#6F645A] dark:text-[#A89C90] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{isId ? `Daftar Anggota (${invitedUsers.length})` : `Members (${invitedUsers.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('add')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              tab === 'add'
                ? 'bg-[#C85A32] text-white font-semibold shadow-xs'
                : 'text-[#6F645A] dark:text-[#A89C90] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isId ? 'Daftarkan Akun Baru' : 'Register New Account'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              tab === 'sql'
                ? 'bg-[#C85A32] text-white font-semibold shadow-xs'
                : 'text-[#6F645A] dark:text-[#A89C90] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isId ? 'Skrip SQL Supabase' : 'Supabase SQL Setup'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Notification Action Banner */}
          {notificationBanner && (
            <div
              className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 ${
                notificationBanner.type === 'invited'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">
                    {notificationBanner.type === 'invited'
                      ? isId
                        ? `Akun ${notificationBanner.email} berhasil didaftarkan!`
                        : `Account ${notificationBanner.email} successfully registered!`
                      : isId
                      ? `Akses untuk ${notificationBanner.email} telah dihapus.`
                      : `Access for ${notificationBanner.email} has been revoked.`}
                  </div>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {notificationBanner.type === 'invited'
                      ? isId
                        ? 'Pengguna kini diizinkan masuk. Kirim notifikasi email agar mereka langsung tahu.'
                        : 'User is now authorized. Send email notification so they know instantly.'
                      : isId
                      ? 'Pemberitahuan pencabutan akses dapat dikirimkan ke Gmail mereka.'
                      : 'You can notify the user via Gmail that their access was discontinued.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <a
                  href={notificationBanner.gmailUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#C85A32] text-white font-medium text-xs hover:bg-[#B34B25] flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isId ? 'Buka Gmail (1-Klik)' : 'Open Gmail (1-Click)'}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setNotificationBanner(null)}
                  className="p-1.5 opacity-60 hover:opacity-100 cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: LIST */}
          {tab === 'list' && (
            <div className="space-y-4">
              {/* Search Bar & Add Button */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8275]" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={isId ? 'Cari email atau nama anggota...' : 'Search email or member name...'}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setTab('add')}
                  className="px-3 py-2 rounded-xl bg-[#C85A32] text-white text-xs font-medium hover:bg-[#B34B25] flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isId ? 'Tambah' : 'Add'}</span>
                </button>
              </div>

              {/* Users List */}
              <div className="space-y-2.5">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#E0D7CB] dark:border-[#38312B] rounded-xl text-xs text-[#8F8275]">
                    {search
                      ? isId
                        ? 'Tidak ada akun yang cocok dengan pencarian.'
                        : 'No accounts matched your search.'
                      : isId
                      ? 'Belum ada akun yang didaftarkan. Klik "Daftarkan Akun Baru" di atas.'
                      : 'No accounts registered yet. Click "Register New Account" above.'}
                  </div>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelfAdmin = u.email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
                    const inviteContent = getInviteEmailContent(u.email, u.fullName);
                    const gmailComposeUrl = buildGmailComposeUrl(
                      u.email,
                      inviteContent.subject,
                      inviteContent.body
                    );

                    return (
                      <div
                        key={u.id}
                        className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          u.status === 'revoked'
                            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 opacity-75'
                            : isSelfAdmin
                            ? 'bg-[#C85A32]/5 border-[#C85A32]/25'
                            : 'bg-white dark:bg-[#201B17] border-[#E0D7CB] dark:border-[#38312B]'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2] truncate">
                              {u.email}
                            </span>
                            {isSelfAdmin ? (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#C85A32]/20 text-[#C85A32] font-semibold">
                                Primary Admin
                              </span>
                            ) : u.status === 'active' ? (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-semibold">
                                {isId ? 'Aktif' : 'Active'}
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold">
                                {isId ? 'Dinonaktifkan' : 'Revoked'}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#8F8275]">
                            {u.fullName && <span>{u.fullName}</span>}
                            {u.notes && (
                              <>
                                <span>·</span>
                                <span className="italic">{u.notes}</span>
                              </>
                            )}
                            <span>·</span>
                            <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          {/* Send Gmail Notification button */}
                          {!isSelfAdmin && (
                            <a
                              href={gmailComposeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-[#FAF7F2] dark:bg-[#161311] hover:bg-[#EFE8DD] text-xs text-[#594E44] dark:text-[#C5B8AA] flex items-center gap-1 cursor-pointer transition-colors"
                              title={isId ? 'Kirim notifikasi pendaftaran via Gmail' : 'Send invite email via Gmail'}
                            >
                              <Mail className="w-3.5 h-3.5 text-[#C85A32]" />
                              <span className="text-[10px] hidden sm:inline">
                                {isId ? 'Kirim Gmail' : 'Email'}
                              </span>
                            </a>
                          )}

                          {/* Copy invite text */}
                          {!isSelfAdmin && (
                            <button
                              type="button"
                              onClick={() => handleCopyInviteMessage(u.email, u.id, u.fullName)}
                              className="p-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-[#FAF7F2] dark:bg-[#161311] hover:bg-[#EFE8DD] text-xs text-[#594E44] dark:text-[#C5B8AA] flex items-center gap-1 cursor-pointer transition-colors"
                              title={
                                isId
                                  ? 'Salin pesan konfirmasi undangan (untuk WhatsApp/chat)'
                                  : 'Copy invite text to clipboard'
                              }
                            >
                              {copiedInviteId === u.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-[#8F8275]" />
                              )}
                              <span className="text-[10px] hidden sm:inline">
                                {copiedInviteId === u.id ? (isId ? 'Disalin' : 'Copied') : isId ? 'Salin' : 'Copy'}
                              </span>
                            </button>
                          )}

                          {/* Toggle active / revoked */}
                          {!isSelfAdmin && (
                            <button
                              type="button"
                              onClick={() => onUpdateStatus(u.id, u.status === 'active' ? 'revoked' : 'active')}
                              className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                                u.status === 'active'
                                  ? 'border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                  : 'border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                              }`}
                              title={u.status === 'active' ? 'Bekukan / Nonaktifkan akses' : 'Aktifkan kembali akses'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete permanently (Triggers confirmation modal) */}
                          {!isSelfAdmin && (
                            <button
                              type="button"
                              onClick={() =>
                                setDeletionCandidate({
                                  id: u.id,
                                  email: u.email,
                                  name: u.fullName,
                                })
                              }
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors"
                              title={isId ? 'Hapus akses akun' : 'Delete user access'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ADD USER */}
          {tab === 'add' && (
            <form onSubmit={handleAddSubmit} className="space-y-4 max-w-lg mx-auto py-2">
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                  {isId ? 'Daftarkan Akun Google / Anggota Baru' : 'Authorize New Google / Member Account'}
                </h3>
                <p className="text-xs text-[#8F8275]">
                  {isId
                    ? 'Setelah didaftarkan, pengguna dapat langsung login ke Notome menggunakan tombol Google mereka.'
                    : 'Once authorized, the user can immediately sign in to Notome using their Google identity.'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#594E44] dark:text-[#C5B8AA] mb-1">
                  {isId ? 'Alamat Gmail Anggota *' : 'Member Gmail Address *'}
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="teman@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs font-mono focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#594E44] dark:text-[#C5B8AA] mb-1">
                  {isId ? 'Nama Lengkap / Panggilan (Opsional)' : 'Full Name / Nickname (Optional)'}
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#594E44] dark:text-[#C5B8AA] mb-1">
                  {isId ? 'Catatan Internal (Opsional)' : 'Internal Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Kolega / Sahabat"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>

              {/* Automatic Gmail Notification Checkbox */}
              <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E0D7CB] dark:border-[#38312B]">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoNotifyGmail}
                    onChange={(e) => setAutoNotifyGmail(e.target.checked)}
                    className="mt-0.5 accent-[#C85A32] rounded"
                  />
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#C85A32]" />
                      <span>{isId ? 'Buka Gmail otomatis untuk kirim notifikasi' : 'Automatically open Gmail to notify member'}</span>
                    </span>
                    <p className="text-[11px] text-[#8F8275]">
                      {isId
                        ? 'Setelah disimpan, tab Gmail akan terbuka dengan draf pesan resmi Notome berisi link login yang siap Anda kirimkan.'
                        : 'After saving, a Gmail tab will open with the official invite letter ready to send.'}
                    </p>
                  </div>
                </label>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTab('list')}
                  className="flex-1 py-2.5 rounded-xl border border-[#D5CBC0] dark:border-[#403832] text-xs font-medium hover:bg-[#EFE8DD] transition-colors cursor-pointer"
                >
                  {isId ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-[#C85A32] text-white text-xs font-medium hover:bg-[#B34B25] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {submitting
                      ? isId
                        ? 'Mendaftarkan...'
                        : 'Registering...'
                      : isId
                      ? 'Daftarkan & Kirim Notifikasi'
                      : 'Authorize & Notify'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SQL MIGRATION INSTRUCTIONS */}
          {tab === 'sql' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F4ECE3]/70 dark:bg-[#25201C] border border-[#E0D7CB] dark:border-[#38312B] space-y-1.5">
                <div className="font-semibold text-[#C85A32] flex items-center gap-1.5">
                  <Database className="w-4 h-4" />
                  <span>{isId ? 'Sinkronisasi Tabel Whitelist ke Supabase' : 'Sync Whitelist Table to Supabase'}</span>
                </div>
                <p className="text-[#594E44] dark:text-[#C5B8AA] leading-relaxed">
                  {isId
                    ? 'Aplikasi telah memiliki proteksi ganda (frontend & lokal). Agar sinkronisasi cloud Supabase berfungsi sempurna, cukup salin dan jalankan skrip SQL berikut di Supabase SQL Editor proyek Anda:'
                    : 'The app has dual protection (frontend & local). To enable cloud sync on Supabase, simply copy and execute this SQL script in your Supabase SQL Editor:'}
                </p>
                <div className="pt-1">
                  <a
                    href="https://supabase.com/dashboard/project/zkakakhaorbdwvnvjtco/sql"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#C85A32] font-semibold underline hover:text-[#B34B25]"
                  >
                    <span>{isId ? 'Buka Supabase SQL Editor Proyek Anda' : 'Open Supabase SQL Editor'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="absolute right-2.5 top-2.5 px-2.5 py-1 rounded-lg bg-[#2B241E] text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer hover:bg-[#403832] transition-colors"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? (isId ? 'Disalin!' : 'Copied!') : (isId ? 'Salin Skrip' : 'Copy SQL')}</span>
                </button>
                <pre className="p-4 rounded-xl bg-[#1E1B18] text-[#F3EFEA] font-mono text-[11px] overflow-x-auto leading-relaxed border border-[#38312B]">
                  {sqlMigrationCode}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation & Notification Modal for Deleting User */}
      {deletionCandidate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FFFDF9] dark:bg-[#1E1916] rounded-2xl border border-rose-200 dark:border-rose-900/50 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                  {isId ? 'Cabut Akses Pengguna?' : 'Revoke User Access?'}
                </h3>
                <p className="text-xs text-[#8F8275]">{deletionCandidate.email}</p>
              </div>
            </div>

            <p className="text-xs text-[#594E44] dark:text-[#C5B8AA] leading-relaxed">
              {isId
                ? 'Akun ini tidak akan lagi dapat login ke Notome. Anda dapat menghapus sekaligus membuka Gmail untuk mengirimkan pemberitahuan resmi bahwa akses mereka telah dinonaktifkan.'
                : 'This account will no longer be permitted to log in. You can remove access and automatically open Gmail to inform them.'}
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmDelete(true)}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isId ? 'Hapus & Beri Tahu via Gmail' : 'Delete & Notify via Gmail'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmDelete(false)}
                className="w-full py-2 rounded-xl border border-[#D5CBC0] dark:border-[#403832] text-xs font-medium text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#EFE8DD] dark:hover:bg-[#25201C] cursor-pointer transition-colors"
              >
                <span>{isId ? 'Hapus Saja (Tanpa Notifikasi)' : 'Delete Silently (No Email)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setDeletionCandidate(null)}
                className="w-full py-1.5 text-xs text-[#8F8275] hover:text-[#2D2823] cursor-pointer text-center"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
