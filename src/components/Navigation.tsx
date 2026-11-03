/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Film, Utensils, HeartPulse, Calendar, Sun, Moon, Database, LogOut, User, CheckCircle2 } from 'lucide-react';
import { AppUser } from '../hooks/useAuth';

export type ActiveTab = 'media' | 'nutrition' | 'pets' | 'calendar';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  user?: AppUser | null;
  onSignOut?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  onOpenSettings,
  user,
  onSignOut,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems: { id: ActiveTab; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'media', label: 'Cinema & Series', shortLabel: 'Cinema', icon: Film },
    { id: 'nutrition', label: 'Nutrition & Metrics', shortLabel: 'Nutrition', icon: Utensils },
    { id: 'pets', label: 'Pet Records', shortLabel: 'Pets', icon: HeartPulse },
    { id: 'calendar', label: 'Master Calendar', shortLabel: 'Calendar', icon: Calendar },
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

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 border-b border-[#E5DDD2] dark:border-[#2D2722] bg-[#FAF7F2]/95 dark:bg-[#161311]/95 backdrop-blur-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Brand wordmark */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onTabChange('media')}
              className="flex items-center gap-2.5 text-left group focus-visible:outline-hidden touch-manipulation"
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

          {/* Zone 2: Desktop 4 concise nav tabs */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 touch-manipulation ${
                    isActive
                      ? 'bg-[#EFE8DD] dark:bg-[#28221D] text-[#2B241E] dark:text-[#EFE9E2] font-semibold shadow-xs'
                      : 'text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#201B17]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C85A32]' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Utilities (Theme, Settings & Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] active:scale-95 transition-all touch-manipulation"
              title={theme === 'dark' ? 'Switch to warm light theme' : 'Switch to roast dark theme'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D9822B]" /> : <Moon className="w-4 h-4 text-[#6F645A]" />}
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              className="min-h-[36px] px-2.5 sm:px-3 flex items-center gap-1.5 text-xs font-medium rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] active:scale-95 transition-all whitespace-nowrap shrink-0 touch-manipulation"
              title="Cloud Sync, Backup & Settings"
            >
              <Database className="w-3.5 h-3.5 text-[#8C6D4F]" />
              <span className="hidden sm:inline">Sync & Data</span>
            </button>

            {/* Profile Dropdown */}
            {user && (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] hover:border-[#C85A32]/40 transition-colors touch-manipulation cursor-pointer"
                  title="Account Details"
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
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-3 shadow-xl z-50 text-xs space-y-2.5">
                    <div className="pb-2 border-b border-[#EAE2D8] dark:border-[#2E2823]">
                      <div className="font-semibold text-[#2B241E] dark:text-[#EFE9E2] truncate">
                        {user.fullName || 'Notome Member'}
                      </div>
                      <div className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] font-mono truncate">
                        {user.email}
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-[#5B7A58] font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Google Identity Verified</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        onOpenSettings();
                      }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] text-[#594E44] dark:text-[#C5B8AA] transition-colors"
                    >
                      <Database className="w-3.5 h-3.5 text-[#8C6D4F]" />
                      <span>Database & Sync Settings</span>
                    </button>

                    {onSignOut && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileOpen(false);
                          onSignOut();
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors pt-2 border-t border-[#EAE2D8] dark:border-[#2E2823]"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Notome</span>
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
        <nav className="grid grid-cols-4 items-center h-16 max-w-md mx-auto px-1">
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
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap font-medium">
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
