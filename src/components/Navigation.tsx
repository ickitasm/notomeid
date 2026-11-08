/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Film, Utensils, HeartPulse, Calendar, Sun, Moon, Sliders, LogOut, CheckCircle2, Globe, ShieldCheck, BookOpen, MoonStar, Sparkles, Bell, Menu, User as UserIcon, Trees } from 'lucide-react';
import { AppUser } from '../hooks/useAuth';
import { UpcomingAlert } from '../lib/notifications';
import { NotificationPanel } from './Notifications/NotificationPanel';
import { translations, Language } from '../lib/translations';
import { ThemeMode } from '../types';

export type ActiveTab = 'media' | 'nutrition' | 'pets' | 'calendar' | 'notes' | 'dreams';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onSetTheme?: (theme: ThemeMode) => void;
  onOpenSettings: () => void;
  onOpenAdminPanel?: () => void;
  onOpenUpdateLogs?: () => void;
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
  onSetTheme,
  onOpenSettings,
  onOpenAdminPanel,
  onOpenUpdateLogs,
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

  const themesList: { id: ThemeMode; labelId: string; labelEn: string; bgDot: string; accentDot: string }[] = [
    { id: 'light', labelId: 'Warm Paper', labelEn: 'Warm Paper', bgDot: '#FAF7F2', accentDot: '#C85A32' },
    { id: 'dark', labelId: 'Roast Dark', labelEn: 'Roast Dark', bgDot: '#161311', accentDot: '#D9822B' },
    { id: 'cinema', labelId: 'Cinema Velvet', labelEn: 'Cinema Velvet', bgDot: '#120406', accentDot: '#E11D48' },
    { id: 'romantic', labelId: 'Romantic Rose', labelEn: 'Romantic Rose', bgDot: '#FDF7F8', accentDot: '#DB2777' },
    { id: 'christmas', labelId: 'Christmas Eve', labelEn: 'Christmas Eve', bgDot: '#071911', accentDot: '#DC2626' },
  ];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 h-16 sm:h-18 flex items-center justify-between gap-3 sm:gap-5 lg:gap-7">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onTabChange('media')}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-hidden touch-manipulation cursor-pointer"
            >
              <img
                src="/notomee_logos.jpg"
                alt="Notomee"
                className="h-9 sm:h-10 w-auto object-contain rounded-xl shadow-xs transition-transform active:scale-95 border border-[#E0D7CB] dark:border-[#38312B]"
              />
              <div>
                <span className="font-serif text-2xl sm:text-2xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2] group-hover:text-[#C85A32] transition-colors whitespace-nowrap">
                  Notomee
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Desktop 6 concise nav tabs inside adaptive centered pill */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 p-1.5 rounded-xl bg-[#EFE8DD]/70 dark:bg-[#201B17] border border-[#E0D7CB] dark:border-[#38312B] overflow-x-auto scrollbar-none max-w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3 lg:px-3.5 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap shrink-0 touch-manipulation cursor-pointer ${
                    isActive
                      ? 'bg-[#FFFDF9] dark:bg-[#2A231D] text-[#2B241E] dark:text-[#EFE9E2] font-semibold shadow-xs'
                      : 'text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#FAF7F2]/80 dark:hover:bg-[#1A1613]/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 lg:w-4.5 lg:h-4.5 ${isActive ? 'text-[#C85A32]' : ''}`} />
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="inline xl:hidden">{item.shortLabel}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Utilities (Mobile: Language & Profile; Desktop: All Tools) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Language Toggle Button - always visible */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="min-h-[38px] px-2.5 sm:px-3 flex items-center gap-1.5 text-xs font-semibold rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] active:scale-95 transition-all touch-manipulation cursor-pointer"
              title={language === 'id' ? 'Ganti ke English' : 'Switch to Bahasa Indonesia'}
            >
              <Globe className="w-3.5 h-3.5 text-[#C85A32]" />
              <span className="font-mono text-xs uppercase tracking-wide">
                {language.toUpperCase()}
              </span>
            </button>

            {/* Desktop Only Secondary Controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Notification Center Bell */}
              <NotificationPanel alerts={alerts} userEmail={user?.email} />

              {/* Theme Cycle Button */}
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label="Toggle theme"
                className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] active:scale-95 transition-all touch-manipulation cursor-pointer"
                title={`Tema saat ini: ${theme}. Klik untuk beralih.`}
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

              {/* Primary Admin Special Panel Button */}
              {isPrimaryAdmin && onOpenAdminPanel && (
                <button
                  type="button"
                  onClick={onOpenAdminPanel}
                  className="min-h-[38px] px-3 flex items-center gap-1.5 text-xs font-semibold rounded-xl border border-[#C85A32]/40 bg-[#C85A32]/10 text-[#C85A32] hover:bg-[#C85A32]/20 active:scale-95 transition-all whitespace-nowrap shrink-0 touch-manipulation cursor-pointer"
                  title="Buka Panel Manajemen Akses Undangan"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                  <span className="inline text-xs">Admin</span>
                </button>
              )}

              {/* Update Logs & Roadmap Button */}
              {onOpenUpdateLogs && (
                <button
                  type="button"
                  onClick={onOpenUpdateLogs}
                  className="min-h-[38px] px-3 flex items-center gap-1.5 text-xs font-semibold rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] active:scale-95 transition-all whitespace-nowrap shrink-0 touch-manipulation cursor-pointer"
                  title={language === 'id' ? 'Lihat Log Pembaruan & Roadmap' : 'View Update Logs & Roadmap'}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span className="hidden sm:inline">{language === 'id' ? 'Log Update' : 'Updates'}</span>
                </button>
              )}

              {/* Settings & Data Button */}
              <button
                type="button"
                onClick={onOpenSettings}
                className="min-h-[38px] px-3 flex items-center gap-1.5 text-xs font-medium rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] active:scale-95 transition-all whitespace-nowrap shrink-0 touch-manipulation cursor-pointer"
                title={t.syncAndData}
              >
                <Sliders className="w-3.5 h-3.5 text-[#8C6D4F]" />
                <span className="hidden xl:inline">{t.syncAndData}</span>
                <span className="hidden md:inline xl:hidden">{language === 'id' ? 'Pengaturan' : 'Settings'}</span>
              </button>
            </div>

            {/* Profile Avatar / Menu Trigger - always visible */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => setIsProfileOpen((v) => !v)}
                className="flex items-center gap-2 p-1 pl-1 pr-1.5 rounded-full border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] hover:border-[#C85A32]/40 transition-colors touch-manipulation cursor-pointer"
                title={t.accountDetails}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-[#C85A32] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.email ? user.email.charAt(0).toUpperCase() : 'M'
                  )}
                </div>
                <span className="text-xs font-medium max-w-[100px] truncate hidden sm:inline">
                  {user?.fullName || (user?.email ? user.email.split('@')[0] : 'Menu')}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[#E4DCDB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] p-3.5 shadow-2xl z-50 text-xs space-y-2.5 animate-in fade-in duration-150">
                  <div className="pb-2.5 border-b border-[#EAE2D8] dark:border-[#2E2823]">
                    <div className="font-semibold text-sm text-[#2B241E] dark:text-[#EFE9E2] truncate">
                      {user?.fullName || 'Notome User'}
                    </div>
                    <div className="text-xs text-[#7B6F63] dark:text-[#9F9184] font-mono truncate mt-0.5">
                      {user?.email || 'Akses Privat Mobile'}
                    </div>
                    {user && (
                      <div className="mt-1.5 flex items-center justify-between gap-1 text-[11px]">
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
                    )}
                  </div>

                  {/* Interactive 5-Theme Swatch Selector */}
                  <div className="py-2.5 px-3 border-b border-[#EAE2D8] dark:border-[#2E2823] space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#6F645A] dark:text-[#A89C90]">
                      <span>{language === 'id' ? 'Tema Tampilan' : 'Visual Theme'}</span>
                      <span className="font-mono text-[10px] capitalize text-[#8F8275]">
                        {theme === 'christmas' ? 'Christmas Eve' : theme === 'cinema' ? 'Cinema Velvet' : theme === 'romantic' ? 'Romantic Rose' : theme}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {themesList.map((tItem) => {
                        const isSelected = theme === tItem.id;
                        const isChristmas = tItem.id === 'christmas';
                        return (
                          <button
                            key={tItem.id}
                            type="button"
                            onClick={() => {
                              if (onSetTheme) {
                                onSetTheme(tItem.id);
                              } else {
                                onToggleTheme();
                              }
                            }}
                            className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-all cursor-pointer touch-manipulation ${
                              isChristmas ? 'col-span-2' : ''
                            } ${
                              isSelected
                                ? 'bg-[#EAE2D7] dark:bg-[#28221D] text-[#2B241E] dark:text-[#EFE9E2] font-semibold ring-1 ring-[#C85A32]/40 shadow-xs'
                                : 'text-[#6F645A] dark:text-[#A89C90] hover:bg-[#F4ECE3] dark:hover:bg-[#201B17]'
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-2xs flex items-center justify-center"
                              style={{ backgroundColor: tItem.bgDot }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: tItem.accentDot }}
                              />
                            </span>
                            <span className="truncate">{language === 'id' ? tItem.labelId : tItem.labelEn}</span>
                            {isChristmas && (
                              <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#DC2626]/15 text-[#EF4444] font-semibold">
                                Festive
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {isPrimaryAdmin && onOpenAdminPanel && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenAdminPanel();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#C85A32]/10 hover:bg-[#C85A32]/20 text-[#C85A32] font-semibold transition-colors cursor-pointer text-left"
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

                  {onOpenUpdateLogs && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenUpdateLogs();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] text-[#594E44] dark:text-[#C5B8AA] transition-colors cursor-pointer font-medium"
                    >
                      <Sparkles className="w-4 h-4 text-[#C85A32]" />
                      <span>{language === 'id' ? 'Log Pembaruan' : 'Update Logs'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] text-[#594E44] dark:text-[#C5B8AA] transition-colors cursor-pointer font-medium"
                  >
                    <Sliders className="w-4 h-4 text-[#8C6D4F]" />
                    <span>{t.syncAndData}</span>
                  </button>

                  {user && onSignOut && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors pt-2 border-t border-[#EAE2D8] dark:border-[#2E2823] cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.signOut}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Android & Mobile Bottom Navigation Bar (Natural Thumb Zone) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 dark:bg-[#161311]/95 backdrop-blur-lg border-t border-[#E5DDD2] dark:border-[#2D2722] safe-area-pb">
        <nav className="grid grid-cols-6 items-center h-18 max-w-lg mx-auto px-1.5">
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
                className={`flex flex-col items-center justify-center min-h-[52px] py-1 rounded-xl transition-all touch-manipulation active:scale-95 ${
                  isActive
                    ? 'text-[#C85A32] font-semibold'
                    : 'text-[#7B6F63] dark:text-[#9F9184] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[#C85A32]/10' : ''}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] sm:text-[11px] tracking-tight mt-0.5 whitespace-nowrap font-medium">
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
