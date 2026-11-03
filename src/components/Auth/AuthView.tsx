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
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User,
  CheckCircle2,
} from 'lucide-react';

interface AuthViewProps {
  onSignInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  onSignInWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  onSignUpWithEmail: (email: string, pass: string, name?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  onLoginDemo: (email?: string) => void;
  isSupabaseConfigured: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  error?: string | null;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onSignInWithGoogle,
  onSignInWithEmail,
  onSignUpWithEmail,
  onLoginDemo,
  isSupabaseConfigured,
  theme,
  onToggleTheme,
  error: externalError,
}) => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const errorMessage = localError || externalError;

  const handleGoogleClick = async () => {
    setLoading(true);
    setLocalError(null);
    const res = await onSignInWithGoogle();
    if (!res.success && res.error) {
      setLocalError(res.error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setLocalError(null);
    setSuccessNotice(null);

    if (tab === 'signin') {
      const res = await onSignInWithEmail(email.trim(), password);
      if (!res.success && res.error) {
        setLocalError(res.error);
      }
    } else {
      const res = await onSignUpWithEmail(email.trim(), password, fullName.trim() || undefined);
      if (!res.success && res.error) {
        setLocalError(res.error);
      } else if (res.message) {
        setSuccessNotice(res.message);
      }
    }
    setLoading(false);
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

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] transition-colors touch-manipulation"
          title={theme === 'dark' ? 'Switch to warm light theme' : 'Switch to roast dark theme'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D9822B]" /> : <Moon className="w-4 h-4 text-[#6F645A]" />}
        </button>
      </header>

      {/* Main Authentication Grid */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full items-center">
          {/* Left Column: Brand Story & 4 Pillars */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C85A32]/10 text-[#C85A32] text-xs font-mono font-semibold tracking-wide mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personal Life Chronicle</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2] leading-tight">
                One private hub for cinema, nutrition & companions.
              </h1>
              <p className="text-sm sm:text-base text-[#7B6F63] dark:text-[#9F9184] mt-3 leading-relaxed">
                Organize episodic watch progression, daily calorie and sugar targets, and veterinary immunization records in an editorial sanctuary.
              </p>
            </div>

            {/* 4 Life Pillars Strip */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9]/80 dark:bg-[#1C1815]/80">
                <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#C85A32]">
                  <Film className="w-4 h-4" />
                  <span>Cinema & Series</span>
                </div>
                <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] mt-1">
                  Track seasons, episodes, and premiere watch dates.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9]/80 dark:bg-[#1C1815]/80">
                <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#5B7A58]">
                  <Utensils className="w-4 h-4" />
                  <span>Daily Nutrition</span>
                </div>
                <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] mt-1">
                  Calories, sugar limits, weight curves & meal logs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9]/80 dark:bg-[#1C1815]/80">
                <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#A86438]">
                  <HeartPulse className="w-4 h-4" />
                  <span>Pet Healthcare</span>
                </div>
                <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] mt-1">
                  Lifelong vaccines, vet exams & booster reminders.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9]/80 dark:bg-[#1C1815]/80">
                <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#C4933F]">
                  <Calendar className="w-4 h-4" />
                  <span>Master Calendar</span>
                </div>
                <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] mt-1">
                  Synchronized schedule bridging all life pillars.
                </p>
              </div>
            </div>

            {/* Free Tier Guarantee Banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F4ECE3]/60 dark:bg-[#201B17]/60 border border-[#E4DCDB] dark:border-[#352F2B] text-xs text-[#7B6F63] dark:text-[#9F9184]">
              <ShieldCheck className="w-4 h-4 text-[#5B7A58] shrink-0 mt-0.5" />
              <span>
                <strong>100% Free Forever:</strong> Supabase Auth & Google OAuth include 50,000 monthly active users at zero cost. No credit card required.
              </span>
            </div>
          </div>

          {/* Right Column: Focused Auth Card */}
          <div className="lg:col-span-6 max-w-md w-full mx-auto">
            <div className="rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-6 sm:p-8 shadow-xl space-y-5">
              {/* Card Header & Tabs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
                    {tab === 'signin' ? 'Sign In to Notome' : 'Create Your Account'}
                  </h2>
                </div>

                <div className="flex items-center p-1 bg-[#F4ECE3] dark:bg-[#25201C] rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signin');
                      setLocalError(null);
                      setSuccessNotice(null);
                    }}
                    className={`flex-1 py-1.5 rounded-md transition-colors ${
                      tab === 'signin'
                        ? 'bg-white dark:bg-[#161311] text-[#2B241E] dark:text-[#EFE9E2] shadow-xs font-semibold'
                        : 'text-[#6F645A] dark:text-[#A89C90]'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTab('signup');
                      setLocalError(null);
                      setSuccessNotice(null);
                    }}
                    className={`flex-1 py-1.5 rounded-md transition-colors ${
                      tab === 'signup'
                        ? 'bg-white dark:bg-[#161311] text-[#2B241E] dark:text-[#EFE9E2] shadow-xs font-semibold'
                        : 'text-[#6F645A] dark:text-[#A89C90]'
                    }`}
                  >
                    Create Account
                  </button>
                </div>
              </div>

              {/* Status messages */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs">
                  {errorMessage}
                </div>
              )}

              {successNotice && (
                <div className="p-3 rounded-lg bg-[#5B7A58]/15 border border-[#5B7A58]/30 text-[#5B7A58] text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Primary Action: One-Click Google Sign In */}
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={loading}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl border border-[#D5CBC0] dark:border-[#403832] bg-white dark:bg-[#25201C] hover:bg-[#F9F5EF] dark:hover:bg-[#2E2823] active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-medium text-xs sm:text-sm text-[#2B241E] dark:text-[#EFE9E2] shadow-xs touch-manipulation cursor-pointer"
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
                <span>Continue with Google (Gmail)</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E4DCDB] dark:border-[#352F2B]" />
                <span className="text-[11px] text-[#8F8275] font-mono uppercase tracking-wider">
                  or with email
                </span>
                <div className="flex-1 h-px bg-[#E4DCDB] dark:border-[#352F2B]" />
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                {tab === 'signup' && (
                  <div>
                    <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8275]" />
                      <input
                        type="text"
                        placeholder="e.g. Mike Rafael"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                    Gmail / Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8275]" />
                    <input
                      type="email"
                      required
                      placeholder="name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8275]" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-[#C85A32] text-white font-medium text-xs sm:text-sm hover:bg-[#B34B25] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xs touch-manipulation cursor-pointer"
                >
                  <span>{tab === 'signin' ? 'Sign In' : 'Create Notome Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Developer & Sandbox Fast Preview Login */}
              <div className="pt-3 border-t border-[#E4DCDB] dark:border-[#352F2B] text-center space-y-2">
                <div className="text-[11px] text-[#7B6F63]">
                  Development & Instant Preview Shortcut:
                </div>
                <button
                  type="button"
                  onClick={() => onLoginDemo('mike777rafael@gmail.com')}
                  className="w-full py-2 px-3 rounded-lg border border-dashed border-[#C85A32]/60 bg-[#C85A32]/5 hover:bg-[#C85A32]/10 text-[#C85A32] text-xs font-medium transition-colors"
                >
                  ⚡ Enter as mike777rafael@gmail.com
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#E5DDD2] dark:border-[#2D2722] py-4 text-xs text-[#8F8275] text-center">
        <div className="max-w-7xl mx-auto px-4">
          Notome · Personal Life Hub · Free Cloud Sync via Supabase & Google Identity
        </div>
      </footer>
    </div>
  );
};
