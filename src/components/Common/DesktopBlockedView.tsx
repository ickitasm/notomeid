/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Globe,
  Sun,
  Moon,
  Sparkles,
  Trees,
  Film,
  KeyRound,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import { BrandLogo } from '../Brand/BrandLogo';
import { Language } from '../../lib/translations';
import { ThemeMode } from '../../types';
import { PRIMARY_ADMIN_EMAIL, checkIsAdmin } from '../../hooks/useAuth';

interface DesktopBlockedViewProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onAdminOverride?: () => void;
}

export const DesktopBlockedView: React.FC<DesktopBlockedViewProps> = ({
  language,
  onSelectLanguage,
  theme,
  onToggleTheme,
  onAdminOverride,
}) => {
  const isId = language === 'id';
  const [copied, setCopied] = useState(false);
  const [showAdminBypass, setShowAdminBypass] = useState(false);
  const [adminInput, setAdminInput] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://notomee.vercel.app';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(
    currentUrl
  )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerifyAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkIsAdmin(adminInput) || adminInput.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL) {
      setAdminError(null);
      if (onAdminOverride) {
        onAdminOverride();
      }
    } else {
      setAdminError(
        isId
          ? 'Hanya Primary Admin (mike777rafael@gmail.com) yang dapat mengakses pratinjau desktop.'
          : 'Only the Primary Admin (mike777rafael@gmail.com) can bypass the desktop restriction.'
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2] text-[#2D2823] dark:bg-[#161311] dark:text-[#EAE3DA] transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <BrandLogo size="sm" />
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => onSelectLanguage(isId ? 'en' : 'id')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-xs font-semibold text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] transition-colors cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#C85A32]" />
            <span className="font-mono uppercase">{isId ? 'ID' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] transition-colors cursor-pointer"
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

      {/* Main Restriction Card */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex items-center justify-center">
        <div className="w-full rounded-3xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-6 sm:p-10 shadow-2xl text-center space-y-6">
          {/* Logo Spotlight */}
          <div className="flex justify-center">
            <div className="p-3 sm:p-4 rounded-2xl bg-[#F4ECE3] dark:bg-[#25201C] border border-[#E0D7CB] dark:border-[#38312B] inline-flex items-center justify-center shadow-xs">
              <BrandLogo size="lg" showSubtitle />
            </div>
          </div>

          {/* Notice Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-400 text-xs font-semibold">
            <Smartphone className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>
              {isId
                ? 'Akses Khusus iPhone, Android & Tablet'
                : 'Exclusively for iPhone, Android & Tablets'}
            </span>
          </div>

          {/* Headline & Subtitle */}
          <div className="space-y-2.5 max-w-lg mx-auto">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2B241E] dark:text-[#EFE9E2] tracking-tight">
              {isId
                ? 'Akses Melalui Desktop Ditutup'
                : 'Desktop Access is Closed'}
            </h1>
            <p className="text-xs sm:text-sm text-[#7B6F63] dark:text-[#9F9184] leading-relaxed">
              {isId
                ? 'Notomee dikhususkan untuk perangkat seluler dan tablet guna memberikan privasi santuari personal terbaik. Silakan buka tautan ini melalui browser di ponsel iPhone, Android, atau iPad/Tablet Anda.'
                : 'Notomee is built exclusively as an intimate personal mobile sanctuary. Please open this app on your iPhone, Android smartphone, or Tablet.'}
            </p>
          </div>

          {/* Device Support Matrix Grid */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 max-w-md mx-auto pt-1">
            {/* iPhone / Android */}
            <div className="p-3 sm:p-3.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/20 flex flex-col items-center justify-center gap-1.5 text-center">
              <Smartphone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2]">
                iPhone & Android
              </span>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isId ? 'Didukung' : 'Supported'}</span>
              </span>
            </div>

            {/* iPad / Tablet */}
            <div className="p-3 sm:p-3.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-950/20 flex flex-col items-center justify-center gap-1.5 text-center">
              <Tablet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2]">
                iPad & Tablet
              </span>
              <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{isId ? 'Didukung' : 'Supported'}</span>
              </span>
            </div>

            {/* PC Desktop / Laptop */}
            <div className="p-3 sm:p-3.5 rounded-2xl border border-rose-500/25 bg-rose-500/5 dark:bg-rose-950/20 flex flex-col items-center justify-center gap-1.5 text-center opacity-85">
              <Laptop className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              <span className="text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2]">
                PC & Laptop
              </span>
              <span className="text-[10px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                <span>{isId ? 'Ditutup' : 'Restricted'}</span>
              </span>
            </div>
          </div>

          {/* QR Code & Scan Helper */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[#E0D7CB] dark:border-[#38312B] bg-[#FAF7F2] dark:bg-[#14110F] max-w-sm mx-auto flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#7B6F63] dark:text-[#9F9184]">
              <QrCode className="w-4 h-4 text-[#C85A32]" />
              <span>{isId ? 'Pindai Kamera Ponsel Anda' : 'Scan With Your Phone Camera'}</span>
            </div>

            <div className="p-2.5 bg-white rounded-xl shadow-xs border border-stone-200">
              <img
                src={qrCodeUrl}
                alt="Scan to open on iPhone or Android"
                className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
                loading="lazy"
              />
            </div>

            <p className="text-[11px] text-[#8F8275] text-center leading-snug">
              {isId
                ? 'Arahkan kamera smartphone Anda ke QR code di atas untuk langsung membuka Notomee.'
                : 'Point your mobile camera at this QR code to launch Notomee instantly.'}
            </p>

            {/* Copy Link Button */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full mt-1 px-4 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#1C1815] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C] text-xs font-medium text-[#2B241E] dark:text-[#EFE9E2] flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    {isId ? 'Tautan Berhasil Disalin!' : 'Link Copied to Clipboard!'}
                  </span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{isId ? 'Salin Tautan Notomee' : 'Copy Notomee URL'}</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Admin Special Override Section */}
          <div className="pt-2 border-t border-[#EAE2D8] dark:border-[#2D2722]">
            {!showAdminBypass ? (
              <button
                type="button"
                onClick={() => setShowAdminBypass(true)}
                className="text-[11px] font-mono text-[#8F8275] hover:text-[#C85A32] underline underline-offset-4 cursor-pointer transition-colors"
              >
                {isId
                  ? 'Akses Khusus Primary Admin (Mike)? Masuk di sini'
                  : 'Primary Admin (Mike) inspection access? Click here'}
              </button>
            ) : (
              <form onSubmit={handleVerifyAdmin} className="max-w-xs mx-auto space-y-2.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>{isId ? 'Verifikasi Primary Admin' : 'Admin Bypass Verification'}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAdminBypass(false)}
                    className="text-[11px] text-[#8F8275] hover:text-[#2B241E] cursor-pointer"
                  >
                    {isId ? 'Tutup' : 'Close'}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="email"
                    required
                    value={adminInput}
                    onChange={(e) => {
                      setAdminInput(e.target.value);
                      setAdminError(null);
                    }}
                    placeholder="mike777rafael@gmail.com"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-[#DED4C7] dark:border-[#38312B] bg-[#FAF7F2] dark:bg-[#14110F] text-xs font-mono text-[#2B241E] dark:text-[#EFE9E2] focus:outline-hidden focus:border-[#C85A32]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B34D28] transition-colors cursor-pointer shrink-0"
                  >
                    {isId ? 'Buka' : 'Unlock'}
                  </button>
                </div>

                {adminError && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 leading-tight">
                    {adminError}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[#8F8275] border-t border-[#E5DDD2] dark:border-[#2D2722]">
        Notomee · Mobile & Tablet Sanctuary · Exclusively for iOS, Android & iPadOS
      </footer>
    </div>
  );
};
