/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Film, Utensils, HeartPulse, Calendar, Sun, Moon, Sliders, LogOut, CheckCircle2, Globe, ShieldCheck, BookOpen, MoonStar } from 'lucide-react';
import { AppUser } from '../hooks/useAuth';
import { UpcomingAlert } from '../lib/notifications';
import { NotificationPanel } from './Notifications/NotificationPanel';
import { translations, Language } from '../lib/translations';

export type ActiveTab = 'media' | 'nutrition' | 'pets' | 'calendar' | 'notes' | 'dreams';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  onOpenAdminPanel?: () => void;
  isPrimaryAdmin?: boolean;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  user?: AppUser | null;
  onSignOut?: () => void;
  alerts?: UpcomingAlert[];
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  onOpenSettings,
  onOpenAdminPanel,
  isPrimaryAdmin = false,
  language,
  onSelectLanguage,
  user,
  onSignOut,
  alerts = [],
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const t = translations[language].nav;

  const navItems: { id: ActiveTab; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'media', label: t.media, shortLabel: t.mediaShort, icon: Film },
    { id: 'nutrition', label: t.nutrition, shortLabel: t.nutritionShort, icon: Utensils },
    { id: 'pets', label: t.pets, shortLabel: t.petsShort, icon: HeartPulse },
    { id: 'calendar', label: t.calendar, shortLabel: t.calendarShort, icon: Calendar },
    { id: 'notes', label: t.notes, shortLabel: t.notesShort, icon: BookOpen },
    { id: 'dreams', label: t.dreams, shortLabel: t.dreamsShort, icon: MoonStar },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = () => {
    onSelectLanguage(language === 'id' ? 'en' : 'id');
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E5DDD2] dark:border-[#2D2722] bg-[#FAF7F2]/95 dark:bg-[#161311]/95 backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onTabChange('media')}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-hidden touch-manipulation cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-[#C85A32] flex items-center justify-center text-white font-serif font-bold text-base shadow-xs transition-transform active:scale-95">
                N
              </div>
              <div>
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2] group-hover:text-[#C85A32] transition-colors whitespace-nowrap">
                  Notome
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Desktop 6 concise nav tabs inside adaptive centered pill */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 p-1 rounded-xl bg-[#EFE8DD]/70 dark:bg-[#201B17] border border-[#E0D7CB] dark:border-[#38312B] overflow-x-auto scrollbar-none max-w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap shrink-0 touch-manipulation cursor-pointer ${
                    isActive
                      ? 'bg-[#FFFDF9] dark:bg-[#2A231D] text-[#2B241E] dark:text-[#EFE9E2] font-semibold shadow-xs'
                      : 'text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#FAF7F2]/80 dark:hover:bg-[#1A1613]/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 ${isActive ? 'text-[#C85A32]' : ''}`} />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="inline xl:hidden">{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Utilities (Language, Notifications, Theme, Settings & Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Language Toggle Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="min-h-[36px] px-2 sm:px-2.5 flex items-center gap-1.5 text-xs font-semibold rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] active:scale-95 transition-all touch-manipulation cursor-pointer"
              title={language === 'id' ? 'Ganti ke English' : 'Switch to Bahasa Indonesia'}
            >
              <Globe className="w-3.5 h-3.5 text-[#C85A32]" />
              <span className="font-mono text-[11px] uppercase tracking-wide">
                {language.toUpperCase()}
              </span>
            </button>

            {/* Notification Center Bell */}
            <NotificationPanel alerts={alerts} userEmail={user?.email} />

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] active:scale-95 transition-all touch-manipulation cursor-pointer"
              title={theme === 'dark' ? 'Switch to warm light theme' : 'Switch to roast dark theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D9822B]" /> : <Moon className="w-4 h-4 text-[#6F645A]" />}
            </button>

            {/* Primary Admin Special Panel Button - visible on both mobile and desktop */}
            {isPrimaryAdmin && onOpenAdminPanel && (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="min-h-[36px] px-2 sm:px-2.5 md:px-3 flex items-center gap-1 sm:gap-1.5 text-xs font-semibold rounded-lg border border-[#C85A32]/40 bg-[#C85A32]/10 text-[#C85A32] hover:bg-[#C85A32]/20 active:scale-95 transition-all whitespace-nowrap shrink-0 touch-manipulation cursor-pointer"
                title="Buka Panel Manajemen Akses Undangan"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                <span className="inline text-[11px] sm:text-xs">Admin</span>
              </button>
            )}

            {/* Settings & Data Button */}
            <button
              type="button"
              onClick={onOpenSettings}
              className="min-h-[36px] px-2.5 sm:px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] active:scale-95 transition-all whitespace-nowrap shrink-0 touch-manipulation cursor-pointer"
              title={t.syncAndData}
            >
              <Sliders className="w-3.5 h-3.5 text-[#8C6D4F]" />
              <span className="hidden xl:inline">{t.syncAndData}</span>
              <span className="hidden md:inline xl:hidden">{language === 'id' ? 'Pengaturan' : 'Settings'}</span>
            </button>

            {/* Profile Dropdown */}
            {user && (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] hover:border-[#C85A32]/40 transition-colors touch-manipulation cursor-pointer"
                  title={t.accountDetails}
                >
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-[#C85A32] flex items-center justify-center text-white text-[11px] font-bold">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user.email.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium max-w-[100px] truncate hidden sm:inline">
                    {user.fullName || user.email.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#E4DCDB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] p-3 shadow-xl z-50 text-xs space-y-2.5">
                    <div className="pb-2 border-b border-[#EAE2D8] dark:border-[#2E2823]">
                      <div className="font-semibold text-[#2B241E] dark:text-[#EFE9E2] truncate">
                        {user.fullName || 'Notome Member'}
                      </div>
                      <div className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] font-mono truncate">
                        {user.email}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-1 text-[10px]">
                        <div className="flex items-center gap-1 text-[#5B7A58] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{t.verifiedGoogle}</span>
                        </div>
                        {isPrimaryAdmin && (
                          <span className="font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#C85A32]/15 text-[#C85A32]">
                            Primary Admin
                          </span>
                        )}
                      </div>
                    </div>

                    {isPrimaryAdmin && onOpenAdminPanel && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onOpenAdminPanel();
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-[#C85A32]/10 hover:bg-[#C85A32]/20 text-[#C85A32] font-semibold transition-colors cursor-pointer text-left"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#C85A32] shrink-0" />
                        <div>
                          <div className="leading-tight text-xs font-semibold">
                            {language === 'id' ? 'Buka Panel Admin' : 'Open Admin Panel'}
                          </div>
                          <div className="text-[10px] text-[#C85A32]/80 font-normal">
                            {language === 'id' ? 'Kelola anggota & whitelist' : 'Manage members & whitelist'}
                          </div>
                        </div>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] text-[#594E44] dark:text-[#C5B8AA] transition-colors cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#8C6D4F]" />
                      <span>{t.syncAndData}</span>
                    </button>

                    {onSignOut && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors pt-2 border-t border-[#EAE2D8] dark:border-[#2E2823] cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t.signOut}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Android & Mobile Bottom Navigation Bar (Natural Thumb Zone) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 dark:bg-[#161311]/95 backdrop-blur-lg border-t border-[#E5DDD2] dark:border-[#2D2722] safe-area-pb">
        <nav className="grid grid-cols-6 items-center h-16 max-w-lg mx-auto px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onTabChange(item.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center min-h-[48px] py-1 rounded-lg transition-all touch-manipulation active:scale-95 ${
                  isActive
                    ? 'text-[#C85A32] font-semibold'
                    : 'text-[#7B6F63] dark:text-[#9F9184] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
                }`}
              >
                <div className={`p-1 rounded-md transition-colors ${isActive ? 'bg-[#C85A32]/10' : ''}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[9px] sm:text-[10px] tracking-tight mt-0.5 whitespace-nowrap font-medium">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
