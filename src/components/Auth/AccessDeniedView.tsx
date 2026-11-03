/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, LogOut, Mail, Copy, Check, Globe, Sun, Moon } from 'lucide-react';
import { Language } from '../../lib/translations';
import { AppUser } from '../../hooks/useAuth';

interface AccessDeniedViewProps {
  user: AppUser;
  onSignOut: () => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  user,
  onSignOut,
  language,
  onSelectLanguage,
  theme,
  onToggleTheme,
}) => {
  const [copied, setCopied] = useState(false);
  const adminEmail = 'mike777rafael@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isId = language === 'id';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2] text-[#2D2823] dark:bg-[#161311] dark:text-[#EAE3DA] transition-colors duration-200">
      {/* Top Header */}
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
          <button
            type="button"
            onClick={() => onSelectLanguage(isId ? 'en' : 'id')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#8C6D4F]" />
            <span>{isId ? 'ID' : 'EN'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-lg text-[#6F645A] dark:text-[#A89C90] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D9822B]" /> : <Moon className="w-4 h-4 text-[#6F645A]" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-8 sm:py-16 flex items-center justify-center">
        <div className="w-full rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-6 sm:p-8 shadow-xl text-center space-y-6">
          {/* Shield Badge */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#C85A32]/10 border border-[#C85A32]/20 flex items-center justify-center text-[#C85A32]">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
              {isId ? 'Akses Terbatas: Sistem Undangan' : 'Access Restricted: Invite-Only Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-[#7B6F63] dark:text-[#9F9184] leading-relaxed max-w-sm mx-auto">
              {isId
                ? 'Notome adalah sanctuary privat. Akun Google Anda telah terautentikasi, namun belum masuk dalam daftar whitelist yang diizinkan oleh Primary Admin.'
                : 'Notome is a private personal sanctuary. Your Google account is authenticated, but has not yet been registered in the whitelist by the Primary Admin.'}
            </p>
          </div>

          {/* Account Card */}
          <div className="p-3.5 rounded-xl bg-[#F4ECE3]/60 dark:bg-[#25201C] border border-[#E0D7CB] dark:border-[#38312B] text-left text-xs space-y-1">
            <div className="text-[11px] font-medium text-[#8F8275]">
              {isId ? 'Akun Google Anda yang Terdeteksi:' : 'Your Detected Google Account:'}
            </div>
            <div className="font-mono font-semibold text-[#2B241E] dark:text-[#EFE9E2] truncate">
              {user.email}
            </div>
          </div>

          {/* Admin Contact Box */}
          <div className="p-4 rounded-xl border border-dashed border-[#D5CBC0] dark:border-[#403832] text-xs space-y-2.5">
            <div className="text-[#594E44] dark:text-[#C5B8AA] font-medium">
              {isId
                ? 'Ingin menggunakan Notome? Hubungi Primary Admin untuk mendaftarkan Gmail Anda:'
                : 'Want access to Notome? Contact the Primary Admin to register your Gmail:'}
            </div>
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-[#161311] border border-[#E0D7CB] dark:border-[#38312B]">
              <div className="flex items-center gap-2 text-xs font-mono text-[#C85A32] font-semibold truncate">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{adminEmail}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="shrink-0 px-2.5 py-1 rounded-md bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E0D7CB] dark:border-[#38312B] hover:bg-[#EFE8DD] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#8F8275]" />}
                <span>{copied ? (isId ? 'Disalin!' : 'Copied!') : (isId ? 'Salin' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={onSignOut}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2B241E] dark:bg-[#EFE9E2] text-white dark:text-[#2B241E] font-medium text-xs sm:text-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>{isId ? 'Keluar & Gunakan Akun Lain' : 'Sign Out & Use Another Account'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5DDD2] dark:border-[#2D2722] py-4 text-xs text-[#8F8275] text-center">
        Notome · Private Life Sanctuary
      </footer>
    </div>
  );
};
