/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Download,
  Upload,
  RotateCcw,
  Sliders,
  Check,
  Cloud,
  RefreshCw,
  Globe,
  Sparkles,
  CheckCircle2,
  Utensils,
  Database,
} from 'lucide-react';
import { UserPreferences, ThemeMode } from '../../types';
import { isSupabaseConfigured, testSupabaseConnection } from '../../lib/supabase';
import { translations, Language } from '../../lib/translations';
import { MassiveResetModal } from './MassiveResetModal';

export interface SettingsViewProps {
  onBack: () => void;
  previousTabName?: string;
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onResetSeed: () => void;
  onClearAllData?: (mode: 'empty' | 'seed') => void;
  language: Language;
  onSelectLanguage: (lang: Language) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  previousTabName,
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
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    const ok = await testSupabaseConnection();
    setIsTestingSupabase(false);
    setStatusMessage(
      ok
        ? activeLang === 'id'
          ? 'Koneksi Cloud Notome aktif & responsif.'
          : 'Notome Cloud database connection responsive.'
        : activeLang === 'id'
        ? 'Koneksi database Cloud tidak dapat dihubungi.'
        : 'Failed to reach cloud database.'
    );
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const allThemes: {
    id: ThemeMode;
    name: string;
    sub: string;
    bg: string;
    accent: string;
  }[] = [
    {
      id: 'light',
      name: 'Warm Paper',
      sub: activeLang === 'id' ? 'Krem Arsip Lembut' : 'Archival Warm Paper',
      bg: '#FAF7F2',
      accent: '#C85A32',
    },
    {
      id: 'dark',
      name: 'Roast Dark',
      sub: activeLang === 'id' ? 'Kopi Sangrai Tenang' : 'Espresso Dark Roast',
      bg: '#161311',
      accent: '#D9822B',
    },
    {
      id: 'cinema',
      name: 'Cinema Velvet',
      sub: activeLang === 'id' ? 'Merah Bioskop Klasik' : 'Noir Crimson Cinema',
      bg: '#120406',
      accent: '#E11D48',
    },
    {
      id: 'romantic',
      name: 'Romantic Rose',
      sub: activeLang === 'id' ? 'Pink Bunga Mawar' : 'Blush Pink Elegance',
      bg: '#FDF7F8',
      accent: '#DB2777',
    },
    {
      id: 'christmas',
      name: 'Christmas Eve',
      sub: activeLang === 'id' ? 'Malam Natal & Pinus Salju' : 'Festive Pine & Berry',
      bg: '#071911',
      accent: '#DC2626',
    },
    {
      id: 'halloween',
      name: 'Halloween Horror',
      sub: activeLang === 'id' ? 'Labu Horor & Kabut Gelap' : 'Spooky Pumpkin Mist',
      bg: '#0D0914',
      accent: '#FF7518',
    },
    {
      id: 'retro',
      name: 'Arcade 8-Bit',
      sub: activeLang === 'id' ? 'Konsol Piksel Nostalgia' : 'Retro Neon Cyber Arcade',
      bg: '#080B10',
      accent: '#00F5D4',
    },
  ];

  return (
    <div className="max-w-4xl w-full mx-auto pb-16 space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Return Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#E0D7CB] dark:border-[#38312B]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#201B17] hover:bg-[#F4ECE3] dark:hover:bg-[#28221D] text-[#594E44] dark:text-[#C5B8AA] font-semibold text-[13.5px] transition-all active:scale-95 cursor-pointer self-start shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#C85A32]" />
          <span>
            {activeLang === 'id'
              ? `Kembali ke ${previousTabName || 'Modul'}`
              : `Back to ${previousTabName || 'Module'}`}
          </span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-[#8F8275] dark:text-[#A89C90]">
          <Sliders className="w-4 h-4 text-[#C85A32]" />
          <span>Notome Personal Sanctuary · Settings</span>
        </div>
      </div>

      {/* Page Title & Editorial Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
          {t.title}
        </h1>
        <p className="text-[13.5px] sm:text-sm text-[#7B6F63] dark:text-[#9F9184] mt-1.5 leading-relaxed">
          {activeLang === 'id'
            ? 'Kelola preferensi personal, integrasi cloud, tema tampilan, dan cadangan data privat Anda.'
            : 'Manage your personal preferences, cloud sync status, visual theme, and private offline backups.'}
        </p>
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div className="p-3.5 rounded-xl border border-[#5B7A58]/35 bg-[#5B7A58]/15 text-[#324C30] dark:text-[#92C48E] text-[13px] flex items-center gap-2.5 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#5B7A58]" />
          <span className="font-medium">{statusMessage}</span>
        </div>
      )}

      {/* Tab Segment Controls */}
      <div className="flex border-b border-[#E0D7CB] dark:border-[#38312B] gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`pb-3 font-semibold text-[14px] sm:text-[15px] transition-colors border-b-2 cursor-pointer ${
            activeTab === 'general'
              ? 'border-[#C85A32] text-[#C85A32]'
              : 'border-transparent text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
          }`}
        >
          {t.generalTab}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cloud')}
          className={`pb-3 font-semibold text-[14px] sm:text-[15px] transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'cloud'
              ? 'border-[#C85A32] text-[#C85A32]'
              : 'border-transparent text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
          }`}
        >
          <Cloud className="w-4.5 h-4.5" />
          <span>{t.cloudTab}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' ? (
        <div className="space-y-6">
          {/* Section 1: Display Language (Flags ONLY as requested) */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] space-y-3 shadow-xs">
            <div className="flex items-center gap-2 font-serif font-bold text-[14px] sm:text-[15px] text-[#2B241E] dark:text-[#EFE9E2]">
              <Globe className="w-4.5 h-4.5 text-[#8C6D4F]" />
              <span>{t.languageLabel}</span>
            </div>
            <p className="text-xs text-[#7B6F63] dark:text-[#9F9184]">
              {activeLang === 'id'
                ? 'Pilih bahasa antarmuka (Bahasa Indonesia / English)'
                : 'Select application interface language'}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onSelectLanguage('id')}
                title="Bahasa Indonesia"
                aria-label="Bahasa Indonesia"
                className={`min-h-[50px] min-w-[70px] px-4 py-2 rounded-xl border text-2xl transition-all active:scale-95 touch-manipulation cursor-pointer flex items-center justify-center ${
                  language === 'id'
                    ? 'border-[#C85A32] bg-[#C85A32]/10 ring-2 ring-[#C85A32]/40 shadow-xs'
                    : 'border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] hover:bg-[#F3ECE4] dark:hover:bg-[#2A231D] opacity-60 hover:opacity-100'
                }`}
              >
                <span>🇮🇩</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectLanguage('en')}
                title="English"
                aria-label="English"
                className={`min-h-[50px] min-w-[70px] px-4 py-2 rounded-xl border text-2xl transition-all active:scale-95 touch-manipulation cursor-pointer flex items-center justify-center ${
                  language === 'en'
                    ? 'border-[#C85A32] bg-[#C85A32]/10 ring-2 ring-[#C85A32]/40 shadow-xs'
                    : 'border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] hover:bg-[#F3ECE4] dark:hover:bg-[#2A231D] opacity-60 hover:opacity-100'
                }`}
              >
                <span>🇬🇧</span>
              </button>
            </div>
          </div>

          {/* Section 2: Complete 7-Theme Visual Theme Selector */}
          <div className="p-4 sm:p-5 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-serif font-bold text-[14px] sm:text-[15px] text-[#2B241E] dark:text-[#EFE9E2]">
                <Sparkles className="w-4.5 h-4.5 text-[#C85A32]" />
                <span>{t.themeLabel || 'Tema Tampilan Aplikasi'}</span>
              </div>
              <span className="text-xs text-[#7B6F63] uppercase tracking-wider font-mono font-medium">
                {preferences.theme}
              </span>
            </div>
            <p className="text-xs text-[#7B6F63] dark:text-[#9F9184]">
              {activeLang === 'id'
                ? 'Tersedia 7 tema visual lengkap untuk suasana ruang personal Anda'
                : 'Available in 7 visual themes for your personal sanctuary ambience'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
              {allThemes.map((th) => {
                const isSelected = preferences.theme === th.id;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => onUpdatePreferences({ theme: th.id })}
                    className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] touch-manipulation cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'border-[#C85A32] bg-[#C85A32]/10 ring-1.5 ring-[#C85A32]/40 shadow-xs font-semibold'
                        : 'border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] hover:bg-[#F3ECE4] dark:hover:bg-[#201B17]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-5 h-5 rounded-full border border-black/20 shrink-0 shadow-2xs flex items-center justify-center"
                        style={{ backgroundColor: th.bg }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: th.accent }}
                        />
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-[#2B241E] dark:text-[#EFE9E2] truncate">
                          {th.name}
                        </div>
                        <div className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] truncate">
                          {th.sub}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#C85A32] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Nutritional Baseline Targets */}
          <form
            onSubmit={handleSaveGoals}
            className="space-y-4 p-4 sm:p-5 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs"
          >
            <div className="flex items-center gap-2 font-serif font-bold text-[14px] sm:text-[15px] text-[#2B241E] dark:text-[#EFE9E2]">
              <Utensils className="w-4.5 h-4.5 text-[#C85A32]" />
              <span>{t.nutritionalBaseline}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#7B6F63] dark:text-[#9F9184] mb-1.5">
                  {t.dailyCalorieTarget}
                </label>
                <input
                  type="number"
                  min="1000"
                  max="5000"
                  step="50"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(parseInt(e.target.value, 10) || 2000)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#1C1815] font-mono tabular-nums text-sm text-[#2B241E] dark:text-[#EFE9E2]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#7B6F63] dark:text-[#9F9184] mb-1.5">
                  {t.dailySugarLimit}
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  step="1"
                  value={sugarLimit}
                  onChange={(e) => setSugarLimit(parseInt(e.target.value, 10) || 36)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#1C1815] font-mono tabular-nums text-sm text-[#2B241E] dark:text-[#EFE9E2]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-[#8C6D4F] text-white text-[13.5px] font-semibold hover:bg-[#785C42] active:scale-[0.98] transition-all touch-manipulation cursor-pointer"
            >
              {t.saveBaselines}
            </button>
          </form>

          {/* Section 4: Offline Data Backup & Recovery */}
          <div className="space-y-3.5 p-4 sm:p-5 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs">
            <div className="flex items-center gap-2 font-serif font-bold text-[14px] sm:text-[15px] text-[#2B241E] dark:text-[#EFE9E2]">
              <Database className="w-4.5 h-4.5 text-[#8C6D4F]" />
              <span>{t.localBackupTitle}</span>
            </div>
            <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] leading-relaxed">
              {t.localBackupDesc}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onExportData}
                className="min-h-[44px] flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] hover:bg-[#F3ECE4] dark:hover:bg-[#28221D] text-xs sm:text-[13px] font-semibold transition-all active:scale-[0.98] touch-manipulation cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#8C6D4F]" />
                <span>{t.downloadBackup}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[44px] flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] hover:bg-[#F3ECE4] dark:hover:bg-[#28221D] text-xs sm:text-[13px] font-semibold transition-all active:scale-[0.98] touch-manipulation cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#8C6D4F]" />
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

          {/* Section 5: Reset / Clear Data */}
          <div className="pt-2 flex items-center justify-between p-4 rounded-2xl border border-rose-200/60 dark:border-rose-950/60 bg-rose-50/30 dark:bg-rose-950/15">
            <div>
              <div className="text-[13px] font-semibold text-rose-700 dark:text-rose-400">
                {t.clearData}
              </div>
              <div className="text-[11.5px] text-[#7B6F63] dark:text-[#9F9184]">
                {activeLang === 'id'
                  ? 'Kembalikan data ke kondisi awal pabrik atau kosongkan total.'
                  : 'Reset data to factory defaults or wipe clean.'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsMassiveResetOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 bg-white dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 active:scale-95 transition-all touch-manipulation cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.clearData}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Cloud Sync Tab (Only Cloud Sync Status as requested) */
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm sm:text-base text-[#2B241E] dark:text-[#EFE9E2]">
                {t.cloudStatus}
              </span>
              <span
                className={`text-xs px-3 py-1 rounded-full font-mono font-semibold ${
                  isSupabaseConfigured
                    ? 'bg-[#5B7A58]/20 text-[#5B7A58]'
                    : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                }`}
              >
                {isSupabaseConfigured ? t.connected : t.offline}
              </span>
            </div>

            <p className="text-xs sm:text-[13.5px] text-[#7B6F63] dark:text-[#9F9184] leading-relaxed">
              {isSupabaseConfigured ? t.cloudConnectedDesc : t.cloudOfflineDesc}
            </p>

            {isSupabaseConfigured && (
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={isTestingSupabase}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#201B17] text-xs sm:text-[13px] font-semibold text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#F3ECE4] dark:hover:bg-[#28221D] disabled:opacity-50 transition-colors cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`w-4 h-4 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                <span>{t.testConnection}</span>
              </button>
            )}
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
  );
};
