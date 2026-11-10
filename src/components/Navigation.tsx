/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Film, Utensils, HeartPulse, Calendar, Sun, Moon, Sliders, LogOut, CheckCircle2, Globe, ShieldCheck, BookOpen, MoonStar, Sparkles, Bell, Menu, User as UserIcon, Trees, Ghost, Gamepad2 } from 'lucide-react';
import { AppUser } from '../hooks/useAuth';
import { UpcomingAlert } from '../lib/notifications';
import { NotificationPanel } from './Notifications/NotificationPanel';
import { translations, Language } from '../lib/translations';
import { ThemeMode } from '../types';
import { BrandLogo } from './Brand/BrandLogo';

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

  const themesList: {
    id: ThemeMode;
    labelId: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'light', labelId: 'Warm Paper', labelEn: 'Warm Paper', icon: Sun },
    { id: 'dark', labelId: 'Roast Dark', labelEn: 'Roast Dark', icon: Moon },
    { id: 'cinema', labelId: 'Cinema Velvet', labelEn: 'Cinema Velvet', icon: Film },
    { id: 'romantic', labelId: 'Romantic Rose', labelEn: 'Romantic Rose', icon: Sparkles },
    { id: 'christmas', labelId: 'Christmas Eve', labelEn: 'Christmas Eve', icon: Trees },
    { id: 'halloween', labelId: 'Halloween Horror', labelEn: 'Halloween Horror', icon: Ghost },
    { id: 'retro', labelId: 'Arcade 8-Bit', labelEn: 'Arcade 8-Bit', icon: Gamepad2 },
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

  // Virtual infinite circular list: render 3 repeated sets of navItems
  const infiniteNavItems = useMemo(() => {
    return [
      ...navItems.map((item) => ({ ...item, cycle: -1, key: `${item.id}-prev` })),
      ...navItems.map((item) => ({ ...item, cycle: 0, key: `${item.id}-main` })),
      ...navItems.map((item) => ({ ...item, cycle: 1, key: `${item.id}-next` })),
    ];
  }, [navItems]);

  // References for bottom dock carousel
  const bottomNavContainerRef = useRef<HTMLDivElement>(null);
  const bottomTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isProgrammaticScroll = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Center the active tab in the main set (cycle 0)
  const centerActiveTab = useCallback((targetTab: ActiveTab, smooth = true) => {
    const mainKey = `${targetTab}-main`;
    const activeEl = bottomTabRefs.current[mainKey];
    if (activeEl && bottomNavContainerRef.current) {
      isProgrammaticScroll.current = true;
      activeEl.scrollIntoView({
        behavior: smooth ? 'smooth' : 'instant',
        inline: 'center',
        block: 'nearest',
      });
      // Release lock after smooth scroll finishes
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 350);
    }
  }, []);

  // When activeTab changes from click or desktop nav, center it smoothly
  useEffect(() => {
    centerActiveTab(activeTab, true);
  }, [activeTab, centerActiveTab]);

  // Handle seamless infinite looping and scroll-end auto selection
  const handleScrollEnd = useCallback(() => {
    const container = bottomNavContainerRef.current;
    if (!container || isProgrammaticScroll.current) return;

    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    // Find the item currently closest to the center line
    let closestKey = '';
    let closestId: ActiveTab = activeTab;
    let minDistance = Infinity;

    infiniteNavItems.forEach((item) => {
      const el = bottomTabRefs.current[item.key];
      if (el) {
        const rect = el.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(itemCenter - containerCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestKey = item.key;
          closestId = item.id;
        }
      }
    });

    // Check boundary wrap-around for infinite looping
    // If closest item is in the prev (-1) or next (1) cycle, jump instantly to cycle 0
    if (closestKey && closestId) {
      if (closestKey.endsWith('-prev') || closestKey.endsWith('-next')) {
        const correspondingMainEl = bottomTabRefs.current[`${closestId}-main`];
        if (correspondingMainEl) {
          isProgrammaticScroll.current = true;
          correspondingMainEl.scrollIntoView({
            behavior: 'instant',
            inline: 'center',
            block: 'nearest',
          });
          setTimeout(() => {
            isProgrammaticScroll.current = false;
          }, 60);
        }
      }

      // If the selected closest item is different from active tab, switch page!
      if (closestId !== activeTab) {
        onTabChange(closestId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [activeTab, infiniteNavItems, onTabChange]);

  const onScroll = useCallback(() => {
    if (isProgrammaticScroll.current) return;

    // Debounce fallback for scroll-end
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      handleScrollEnd();
    }, 130);
  }, [handleScrollEnd]);

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
              aria-label="Notomee Home"
              className="flex items-center text-left group focus-visible:outline-hidden touch-manipulation cursor-pointer active:scale-95 transition-transform"
            >
              <BrandLogo size="sm" />
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

            {/* Integrated Calendar Notification Bell - Always visible on mobile & desktop */}
            <NotificationPanel alerts={alerts} userEmail={user?.email} language={language} />

            {/* Desktop Only Secondary Controls */}
            <div className="hidden md:flex items-center gap-2">
              {/* Theme Cycle Button */}
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label="Toggle theme"
                className="min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] active:scale-95 transition-all touch-manipulation cursor-pointer"
                title={`Tema saat ini: ${theme}. Klik untuk beralih.`}
              >
                {theme === 'halloween' ? (
                  <Ghost className="w-4 h-4 text-[#FF7518]" />
                ) : theme === 'retro' ? (
                  <Gamepad2 className="w-4 h-4 text-[#00F5D4]" />
                ) : theme === 'christmas' ? (
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
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-[#E4DCDB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] p-3.5 shadow-2xl z-50 text-[13px] space-y-2.5 animate-in fade-in duration-150">
                  <div className="pb-2.5 border-b border-[#EAE2D8] dark:border-[#2E2823]">
                    <div className="font-semibold text-[15px] sm:text-base text-[#2B241E] dark:text-[#EFE9E2] truncate">
                      {user?.fullName || 'Notome User'}
                    </div>
                    <div className="text-[13px] text-[#7B6F63] dark:text-[#9F9184] font-mono truncate mt-0.5">
                      {user?.email || 'Akses Privat Mobile'}
                    </div>
                    {user && (
                      <div className="mt-1.5 flex items-center justify-between gap-1 text-xs">
                        <div className="flex items-center gap-1.5 text-[#5B7A58] font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t.verifiedGoogle}</span>
                        </div>
                        {isPrimaryAdmin && (
                          <span className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded bg-[#C85A32]/15 text-[#C85A32]">
                            Primary Admin
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Interactive 7-Theme Horizontal Icon Row */}
                  <div className="py-2.5 px-1 border-b border-[#EAE2D8] dark:border-[#2E2823] space-y-2">
                    <div className="flex items-center justify-between text-[13px] font-semibold text-[#6F645A] dark:text-[#A89C90] px-1">
                      <span>{language === 'id' ? 'Tema Tampilan' : 'Visual Theme'}</span>
                      <span className="font-mono text-[11px] capitalize text-[#C85A32] font-medium">
                        {theme === 'halloween'
                          ? 'Halloween Horror'
                          : theme === 'retro'
                          ? 'Arcade 8-Bit'
                          : theme === 'christmas'
                          ? 'Christmas Eve'
                          : theme === 'cinema'
                          ? 'Cinema Velvet'
                          : theme === 'romantic'
                          ? 'Romantic Rose'
                          : theme === 'dark'
                          ? 'Roast Dark'
                          : 'Warm Paper'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 p-1 bg-[#FAF7F2] dark:bg-[#161311] rounded-xl border border-[#EAE2D8] dark:border-[#2E2823]">
                      {themesList.map((tItem) => {
                        const Icon = tItem.icon;
                        const isSelected = theme === tItem.id;
                        const themeName = language === 'id' ? tItem.labelId : tItem.labelEn;
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
                            title={themeName}
                            aria-label={themeName}
                            className={`flex-1 min-w-[34px] h-9 flex items-center justify-center rounded-lg transition-all cursor-pointer touch-manipulation ${
                              isSelected
                                ? 'bg-white dark:bg-[#2A231D] text-[#C85A32] shadow-xs ring-1.5 ring-[#C85A32]'
                                : 'text-[#7B6F63] dark:text-[#9F9184] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#EFE8DD] dark:hover:bg-[#201B17]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
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
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#C85A32]/10 hover:bg-[#C85A32]/20 text-[#C85A32] font-semibold transition-colors cursor-pointer text-left"
                    >
                      <ShieldCheck className="w-4.5 h-4.5 text-[#C85A32] shrink-0" />
                      <div>
                        <div className="leading-tight text-[13.5px] font-semibold">
                          {language === 'id' ? 'Buka Panel Admin' : 'Open Admin Panel'}
                        </div>
                        <div className="text-[11px] text-[#C85A32]/80 font-normal">
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
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] text-[#594E44] dark:text-[#C5B8AA] transition-colors cursor-pointer font-medium text-[13.5px]"
                    >
                      <Sparkles className="w-4.5 h-4.5 text-[#C85A32]" />
                      <span>{language === 'id' ? 'Log Pembaruan' : 'Update Logs'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] text-[#594E44] dark:text-[#C5B8AA] transition-colors cursor-pointer font-medium text-[13.5px]"
                  >
                    <Sliders className="w-4.5 h-4.5 text-[#8C6D4F]" />
                    <span>{t.syncAndData}</span>
                  </button>

                  {user && onSignOut && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onSignOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors pt-2 border-t border-[#EAE2D8] dark:border-[#2E2823] cursor-pointer font-medium text-[13.5px]"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      <span>{t.signOut}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Android & Mobile Sliding Carousel Bottom Dock Bar (Center Highlight & Dimmed Sides & Infinite Loop) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 dark:bg-[#161311]/95 backdrop-blur-xl border-t border-[#E5DDD2] dark:border-[#2D2722] safe-area-pb select-none">
        {/* Soft edge gradient masks to emphasize slide depth */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#FAF7F2] dark:from-[#161311] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#FAF7F2] dark:from-[#161311] to-transparent z-10" />

        <div
          ref={bottomNavContainerRef}
          onScroll={onScroll}
          className="flex items-center h-18 overflow-x-auto scrollbar-none scroll-smooth px-[38vw] snap-x snap-mandatory"
        >
          {infiniteNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.key}
                ref={(el) => {
                  bottomTabRefs.current[item.key] = el;
                }}
                type="button"
                onClick={() => {
                  onTabChange(item.id);
                  centerActiveTab(item.id, true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative flex flex-col items-center justify-center min-w-[76px] py-1.5 transition-all duration-300 ease-out touch-manipulation cursor-pointer snap-center shrink-0 ${
                  isActive
                    ? 'scale-115 opacity-100 z-10'
                    : 'scale-90 opacity-35 hover:opacity-60 z-0'
                }`}
              >
                <div
                  className={`p-2 rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'bg-[#C85A32]/15 text-[#C85A32] shadow-sm ring-1 ring-[#C85A32]/30'
                      : 'text-[#7B6F63] dark:text-[#9F9184]'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform" />
                </div>
                <span
                  className={`text-[11px] tracking-tight mt-1 whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'text-[#C85A32] font-bold'
                      : 'text-[#7B6F63] dark:text-[#9F9184] font-medium'
                  }`}
                >
                  {item.shortLabel}
                </span>

                {/* Subtle active dot underneath */}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C85A32] mt-0.5 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
