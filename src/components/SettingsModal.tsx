/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Check,
  Cloud,
  RefreshCw,
  Globe,
  Sparkles,
} from 'lucide-react';
import { UserPreferences } from '../types';
import { isSupabaseConfigured, testSupabaseConnection } from '../lib/supabase';
import { translations, Language } from '../lib/translations';
import { MassiveResetModal } from './Settings/MassiveResetModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onResetSeed: () => void;
  onClearAllData?: (mode: 'empty' | 'seed') => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onExportData,
  onImportData,
  onResetSeed,
  onClearAllData,
  language = 'id',
  onSelectLanguage,
}) => {
  const [calorieGoal, setCalorieGoal] = useState<number>(preferences?.defaultCalorieGoal ?? 2000);
  const [sugarLimit, setSugarLimit] = useState<number>(preferences?.defaultSugarLimit ?? 36);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'cloud'>('general');
  const [isMassiveResetOpen, setIsMassiveResetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or preferences update
  React.useEffect(() => {
    if (isOpen) {
      setCalorieGoal(preferences?.defaultCalorieGoal ?? 2000);
      setSugarLimit(preferences?.defaultSugarLimit ?? 36);
      setStatusMessage(null);
      setIsMassiveResetOpen(false);
    }
  }, [isOpen, preferences?.defaultCalorieGoal, preferences?.defaultSugarLimit]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isMassiveResetOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isMassiveResetOpen, onClose]);

  if (!isOpen) return null;

  const activeLang: Language = language === 'en' ? 'en' : 'id';
  const t = translations[activeLang]?.settings || translations.id.settings;

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({
      defaultCalorieGoal: Number(calorieGoal) || 2000,
      defaultSugarLimit: Number(sugarLimit) || 36,
    });
    setStatusMessage(
      activeLang === 'id'
        ? 'Target nutrisi berhasil diperbarui.'
        : 'Nutritional baseline targets updated.'
    );
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportData(content);
      if (success) {
        setStatusMessage(
          activeLang === 'id'
            ? 'Cadangan Notome berhasil dipulihkan!'
            : 'Notome backup successfully restored!'
        );
      } else {
        setStatusMessage(
          activeLang === 'id'
            ? 'Gagal: Format file cadangan JSON tidak valid.'
            : 'Error: Invalid JSON backup file.'
        );
      }
      setTimeout(() => setStatusMessage(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    const result = await testSupabaseConnection();
    setIsTestingSupabase(false);
    setStatusMessage(result.message);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg sm:max-w-xl rounded-t-3xl sm:rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FAF7F2] dark:bg-[#1C1815] p-5 sm:p-6 text-[#2D2823] dark:text-[#EAE3DA] shadow-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Grab Handle */}
        <div className="w-10 h-1 bg-[#D5CBC0] dark:bg-[#3D352F] rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-[#E4DCDB] dark:border-[#352F2B]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#8C6D4F]/15 flex items-center justify-center text-[#8C6D4F]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold">{t.title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#EFE8DD] dark:hover:bg-[#2A2420] text-[#7B6F63] transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subtabs */}
        <div className="flex items-center gap-2 mt-3 p-1 bg-[#F4ECE3] dark:bg-[#25201C] rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              activeTab === 'general'
                ? 'bg-white dark:bg-[#161311] text-[#2B241E] dark:text-[#EFE9E2] shadow-xs font-semibold'
                : 'text-[#6F645A] dark:text-[#A89C90]'
            }`}
          >
            {t.generalTab}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cloud')}
            className={`flex-1 py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'cloud'
                ? 'bg-white dark:bg-[#161311] text-[#2B241E] dark:text-[#EFE9E2] shadow-xs font-semibold'
                : 'text-[#6F645A] dark:text-[#A89C90]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{t.cloudTab}</span>
          </button>
        </div>

        {statusMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-[#5B7A58]/15 border border-[#5B7A58]/30 text-[#5B7A58] text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {activeTab === 'general' ? (
          <div className="mt-4 space-y-4 text-xs">
            {/* Language Selector */}
            <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-white/50 dark:bg-[#25201C]/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2]">
                  <Globe className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{t.languageLabel}</span>
                </div>
                <span className="text-[10px] text-[#7B6F63] uppercase tracking-wider font-mono">
                  {language.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onSelectLanguage('id')}
                  className={`min-h-[40px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all active:scale-[0.98] touch-manipulation ${
                    language === 'id'
                      ? 'border-[#C85A32] bg-[#C85A32]/10 text-[#C85A32] font-semibold shadow-xs'
                      : 'border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#F3ECE4]'
                  }`}
                >
                  <span className="text-sm">🇮🇩</span>
                  <span>Bahasa Indonesia</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectLanguage('en')}
                  className={`min-h-[40px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-medium transition-all active:scale-[0.98] touch-manipulation ${
                    language === 'en'
                      ? 'border-[#C85A32] bg-[#C85A32]/10 text-[#C85A32] font-semibold shadow-xs'
                      : 'border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#F3ECE4]'
                  }`}
                >
                  <span className="text-sm">🇬🇧</span>
                  <span>English</span>
                </button>
              </div>
            </div>

            {/* Visual Theme Selector */}
            <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-white/50 dark:bg-[#25201C]/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2]">
                  <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>{t.themeLabel || 'Tema Tampilan Aplikasi'}</span>
                </div>
                <span className="text-[10px] text-[#7B6F63] uppercase tracking-wider font-mono">
                  {preferences.theme}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {[
                  {
                    id: 'light' as const,
                    name: activeLang === 'id' ? 'Warm Paper' : 'Warm Paper',
                    sub: activeLang === 'id' ? 'Krem Arsip' : 'Archival Light',
                    bg: '#FAF7F2',
                    accent: '#C85A32',
                  },
                  {
                    id: 'dark' as const,
                    name: activeLang === 'id' ? 'Roast Dark' : 'Roast Dark',
                    sub: activeLang === 'id' ? 'Kopi Sangrai' : 'Espresso Dark',
                    bg: '#161311',
                    accent: '#D9822B',
                  },
                  {
                    id: 'cinema' as const,
                    name: activeLang === 'id' ? 'Cinema Velvet' : 'Cinema Velvet',
                    sub: activeLang === 'id' ? 'Merah Bioskop' : 'Noir Crimson',
                    bg: '#120406',
                    accent: '#E11D48',
                  },
                  {
                    id: 'romantic' as const,
                    name: activeLang === 'id' ? 'Romantic Rose' : 'Romantic Rose',
                    sub: activeLang === 'id' ? 'Pink Romantis' : 'Blush Pink',
                    bg: '#FDF7F8',
                    accent: '#DB2777',
                  },
                  {
                    id: 'christmas' as const,
                    name: 'Christmas Eve',
                    sub: activeLang === 'id' ? 'Malam Natal & Pinus' : 'Festive Pine & Berry',
                    bg: '#071911',
                    accent: '#DC2626',
                  },
                ].map((th) => {
                  const isSelected = preferences.theme === th.id;
                  const isChristmas = th.id === 'christmas';
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => onUpdatePreferences({ theme: th.id })}
                      className={`min-h-[48px] p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] touch-manipulation cursor-pointer flex items-center justify-between ${
                        isChristmas ? 'col-span-2' : ''
                      } ${
                        isSelected
                          ? 'border-[#C85A32] bg-[#C85A32]/10 ring-1 ring-[#C85A32]/30 shadow-xs font-semibold'
                          : 'border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] hover:bg-[#F3ECE4] dark:hover:bg-[#201B17]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-5 h-5 rounded-full border border-black/20 shrink-0 shadow-2xs flex items-center justify-center"
                          style={{ backgroundColor: th.bg }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: th.accent }}
                          />
                        </span>
                        <div>
                          <div className="text-xs text-[#2B241E] dark:text-[#EFE9E2]">
                            {th.name}
                          </div>
                          <div className="text-[10px] text-[#7B6F63] dark:text-[#9F9184]">
                            {th.sub}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-[#C85A32] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Calorie & Sugar Target configuration */}
            <form onSubmit={handleSaveGoals} className="space-y-3 p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-white/50 dark:bg-[#25201C]/50">
              <h4 className="font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2]">
                {t.nutritionalBaseline}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#7B6F63] mb-1">
                    {t.dailyCalorieTarget}
                  </label>
                  <input
                    type="number"
                    min="1000"
                    max="5000"
                    step="50"
                    value={calorieGoal}
                    onChange={(e) => setCalorieGoal(parseInt(e.target.value, 10) || 2000)}
                    className="w-full px-2.5 py-2 rounded-md border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#1C1815] font-mono tabular-nums text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#7B6F63] mb-1">
                    {t.dailySugarLimit}
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="120"
                    step="1"
                    value={sugarLimit}
                    onChange={(e) => setSugarLimit(parseInt(e.target.value, 10) || 36)}
                    className="w-full px-2.5 py-2 rounded-md border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#1C1815] font-mono tabular-nums text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#8C6D4F] text-white text-xs font-medium hover:bg-[#785C42] active:scale-[0.98] transition-all touch-manipulation"
              >
                {t.saveBaselines}
              </button>
            </form>

            {/* Offline Data Backup */}
            <div className="space-y-2 p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-white/50 dark:bg-[#25201C]/50">
              <h4 className="font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2]">
                {t.localBackupTitle}
              </h4>
              <p className="text-[11px] text-[#7B6F63] leading-relaxed">
                {t.localBackupDesc}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onExportData}
                  className="min-h-[42px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] hover:bg-[#F3ECE4] font-medium transition-all active:scale-[0.98] touch-manipulation"
                >
                  <Download className="w-3.5 h-3.5 text-[#8C6D4F]" />
                  <span>{t.downloadBackup}</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[42px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] hover:bg-[#F3ECE4] font-medium transition-all active:scale-[0.98] touch-manipulation"
                >
                  <Upload className="w-3.5 h-3.5 text-[#8C6D4F]" />
                  <span>{t.restoreFile}</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Reset to Clean Defaults */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-[#7B6F63]">{t.clearData}:</span>
              <button
                type="button"
                onClick={() => setIsMassiveResetOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 active:scale-95 transition-all touch-manipulation cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.clearData}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Cloud Sync Tab */
          <div className="mt-4 space-y-4 text-xs">
            {/* Status card */}
            <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-white/60 dark:bg-[#25201C]/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2]">
                  {t.cloudStatus}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                    isSupabaseConfigured
                      ? 'bg-[#5B7A58]/20 text-[#5B7A58]'
                      : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {isSupabaseConfigured ? t.connected : t.offline}
                </span>
              </div>

              <p className="text-[11px] text-[#7B6F63] leading-relaxed">
                {isSupabaseConfigured ? t.cloudConnectedDesc : t.cloudOfflineDesc}
              </p>

              {isSupabaseConfigured && (
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTestingSupabase}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] text-xs font-medium hover:bg-[#F3ECE4] disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                  <span>{t.testConnection}</span>
                </button>
              )}
            </div>

            {/* Notification & Schedule Reminder Preferences */}
            <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2]">
                  {t.scheduleAlertsTitle}
                </h4>
                <span className="text-[10px] text-[#5B7A58] font-medium">{t.activeWindow}</span>
              </div>
              <p className="text-[11px] text-[#7B6F63] leading-relaxed">
                {t.scheduleAlertsDesc}
              </p>
              <div className="pt-1 flex items-center justify-between text-[11px] text-[#594E44] dark:text-[#C5B8AA] border-t border-[#EAE2D8] dark:border-[#2E2823]">
                <span>Email Notifications:</span>
                <span className="font-mono text-[#5B7A58] font-semibold">{t.freeEmailBadge}</span>
              </div>
            </div>
          </div>
        )}

        {/* Massive Data Reset Modal */}
        <MassiveResetModal
          isOpen={isMassiveResetOpen}
          onClose={() => setIsMassiveResetOpen(false)}
          onExecuteReset={(mode) => {
            if (onClearAllData) {
              onClearAllData(mode);
            } else {
              onResetSeed();
            }
            setStatusMessage(
              activeLang === 'id'
                ? mode === 'empty'
                  ? 'Seluruh data berhasil dikosongkan total.'
                  : 'Data awal bawaan Notome berhasil dipulihkan.'
                : mode === 'empty'
                ? 'All data completely wiped.'
                : 'Default seed data restored.'
            );
            setTimeout(() => setStatusMessage(null), 3000);
          }}
          language={activeLang}
        />
      </div>
    </div>
  );
};
