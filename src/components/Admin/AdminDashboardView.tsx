/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
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
  RefreshCw,
  ShieldAlert,
  Download,
  FileSpreadsheet,
  Activity,
  Layers,
  Radio,
  Clock,
  UserX,
  UserCheck,
} from 'lucide-react';
import { InvitedUser } from '../../types';
import { Language } from '../../lib/translations';
import { checkIsAdmin } from '../../hooks/useAuth';
import {
  notifyMemberInvited,
  notifyMemberRemoved,
  getInviteEmailContent,
  buildMailtoUrl,
  openNativeGmailApp,
} from '../../lib/memberNotifications';

export interface AdminDashboardViewProps {
  onBack: () => void;
  previousTabName?: string;
  invitedUsers: InvitedUser[];
  onAddUser: (email: string, fullName?: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateStatus: (id: string, status: 'active' | 'revoked') => Promise<{ success: boolean; error?: string }>;
  onDeleteUser: (id: string) => Promise<{ success: boolean; error?: string }>;
  onRefresh?: () => Promise<void>;
  language: Language;
  isMaintenance?: boolean;
  maintenanceReason?: string;
  onToggleMaintenance?: (enabled: boolean, reason?: string) => void;
  adminEmail?: string;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onBack,
  previousTabName,
  invitedUsers,
  onAddUser,
  onUpdateStatus,
  onDeleteUser,
  onRefresh,
  language,
  isMaintenance = false,
  maintenanceReason = '',
  onToggleMaintenance,
  adminEmail = 'mike777rafael@gmail.com',
}) => {
  const [tab, setTab] = useState<'members' | 'add' | 'maintenance' | 'database'>('members');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const [customReason, setCustomReason] = useState(maintenanceReason);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Form states for adding user
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [autoNotifyGmail, setAutoNotifyGmail] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Feedback states
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Notification action banner after invite or revoke
  const [notificationBanner, setNotificationBanner] = useState<{
    type: 'invited' | 'removed';
    email: string;
    name?: string;
    automated: boolean;
    message: string;
    subject?: string;
    body?: string;
  } | null>(null);

  // Deletion modal confirmation
  const [deletionCandidate, setDeletionCandidate] = useState<{
    id: string;
    email: string;
    name?: string;
  } | null>(null);

  const isId = language === 'id';

  // KPI Metrics Calculations
  const totalMembers = invitedUsers.length;
  const activeMembers = invitedUsers.filter((u) => u.status === 'active').length;
  const revokedMembers = invitedUsers.filter((u) => u.status === 'revoked').length;

  const handleRefreshData = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
      setStatusMessage(isId ? 'Data anggota berhasil disinkronkan live.' : 'Member data successfully refreshed.');
    } catch {
      setStatusMessage(isId ? 'Gagal menyinkronkan data.' : 'Failed to refresh data.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

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
      const notifResult = await notifyMemberInvited(emailTrimmed, nameTrimmed);

      if (!notifResult.automated && autoNotifyGmail) {
        openNativeGmailApp(emailTrimmed, notifResult.subject || '', notifResult.body || '');
      }

      setNotificationBanner({
        type: 'invited',
        email: emailTrimmed,
        name: nameTrimmed,
        automated: notifResult.automated,
        message: notifResult.message,
        subject: notifResult.subject,
        body: notifResult.body,
      });

      setNewEmail('');
      setNewName('');
      setNewNotes('');
      setTab('members');
      setStatusMessage(
        isId
          ? `Akun ${emailTrimmed} berhasil didaftarkan ke whitelist.`
          : `Account ${emailTrimmed} authorized successfully.`
      );
      setTimeout(() => setStatusMessage(null), 3500);
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

      if (!notifResult.automated && withGmailNotification) {
        openNativeGmailApp(email, notifResult.subject || '', notifResult.body || '');
      }

      setNotificationBanner({
        type: 'removed',
        email,
        name,
        automated: notifResult.automated,
        message: notifResult.message,
        subject: notifResult.subject,
        body: notifResult.body,
      });

      setStatusMessage(
        isId
          ? `Akses untuk ${email} telah dihapus permanen.`
          : `Access for ${email} has been permanently deleted.`
      );
      setTimeout(() => setStatusMessage(null), 3500);
    }

    setDeletionCandidate(null);
  };

  // Crucial Feature: Export Members to CSV
  const handleExportCSV = () => {
    if (invitedUsers.length === 0) return;

    const headers = ['ID', 'Email', 'Full Name', 'Role', 'Status', 'Notes', 'Created At', 'Invited By'];
    const rows = invitedUsers.map((u) => [
      `"${u.id}"`,
      `"${u.email}"`,
      `"${u.fullName || ''}"`,
      `"${u.role || 'member'}"`,
      `"${u.status}"`,
      `"${(u.notes || '').replace(/"/g, '""')}"`,
      `"${new Date(u.createdAt).toISOString()}"`,
      `"${u.invitedBy || 'mike777rafael@gmail.com'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notomee-members-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setStatusMessage(isId ? 'Daftar audit anggota berhasil diunduh (CSV).' : 'Member audit list exported (CSV).');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // SQL Migration Code
  const sqlMigrationCode = `-- Jalankan di Supabase Dashboard -> SQL Editor:
-- 1. Tabel Anggota Whitelist (Hanya mike777rafael@gmail.com sebagai Primary Admin)
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
VALUES 
    ('mike777rafael@gmail.com', 'Mike Rafael', 'Primary Admin Permanen', 'primary_admin', 'active', 'system')
ON CONFLICT (email) DO UPDATE SET role = 'primary_admin', status = 'active';

-- 2. Mode Pemeliharaan Global (app_settings)
CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read app_settings" ON public.app_settings;
CREATE POLICY "Anyone can read app_settings" ON public.app_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Primary Admin can manage app_settings" ON public.app_settings;
CREATE POLICY "Primary Admin can manage app_settings" ON public.app_settings
    FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'mike777rafael@gmail.com')
    WITH CHECK (LOWER(auth.jwt() ->> 'email') = 'mike777rafael@gmail.com');

INSERT INTO public.app_settings (key, value, updated_by)
VALUES ('maintenance', '{"isEnabled": false, "reason": ""}'::jsonb, 'mike777rafael@gmail.com')
ON CONFLICT (key) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.app_settings;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlMigrationCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Filtered User list
  const filteredUsers = invitedUsers.filter((u) => {
    const q = search.toLowerCase().trim();
    const matchQuery =
      !q ||
      u.email.toLowerCase().includes(q) ||
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.notes && u.notes.toLowerCase().includes(q));

    if (!matchQuery) return false;

    if (statusFilter === 'active') return u.status === 'active';
    if (statusFilter === 'revoked') return u.status === 'revoked';
    return true;
  });

  return (
    <div className="max-w-5xl w-full mx-auto pb-20 space-y-6 animate-in fade-in duration-200">
      {/* 1. Top Navigation & Return Bar - Full Width Horizontal Button */}
      <div className="pb-4 border-b border-[#E0D7CB] dark:border-[#38312B]">
        <button
          type="button"
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#201B17] hover:bg-[#F4ECE3] dark:hover:bg-[#28221D] text-[#594E44] dark:text-[#C5B8AA] font-semibold text-sm transition-all active:scale-[0.99] cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#C85A32] shrink-0" />
          <span>
            {isId
              ? `Kembali ke ${previousTabName || 'Modul'}`
              : `Back to ${previousTabName || 'Module'}`}
          </span>
        </button>
      </div>

      {/* 2. Executive Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#C85A32]/10 border border-[#C85A32]/25 flex items-center justify-center text-[#C85A32]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
                  {isId ? 'Panel Eksekutif Admin' : 'Executive Admin Dashboard'}
                </h1>
                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-[#C85A32]/15 text-[#C85A32]">
                  Primary Admin
                </span>
              </div>
              <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] font-mono mt-0.5">
                {adminEmail} · {isId ? 'Otoritas Pengendali Penuh Santuari' : 'Full Sanctuary Authority'}
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
          {onRefresh && (
            <button
              type="button"
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="px-3.5 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#201B17] hover:bg-[#F4ECE3] dark:hover:bg-[#28221D] text-[#594E44] dark:text-[#C5B8AA] font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C85A32] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isId ? 'Sinkronkan Live' : 'Refresh Live'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#201B17] hover:bg-[#F4ECE3] dark:hover:bg-[#28221D] text-[#594E44] dark:text-[#C5B8AA] font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title={isId ? 'Unduh daftar anggota dalam format CSV' : 'Export member directory to CSV'}
          >
            <Download className="w-3.5 h-3.5 text-[#8C6D4F]" />
            <span>{isId ? 'Ekspor CSV' : 'Export CSV'}</span>
          </button>
        </div>
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl border border-[#5B7A58]/35 bg-[#5B7A58]/15 text-[#324C30] dark:text-[#92C48E] text-[13px] flex items-center gap-2.5 shadow-xs animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#5B7A58]" />
          <span className="font-medium">{statusMessage}</span>
        </div>
      )}

      {/* 3. Executive KPI Metric Strip (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Registered */}
        <div className="p-4 sm:p-4.5 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#7B6F63] dark:text-[#9F9184]">
            <span className="font-medium">{isId ? 'Total Whitelist' : 'Total Whitelist'}</span>
            <Users className="w-4 h-4 text-[#C85A32]" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-[#2B241E] dark:text-[#EFE9E2]">
            {totalMembers}
          </div>
          <p className="text-[11px] text-[#8F8275] dark:text-[#7A7067]">
            {isId ? 'Akun Google terotorisasi' : 'Authorized Google accounts'}
          </p>
        </div>

        {/* Metric 2: Active Members */}
        <div className="p-4 sm:p-4.5 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#7B6F63] dark:text-[#9F9184]">
            <span className="font-medium">{isId ? 'Akses Aktif' : 'Active Access'}</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {activeMembers}
          </div>
          <p className="text-[11px] text-[#8F8275] dark:text-[#7A7067]">
            {isId ? 'Dapat login dan sinkron' : 'Can log in & sync freely'}
          </p>
        </div>

        {/* Metric 3: Revoked / Frozen */}
        <div className="p-4 sm:p-4.5 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#7B6F63] dark:text-[#9F9184]">
            <span className="font-medium">{isId ? 'Dinonaktifkan' : 'Revoked'}</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
            {revokedMembers}
          </div>
          <p className="text-[11px] text-[#8F8275] dark:text-[#7A7067]">
            {isId ? 'Akses ditangguhkan' : 'Temporarily suspended'}
          </p>
        </div>

        {/* Metric 4: System Status */}
        <div
          className={`p-4 sm:p-4.5 rounded-2xl border shadow-xs space-y-1.5 transition-colors ${
            isMaintenance
              ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20'
              : 'border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]'
          }`}
        >
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-[#7B6F63] dark:text-[#9F9184]">
              {isId ? 'Status Santuari' : 'Sanctuary State'}
            </span>
            <ShieldAlert className={`w-4 h-4 ${isMaintenance ? 'text-rose-600' : 'text-emerald-600'}`} />
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isMaintenance ? 'bg-rose-600 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span className="font-serif text-sm sm:text-base font-bold truncate text-[#2B241E] dark:text-[#EFE9E2]">
              {isMaintenance
                ? isId
                  ? 'Maintenance Aktif'
                  : 'Maintenance Active'
                : isId
                ? 'Sistem Normal'
                : 'System Normal'}
            </span>
          </div>
          <p className="text-[11px] text-[#8F8275] dark:text-[#7A7067]">
            {isMaintenance
              ? isId
                ? 'Akses anggota dijeda'
                : 'Members held on notice'
              : isId
              ? 'Akses terbuka penuh'
              : 'Open for all members'}
          </p>
        </div>
      </div>

      {/* 4. Tab Segmented Navigation Bar */}
      <div className="flex border-b border-[#E0D7CB] dark:border-[#38312B] gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setTab('members')}
          className={`pb-3 px-2 font-semibold text-[13.5px] sm:text-[14.5px] transition-colors border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            tab === 'members'
              ? 'border-[#C85A32] text-[#C85A32]'
              : 'border-transparent text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isId ? `Daftar Anggota (${invitedUsers.length})` : `Members (${invitedUsers.length})`}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('add')}
          className={`pb-3 px-2 font-semibold text-[13.5px] sm:text-[14.5px] transition-colors border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            tab === 'add'
              ? 'border-[#C85A32] text-[#C85A32]'
              : 'border-transparent text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>{isId ? 'Daftarkan Akun Baru' : 'Register New Member'}</span>
        </button>

        <button
          type="button"
          onClick={() => setTab('maintenance')}
          className={`pb-3 px-2 font-semibold text-[13.5px] sm:text-[14.5px] transition-colors border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            tab === 'maintenance'
              ? isMaintenance
                ? 'border-rose-600 text-rose-600'
                : 'border-[#C85A32] text-[#C85A32]'
              : isMaintenance
              ? 'border-transparent text-rose-600 dark:text-rose-400'
              : 'border-transparent text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isId ? 'Mode Pemeliharaan (Pause)' : 'Maintenance Mode'}</span>
          {isMaintenance && <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />}
        </button>

        <button
          type="button"
          onClick={() => setTab('database')}
          className={`pb-3 px-2 font-semibold text-[13.5px] sm:text-[14.5px] transition-colors border-b-2 cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
            tab === 'database'
              ? 'border-[#C85A32] text-[#C85A32]'
              : 'border-transparent text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{isId ? 'Skrip SQL & Keamanan' : 'Supabase SQL'}</span>
        </button>
      </div>

      {/* 5. Notification Action Banner */}
      {notificationBanner && (
        <div
          className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 ${
            notificationBanner.type === 'invited'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <div className="font-semibold flex items-center gap-1.5 flex-wrap">
                <span>
                  {notificationBanner.type === 'invited'
                    ? isId
                      ? `Akun ${notificationBanner.email} berhasil didaftarkan!`
                      : `Account ${notificationBanner.email} successfully authorized!`
                    : isId
                    ? `Akses untuk ${notificationBanner.email} telah dihapus.`
                    : `Access for ${notificationBanner.email} has been revoked.`}
                </span>
                {notificationBanner.automated && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                    {isId ? '🚀 Terkirim Otomatis' : '🚀 Auto Sent'}
                  </span>
                )}
              </div>
              <p className="text-[11.5px] opacity-90 mt-0.5">
                {notificationBanner.automated
                  ? isId
                    ? `Email resmi Notomee telah dikirimkan otomatis ke ${notificationBanner.email}.`
                    : `Official email has been automatically sent in the background to ${notificationBanner.email}.`
                  : notificationBanner.type === 'invited'
                  ? isId
                    ? 'Pengguna kini diizinkan masuk. Anda dapat membuka Gmail dalam 1 klik untuk mengirimkan surat resmi.'
                    : 'User is authorized. You can dispatch the invite via Gmail in 1 click.'
                  : isId
                  ? 'Akses telah dihapus. Anda dapat membuka Gmail untuk mengabari pengguna.'
                  : 'Access revoked. You can open Gmail to inform the user.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {!notificationBanner.automated && (
              <button
                type="button"
                onClick={() =>
                  openNativeGmailApp(
                    notificationBanner.email,
                    notificationBanner.subject || '',
                    notificationBanner.body || ''
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-[#C85A32] text-white font-semibold text-xs hover:bg-[#B34B25] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isId ? 'Buka Aplikasi Gmail' : 'Open Gmail App'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setNotificationBanner(null)}
              className="p-1.5 opacity-60 hover:opacity-100 cursor-pointer"
              title="Tutup"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 6. TAB CONTENT PANES */}

      {/* TAB 1: MEMBERS DIRECTORY */}
      {tab === 'members' && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Status Filters, Add Shortcut */}
          <div className="p-4 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8F8275]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isId ? 'Cari alamat Gmail, nama, atau catatan...' : 'Search email, member name, or notes...'}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs sm:text-[13px] font-sans focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>

            {/* Status Filter Segment */}
            <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] dark:bg-[#201B17] rounded-xl border border-[#E0D7CB] dark:border-[#38312B]">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white dark:bg-[#2A231D] text-[#C85A32] shadow-xs'
                    : 'text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
                }`}
              >
                {isId ? 'Semua' : 'All'} ({invitedUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-white dark:bg-[#2A231D] text-emerald-600 shadow-xs'
                    : 'text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
                }`}
              >
                {isId ? 'Aktif' : 'Active'} ({activeMembers})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('revoked')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === 'revoked'
                    ? 'bg-white dark:bg-[#2A231D] text-rose-600 shadow-xs'
                    : 'text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
                }`}
              >
                {isId ? 'Dinonaktifkan' : 'Revoked'} ({revokedMembers})
              </button>
            </div>

            {/* Add User Shortcut Button */}
            <button
              type="button"
              onClick={() => setTab('add')}
              className="py-2.5 px-4 rounded-xl bg-[#C85A32] hover:bg-[#B34B25] text-white font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isId ? 'Daftarkan Anggota' : 'Add Member'}</span>
            </button>
          </div>

          {/* Members Table / Card Grid */}
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-[#E0D7CB] dark:border-[#38312B] rounded-2xl bg-[#FFFDF9]/60 dark:bg-[#1C1815]/60 text-xs sm:text-[13px] text-[#8F8275] space-y-3">
                <Users className="w-8 h-8 text-[#C85A32]/40 mx-auto" />
                <p>
                  {search
                    ? isId
                      ? 'Tidak ada akun yang sesuai dengan pencarian Anda.'
                      : 'No accounts matched your search.'
                    : isId
                    ? 'Belum ada anggota yang didaftarkan. Klik tombol Daftarkan Anggota di atas.'
                    : 'No members registered yet. Click Add Member above.'}
                </p>
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isSelfAdmin = checkIsAdmin(u.email);
                const inviteContent = getInviteEmailContent(u.email, u.fullName);

                return (
                  <div
                    key={u.id}
                    className={`p-4 sm:p-4.5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5 shadow-2xs ${
                      u.status === 'revoked'
                        ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 opacity-80'
                        : isSelfAdmin
                        ? 'bg-[#C85A32]/5 border-[#C85A32]/30'
                        : 'bg-[#FFFDF9] dark:bg-[#1C1815] border-[#E4DCDB] dark:border-[#352F2B]'
                    }`}
                  >
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-[13px] sm:text-sm font-semibold text-[#2B241E] dark:text-[#EFE9E2] truncate">
                          {u.email}
                        </span>

                        {isSelfAdmin ? (
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#C85A32]/20 text-[#C85A32] font-bold">
                            Primary Admin
                          </span>
                        ) : u.status === 'active' ? (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{isId ? 'Aktif' : 'Active'}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            <span>{isId ? 'Dinonaktifkan' : 'Revoked'}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#7B6F63] dark:text-[#9F9184]">
                        {u.fullName && <span className="font-medium text-[#2B241E] dark:text-[#EFE9E2]">{u.fullName}</span>}
                        {u.notes && (
                          <>
                            <span>·</span>
                            <span className="italic">{u.notes}</span>
                          </>
                        )}
                        <span>·</span>
                        <span className="font-mono tabular-nums">
                          {new Date(u.createdAt).toLocaleDateString(isId ? 'id-ID' : 'en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      {!isSelfAdmin && (
                        <>
                          {/* Send Gmail Notification */}
                          <button
                            type="button"
                            onClick={() =>
                              openNativeGmailApp(u.email, inviteContent.subject, inviteContent.body)
                            }
                            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#201B17] hover:bg-[#F4ECE3] dark:hover:bg-[#28221D] text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA] flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                            title={isId ? 'Buka aplikasi Gmail untuk kirim surat undangan' : 'Open Gmail app to send invite'}
                          >
                            <Mail className="w-3.5 h-3.5 text-[#C85A32]" />
                            <span className="hidden sm:inline">{isId ? 'Kirim Gmail' : 'Send Gmail'}</span>
                          </button>

                          {/* Copy Invite Message to clipboard */}
                          <button
                            type="button"
                            onClick={() => handleCopyInviteMessage(u.email, u.id, u.fullName)}
                            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#201B17] hover:bg-[#F4ECE3] dark:hover:bg-[#28221D] text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA] flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                            title={isId ? 'Salin surat undangan untuk dikirim via WhatsApp/Chat' : 'Copy invite letter text'}
                          >
                            {copiedInviteId === u.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-[#8F8275]" />
                            )}
                            <span className="hidden sm:inline">
                              {copiedInviteId === u.id ? (isId ? 'Disalin!' : 'Copied!') : (isId ? 'Salin Surat' : 'Copy Letter')}
                            </span>
                          </button>

                          {/* Toggle Active / Revoked */}
                          <button
                            type="button"
                            onClick={() => onUpdateStatus(u.id, u.status === 'active' ? 'revoked' : 'active')}
                            className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-colors shadow-2xs ${
                              u.status === 'active'
                                ? 'border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                                : 'border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            }`}
                            title={u.status === 'active' ? 'Nonaktifkan akses anggota' : 'Aktifkan kembali akses anggota'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          {/* Permanent Deletion */}
                          <button
                            type="button"
                            onClick={() =>
                              setDeletionCandidate({
                                id: u.id,
                                email: u.email,
                                name: u.fullName,
                              })
                            }
                            className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer transition-colors shadow-2xs"
                            title={isId ? 'Hapus akun dari whitelist' : 'Delete user from whitelist'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REGISTER NEW MEMBER */}
      {tab === 'add' && (
        <div className="max-w-2xl mx-auto p-5 sm:p-6 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs space-y-5">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#2B241E] dark:text-[#EFE9E2] flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#C85A32]" />
              <span>{isId ? 'Otorisasi & Daftarkan Anggota Baru' : 'Authorize New Member Account'}</span>
            </h3>
            <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] leading-relaxed">
              {isId
                ? 'Setelah didaftarkan, alamat Gmail ini akan langsung diizinkan masuk ke santuari Notomee menggunakan tombol Sign-in Google.'
                : 'Once registered, this Gmail address will be immediately whitelisted to sign in to Notomee using Google OAuth.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA] mb-1.5">
                {isId ? 'Alamat Gmail Anggota *' : 'Member Gmail Address *'}
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="nama@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs sm:text-sm font-mono focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA] mb-1.5">
                {isId ? 'Nama Lengkap / Panggilan (Opsional)' : 'Full Name / Nickname (Optional)'}
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Budi Pratama"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs sm:text-sm focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA] mb-1.5">
                {isId ? 'Catatan Internal / Relasi (Opsional)' : 'Internal Notes / Relationship (Optional)'}
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Sahabat dekat / Kolega riset"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs sm:text-sm focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>

            {/* Auto Gmail Notification Option */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E0D7CB] dark:border-[#38312B]">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoNotifyGmail}
                  onChange={(e) => setAutoNotifyGmail(e.target.checked)}
                  className="mt-0.5 accent-[#C85A32] rounded w-4 h-4"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>{isId ? 'Buka Gmail otomatis untuk mengirim surat undangan resmi' : 'Automatically open Gmail with official invite draft'}</span>
                  </span>
                  <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184]">
                    {isId
                      ? 'Setelah tombol didaftarkan, tab Gmail akan terbuka dengan subjek dan surat sambutan personal Notomee yang sudah terisi rapi.'
                      : 'After registration, a Gmail compose window opens with prefilled greeting and login link.'}
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTab('members')}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#F4ECE3] dark:hover:bg-[#28221D] transition-colors cursor-pointer"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B34B25] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {submitting
                    ? isId
                      ? 'Mendaftarkan...'
                      : 'Authorizing...'
                    : isId
                    ? 'Daftarkan & Buka Notifikasi'
                    : 'Authorize & Notify'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: SYSTEM MAINTENANCE & LIVE BROADCAST PREVIEW */}
      {tab === 'maintenance' && (
        <div className="space-y-5">
          {/* Main Pause Toggle Card */}
          <div
            className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-xs ${
              isMaintenance
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
                : 'bg-[#FFFDF9] dark:bg-[#1C1815] border-[#E4DCDB] dark:border-[#352F2B]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#7B6F63] block">
                  {isId ? 'Kontrol Status Global Santuari' : 'Global Sanctuary Availability'}
                </span>
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${
                      isMaintenance ? 'bg-rose-600 animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                    {isMaintenance
                      ? isId
                        ? 'Mode Pemeliharaan AKTIF (Aplikasi Dijeda)'
                        : 'Maintenance Mode ACTIVE (App Paused)'
                      : isId
                      ? 'Sistem Berjalan Normal (Akses Terbuka)'
                      : 'System Running Normally (Open Access)'}
                  </h3>
                </div>
                <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] leading-relaxed max-w-2xl">
                  {isMaintenance
                    ? isId
                      ? 'Seluruh pengguna umum dan anggota terdaftar akan tertahan di layar Maintenance. Anda sebagai Primary Admin tetap memiliki akses penuh tanpa gangguan.'
                      : 'All non-admin members are held on the Maintenance holding screen. You maintain unrestricted administrative access.'
                    : isId
                    ? 'Seluruh modul (Serial & Film, Nutrisi, Peliharaan, Kalender, Catatan, Mimpi) dapat diakses dengan normal oleh anggota whitelist.'
                    : 'All application pillars are openly accessible by whitelisted users.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onToggleMaintenance) {
                    onToggleMaintenance(!isMaintenance, customReason);
                    setStatusMessage(
                      !isMaintenance
                        ? isId
                          ? 'Mode Pemeliharaan aktif & tersinkronisasi ke Cloud. Semua perangkat anggota kini tertahan di layar maintenance.'
                          : 'Maintenance Mode activated. Member access paused.'
                        : isId
                        ? 'Mode Pemeliharaan dinonaktifkan. Akses santuari kembali dibuka normal.'
                        : 'Maintenance Mode disabled. Sanctuary resumed.'
                    );
                    setTimeout(() => setStatusMessage(null), 4000);
                  }
                }}
                className={`py-3 px-5 rounded-xl text-xs sm:text-[13px] font-bold shadow-xs transition-all active:scale-95 shrink-0 cursor-pointer flex items-center justify-center gap-2 ${
                  isMaintenance
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-rose-600 hover:bg-rose-700 text-white'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>
                  {isMaintenance
                    ? isId
                      ? 'Buka Kembali Akses Normal'
                      : 'Resume Open Access'
                    : isId
                    ? 'Jeda Akses Santuari Sekarang'
                    : 'Pause Sanctuary Now'}
                </span>
              </button>
            </div>
          </div>

          {/* Announcement Message Editor & Quick Presets */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs sm:text-[13px] font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                {isId ? 'Teks Pengumuman untuk Anggota' : 'Announcement Notice for Members'}
              </label>
              <span className="text-[11px] text-[#8F8275] font-mono">
                {isId ? 'Pesan siaran langsung' : 'Live broadcast text'}
              </span>
            </div>

            <textarea
              rows={3}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder={
                isId
                  ? 'Contoh: Notomee sedang menjalani pembaruan sistem dan optimalisasi basis data. Akses akan segera dipulihkan.'
                  : 'e.g., Notomee is undergoing scheduled performance upgrades. We will be back shortly.'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs sm:text-sm focus:outline-hidden focus:border-[#C85A32] leading-relaxed"
            />

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold text-[#8F8275]">
                {isId ? 'Pilihan Cepat:' : 'Quick Presets:'}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCustomReason(
                    isId
                      ? 'Pembaruan fitur baru dan peningkatan kinerja database sedang berlangsung.'
                      : 'Scheduled updates and performance optimizations currently in progress.'
                  )
                }
                className="px-2.5 py-1 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#201B17] hover:bg-[#F4ECE3] text-[11px] text-[#594E44] dark:text-[#C5B8AA] cursor-pointer transition-colors"
              >
                {isId ? 'Pembaruan Fitur' : 'Feature Update'}
              </button>
              <button
                type="button"
                onClick={() =>
                  setCustomReason(
                    isId
                      ? 'Pemeliharaan server berkala untuk menjaga stabilitas dan kecepatan santuari Anda.'
                      : 'Routine server maintenance to ensure fast and private sanctuary experience.'
                  )
                }
                className="px-2.5 py-1 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#201B17] hover:bg-[#F4ECE3] text-[11px] text-[#594E44] dark:text-[#C5B8AA] cursor-pointer transition-colors"
              >
                {isId ? 'Pemeliharaan Rutin' : 'Routine Maintenance'}
              </button>
              <button
                type="button"
                onClick={() =>
                  setCustomReason(
                    isId
                      ? 'Pencadangan data arsip tahunan sedang diselesaikan. Mohon tunggu beberapa saat.'
                      : 'Annual database backup in progress. Please check back shortly.'
                  )
                }
                className="px-2.5 py-1 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#201B17] hover:bg-[#F4ECE3] text-[11px] text-[#594E44] dark:text-[#C5B8AA] cursor-pointer transition-colors"
              >
                {isId ? 'Cadangan Arsip' : 'Archive Backup'}
              </button>
            </div>

            {/* Save Announcement Note Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (onToggleMaintenance) {
                    onToggleMaintenance(isMaintenance, customReason);
                    setStatusMessage(isId ? 'Pesan pemeliharaan berhasil disimpan.' : 'Maintenance announcement saved.');
                    setTimeout(() => setStatusMessage(null), 3000);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#8C6D4F] hover:bg-[#785C42] text-white text-xs font-semibold cursor-pointer transition-all shadow-2xs"
              >
                {isId ? 'Simpan Pesan Pengumuman' : 'Save Notice Text'}
              </button>
            </div>
          </div>

          {/* Crucial New Feature: Live Broadcast Announcement Preview */}
          <div className="p-5 sm:p-6 rounded-2xl border border-rose-200/80 dark:border-rose-950/80 bg-rose-50/20 dark:bg-rose-950/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-300">
              <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>{isId ? 'Pratinjau Langsung Tampilan Anggota (Live Broadcast Preview)' : 'Live Member Screen Preview'}</span>
            </div>
            <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184]">
              {isId
                ? 'Berikut adalah simulasi persis tampilan kartu yang akan dilihat anggota pada layar mereka saat aplikasi dijeda:'
                : 'This is the exact simulation of what members will see on their holding screen:'}
            </p>

            {/* Simulated Member Maintenance Holding Box */}
            <div className="p-5 rounded-xl border border-rose-300/80 dark:border-rose-900/60 bg-white dark:bg-[#1A1613] shadow-md space-y-2 text-center max-w-lg mx-auto">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="font-serif font-bold text-base text-[#2B241E] dark:text-[#EFE9E2]">
                {isId ? 'Sistem Sedang Dalam Pemeliharaan' : 'System Under Maintenance'}
              </h4>
              <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] leading-relaxed italic">
                "{customReason.trim() || (isId ? 'Notomee sedang menjalani pemeliharaan sistem berkala.' : 'Notomee is undergoing routine maintenance.')}"
              </p>
              <div className="pt-2 text-[10px] font-mono text-[#8F8275]">
                {isId ? 'Waktu aktivasi: Real-time Supabase Synchronized' : 'Activation status: Real-time Cloud Synced'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE & SUPABASE SECURITY */}
      {tab === 'database' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm sm:text-base text-[#2B241E] dark:text-[#EFE9E2] flex items-center gap-2">
                <Database className="w-4.5 h-4.5 text-[#C85A32]" />
                <span>{isId ? 'Skrip SQL Migrasi & Keamanan Supabase' : 'Supabase SQL Migration & RLS Security'}</span>
              </h3>
              <a
                href="https://supabase.com/dashboard/project/zkakakhaorbdwvnvjtco/sql"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[#C85A32] hover:text-[#B34B25] flex items-center gap-1.5 underline"
              >
                <span>{isId ? 'Buka Supabase SQL Editor' : 'Open Supabase SQL Editor'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] leading-relaxed">
              {isId
                ? 'Skrip SQL di bawah ini mengunci hak akses Row Level Security (RLS) sehingga hanya mike777rafael@gmail.com yang berhak mengelola pendaftaran anggota dan mengubah mode pemeliharaan.'
                : 'The SQL code below enforces Row Level Security (RLS) policies ensuring only the Primary Admin can manage whitelists and toggle maintenance mode.'}
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-[#38312B] bg-[#1E1B18] text-[#F3EFEA] shadow-lg">
            <button
              type="button"
              onClick={handleCopySql}
              className="absolute right-3.5 top-3.5 px-3 py-1.5 rounded-xl bg-[#2B241E] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#403832] transition-colors border border-white/10 shadow-xs"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? (isId ? 'Tersalin!' : 'Copied!') : (isId ? 'Salin Skrip SQL' : 'Copy SQL Script')}</span>
            </button>
            <pre className="p-5 font-mono text-xs overflow-x-auto leading-relaxed text-[#E0D7CB]">
              {sqlMigrationCode}
            </pre>
          </div>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {deletionCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#FAF7F2] dark:bg-[#1A1613] text-[#2D2823] dark:text-[#EAE3DA] rounded-2xl border border-[#E5DDD2] dark:border-[#38312B] p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#2B241E] dark:text-[#EFE9E2]">
                  {isId ? 'Hapus Akses Anggota?' : 'Remove Member Access?'}
                </h3>
                <p className="text-xs text-[#7B6F63] dark:text-[#9F9184]">
                  {deletionCandidate.email}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] leading-relaxed">
              {isId
                ? 'Setelah dihapus, akun Google ini tidak lagi dapat masuk ke Notomee. Anda dapat memilih untuk mengirimkan notifikasi via Gmail atau menghapus tanpa pesan.'
                : 'Once removed, this account can no longer sign in. You can choose to notify them via Gmail or delete quietly.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletionCandidate(null)}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#F4ECE3] transition-colors cursor-pointer"
              >
                {isId ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(false)}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                {isId ? 'Hapus Langsung' : 'Delete Quietly'}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(true)}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-[#C85A32] hover:bg-[#B34B25] text-white text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isId ? 'Hapus & Gmail' : 'Delete & Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
