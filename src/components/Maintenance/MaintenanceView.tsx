/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RefreshCw, LogOut, Mail, Globe, Sun, Moon, Sparkles, Trees, Film, ShieldAlert } from 'lucide-react';
import { AppUser } from '../../hooks/useAuth';
import { Language } from '../../lib/translations';
import { ThemeMode } from '../../types';

interface MaintenanceViewProps {
  user?: AppUser | null;
  reason?: string;
  activatedAt?: string;
  onSignOut: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  user,
  reason,
  activatedAt,
  onSignOut,
  language,
  onSelectLanguage,
  theme,
  onToggleTheme,
}) => {
  const isId = language === 'id';

  const handleRefresh = () => {
    window.location.reload();
  };

  const formattedTime = activatedAt
    ? new Date(activatedAt).toLocaleTimeString(isId ? 'id-ID' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2] text-[#2D2823] dark:bg-[#161311] dark:text-[#EAE3DA] transition-colors duration-200">
      {/* Header Bar */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-1 px-2 sm:px-2.5 rounded-xl bg-white/90 dark:bg-white/95 border border-[#E0D7CB] dark:border-white/20 shadow-2xs flex items-center justify-center">
            <img
              src="/notomee_logos.png"
              alt="Notomee - Personal Sanctuary"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => onSelectLanguage(isId ? 'en' : 'id')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] transition-colors touch-manipulation cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#8C6D4F]" />
            <span>{isId ? 'ID' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] transition-colors touch-manipulation cursor-pointer"
            title={`Tema: ${theme}`}
          >
            {theme === 'christmas' ? (
              <Trees className="w-4 h-4 text-[#10B981]" />
            ) : theme === 'cinema' ? (
              <Film className="w-4 h-4 text-[#FB7185]" />
            ) : theme === 'romantic' ? (
              <Sparkles className="w-4 h-4 text-[#DB2777]" />
            ) : theme === 'dark' ? (
              <Moon className="w-4 h-4 text-[#D9822B]" />
            ) : (
              <Sun className="w-4 h-4 text-[#C85A32]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Sanctuary Card */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-8 flex items-center justify-center">
        <div className="w-full rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-6 sm:p-8 shadow-xl text-center space-y-6">
          {/* Logo Showcase */}
          <div className="flex justify-center">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white/90 dark:bg-white/95 border border-[#E0D7CB] dark:border-white/20 inline-flex items-center justify-center shadow-xs">
              <img
                src="/notomee_logos.png"
                alt="Notomee Sanctuary"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              {isId
                ? 'Sistem Sedang Dijeda · Mode Pemeliharaan'
                : 'System Paused · Scheduled Maintenance'}
            </span>
          </div>

          {/* Headline & Description */}
          <div className="space-y-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B241E] dark:text-[#EFE9E2] tracking-tight">
              {isId ? 'Santuari Sedang Dalam Pemeliharaan' : 'Sanctuary Under Maintenance'}
            </h1>
            <p className="text-xs sm:text-sm text-[#7B6F63] dark:text-[#9F9184] leading-relaxed max-w-md mx-auto">
              {reason && reason.trim()
                ? reason
                : isId
                ? 'Notomee sedang menjalani pemeliharaan berkala dan peningkatan performa oleh Primary Admin. Seluruh modul hidup sementara dijeda demi menjaga stabilitas dan privasi data.'
                : 'Notomee is currently undergoing scheduled maintenance and performance optimizations by the Primary Admin. Modules are temporarily paused to protect data integrity.'}
            </p>
            {formattedTime && (
              <p className="text-[11px] font-mono text-[#8F8275] pt-1">
                {isId ? `Diaktifkan pada pukul ${formattedTime}` : `Activated at ${formattedTime}`}
              </p>
            )}
          </div>

          {/* Logged-In User Banner */}
          {user && (
            <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E0D7CB] dark:border-[#38312B] text-left flex items-center justify-between text-xs">
              <div className="min-w-0 pr-2">
                <span className="block text-[10px] uppercase font-mono text-[#7B6F63] tracking-wide">
                  {isId ? 'Akun Terhubung' : 'Connected Account'}
                </span>
                <span className="font-semibold text-[#2B241E] dark:text-[#EFE9E2] truncate block">
                  {user.fullName || user.email}
                </span>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] hover:bg-rose-500/10 hover:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-medium transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isId ? 'Keluar' : 'Sign Out'}</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="w-full sm:w-auto min-h-[42px] px-6 py-2.5 rounded-xl bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{isId ? 'Periksa Status / Muat Ulang' : 'Check Status / Refresh'}</span>
            </button>

            <a
              href="mailto:mike777rafael@gmail.com?subject=Pertanyaan%20Status%20Maintenance%20Notomee"
              className="w-full sm:w-auto min-h-[42px] px-5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#201B17] hover:bg-[#F3ECE4] dark:hover:bg-[#28221D] text-[#594E44] dark:text-[#C5B8AA] text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Mail className="w-4 h-4 text-[#C85A32]" />
              <span>{isId ? 'Hubungi Admin Mike' : 'Contact Mike'}</span>
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[#8F8275] border-t border-[#E5DDD2] dark:border-[#2D2722]">
        Notomee · Personal Life Sanctuary · Managed by Mike Rafael
      </footer>
    </div>
  );
};
