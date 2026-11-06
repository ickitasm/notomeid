/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Film,
  Utensils,
  HeartPulse,
  Calendar,
  Sun,
  Moon,
  ShieldCheck,
  Sparkles,
  Mail,
  Copy,
  Check,
  Globe,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  MoonStar,
} from 'lucide-react';
import { translations, Language } from '../../lib/translations';
import { ThemeMode } from '../../types';

// Notome Private Life Hub · Pure Google Invite-Only Authentication System

interface AuthViewProps {
  onSignInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  isSupabaseConfigured: boolean;
  theme: ThemeMode;
  onToggleTheme: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  error?: string | null;
  notice?: { type: 'success' | 'error' | 'info'; message: string } | null;
  onClearNotice?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onSignInWithGoogle,
  theme,
  onToggleTheme,
  language,
  onSelectLanguage,
  error: externalError,
  notice,
  onClearNotice,
}) => {
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [copiedAdmin, setCopiedAdmin] = useState(false);

  const t = translations[language].auth;
  const isId = language === 'id';
  const errorMessage = localError || externalError;
  const adminEmail = 'mike777rafael@gmail.com';

  const handleGoogleClick = async () => {
    setLoading(true);
    setLocalError(null);
    const res = await onSignInWithGoogle();
    if (!res.success && res.error) {
      setLocalError(res.error);
    }
    setLoading(false);
  };

  const handleCopyAdmin = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopiedAdmin(true);
    setTimeout(() => setCopiedAdmin(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2] text-[#2D2823] dark:bg-[#161311] dark:text-[#EAE3DA] transition-colors duration-200">
      {/* Top Brand Bar */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C85A32] flex items-center justify-center text-white font-serif font-bold text-base shadow-xs">
            N
          </div>
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
            Notome
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => onSelectLanguage(language === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] transition-colors touch-manipulation cursor-pointer"
            title="Switch Language / Ganti Bahasa"
          >
            <Globe className="w-3.5 h-3.5 text-[#8C6D4F]" />
            <span>{language === 'id' ? 'ID' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] transition-colors touch-manipulation cursor-pointer"
            title={theme === 'dark' ? 'Switch to warm light theme' : 'Switch to roast dark theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D9822B]" /> : <Moon className="w-4 h-4 text-[#6F645A]" />}
          </button>
        </div>
      </header>

      {/* Main Authentication Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          {/* Left Column: Brand Story & 4 Pillars */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C85A32]/10 text-[#C85A32] text-xs font-mono font-semibold tracking-wide mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Notome Sanctuary · Invite-Only</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2] leading-tight">
                {t.headline}
              </h1>
              <p className="text-sm sm:text-base text-[#7B6F63] dark:text-[#9F9184] mt-3 leading-relaxed">
                {t.subheadline}
              </p>
            </div>

            {/* 6 Life Pillars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9]/80 dark:bg-[#1C1815]/80">
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#C85A32]">
                  <Film className="w-3.5 h-3.5" />
                  <span>{t.cinemaCard}</span>
                </div>
                <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] mt-1 line-clamp-2">
                  {t.cinemaDesc}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9]/80 dark:bg-[#1C1815]/80">
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#5B7A58]">
                  <Utensils className="w-3.5 h-3.5" />
                  <span>{t.nutritionCard}</span>
                </div>
                <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] mt-1 line-clamp-2">
                  {t.nutritionDesc}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9]/80 dark:bg-[#1C1815]/80">
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#A86438]">
                  <HeartPulse className="w-3.5 h-3.5" />
                  <span>{t.petsCard}</span>
                </div>
                <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] mt-1 line-clamp-2">
                  {t.petsDesc}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9]/80 dark:bg-[#1C1815]/80">
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#C4933F]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t.calendarCard}</span>
                </div>
                <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] mt-1 line-clamp-2">
                  {t.calendarDesc}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9]/80 dark:bg-[#1C1815]/80">
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#D97706]">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t.notesCard}</span>
                </div>
                <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] mt-1 line-clamp-2">
                  {t.notesDesc}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9]/80 dark:bg-[#1C1815]/80">
                <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#6366F1]">
                  <MoonStar className="w-3.5 h-3.5" />
                  <span>{t.dreamsCard}</span>
                </div>
                <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] mt-1 line-clamp-2">
                  {t.dreamsDesc}
                </p>
              </div>
            </div>

            {/* Privacy Guarantee Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4ECE3]/60 dark:bg-[#201B17]/60 border border-[#E4DCDB] dark:border-[#352F2B] text-xs text-[#7B6F63] dark:text-[#9F9184]">
              <ShieldCheck className="w-4 h-4 text-[#5B7A58] shrink-0 mt-0.5" />
              <span>{t.freeGuarantee}</span>
            </div>
          </div>

          {/* Right Column: Pure Google OAuth Invite-Only Card */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto">
            <div className="rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-6 sm:p-8 shadow-xl space-y-5">
              {/* Card Header */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#C85A32]/10 text-[#C85A32] text-[11px] font-semibold tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t.inviteOnlyBadge}</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
                  {t.signInTitle}
                </h2>
                <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] leading-relaxed">
                  {t.inviteOnlyDesc}
                </p>
              </div>

              {/* Status messages */}
              {notice && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start justify-between gap-2.5 ${
                    notice.type === 'success'
                      ? 'bg-[#5B7A58]/15 border-[#5B7A58]/35 text-[#426140] dark:text-[#88B884]'
                      : notice.type === 'error'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{notice.message}</span>
                  </div>
                  {onClearNotice && (
                    <button
                      type="button"
                      onClick={onClearNotice}
                      className="opacity-70 hover:opacity-100 p-0.5 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              )}

              {/* The ONLY Login Action: One-Click Google Sign In */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  disabled={loading}
                  className="w-full min-h-[50px] px-5 py-3 rounded-xl border border-[#D5CBC0] dark:border-[#403832] bg-white dark:bg-[#25201C] hover:bg-[#F9F5EF] dark:hover:bg-[#2E2823] active:scale-[0.98] transition-all flex items-center justify-center gap-3.5 font-semibold text-sm text-[#2B241E] dark:text-[#EFE9E2] shadow-sm hover:shadow-md touch-manipulation cursor-pointer"
                >
                  {/* Official Google G Logo SVG */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{loading ? (isId ? 'Membuka Google...' : 'Connecting to Google...') : t.continueWithGoogle}</span>
                </button>

                <p className="text-[11px] text-center text-[#8F8275] dark:text-[#7A7067]">
                  {isId
                    ? 'Login instan aman dengan identitas Google Anda tanpa perlu mengingat kata sandi.'
                    : 'Instant secure login with your Google identity without passwords.'}
                </p>
              </div>

              {/* Admin Contact Box for Uninvited Users */}
              <div className="p-4 rounded-xl border border-dashed border-[#D5CBC0] dark:border-[#403832] bg-[#FAF7F2]/60 dark:bg-[#161311]/60 text-xs space-y-2">
                <div className="text-[#594E44] dark:text-[#C5B8AA] font-medium text-[11px]">
                  {t.adminContactNotice}
                </div>
                <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-[#1E1916] border border-[#E0D7CB] dark:border-[#38312B]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#C85A32] font-semibold truncate">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{adminEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAdmin}
                    className="shrink-0 px-2.5 py-1 rounded-md bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E0D7CB] dark:border-[#38312B] hover:bg-[#EFE8DD] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedAdmin ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#8F8275]" />}
                    <span>{copiedAdmin ? (isId ? 'Disalin' : 'Copied') : (isId ? 'Salin' : 'Copy')}</span>
                  </button>
                </div>
              </div>


            </div>
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E5DDD2] dark:border-[#2D2722] py-4 text-xs text-[#8F8275] text-center">
        <div className="max-w-7xl mx-auto px-4">
          Notome · Private Life Hub · Invite-Only Access
        </div>
      </footer>
    </div>
  );
};
