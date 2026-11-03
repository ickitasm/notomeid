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
  Database,
  Cloud,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { UserPreferences, MediaItem, DailyNutritionLog, PetProfile, PetMedicalRecord, PetMedication, CalendarEvent } from '../types';
import { supabase, isSupabaseConfigured, testSupabaseConnection } from '../lib/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onResetSeed: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onExportData,
  onImportData,
  onResetSeed,
}) => {
  const [calorieGoal, setCalorieGoal] = useState(preferences.defaultCalorieGoal);
  const [sugarLimit, setSugarLimit] = useState(preferences.defaultSugarLimit);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'cloud'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({
      defaultCalorieGoal: Number(calorieGoal) || 2000,
      defaultSugarLimit: Number(sugarLimit) || 36,
    });
    setStatusMessage('Nutritional baseline targets updated.');
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
        setStatusMessage('Notome backup successfully restored!');
      } else {
        setStatusMessage('Error: Invalid JSON backup file.');
      }
      setTimeout(() => setStatusMessage(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetConfirm = () => {
    if (confirm('Restore initial sample data? Custom entries will be overwritten.')) {
      onResetSeed();
      setStatusMessage('Sample dataset restored.');
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    const result = await testSupabaseConnection();
    setIsTestingSupabase(false);
    setStatusMessage(result.message);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FAF7F2] dark:bg-[#1C1815] p-5 sm:p-6 text-[#2D2823] dark:text-[#EAE3DA] shadow-2xl max-h-[92vh] sm:max-h-[88vh] overflow-y-auto">
        {/* Mobile Grab Handle */}
        <div className="w-10 h-1 bg-[#D5CBC0] dark:bg-[#3D352F] rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-[#E4DCDB] dark:border-[#352F2B]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#8C6D4F]/15 flex items-center justify-center text-[#8C6D4F]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold">Notome Settings & Sync</h3>
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
            General & Backup
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
            <span>Vercel & Supabase</span>
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
            {/* Calorie & Sugar Target configuration */}
            <form onSubmit={handleSaveGoals} className="space-y-3 p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-white/50 dark:bg-[#25201C]/50">
              <h4 className="font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2]">
                Daily Nutritional Baseline Targets
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#7B6F63] mb-1">
                    Daily Calorie Target (kcal)
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
                    Daily Sugar Intake Ceiling (g)
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
                Save Nutrition Baselines
              </button>
            </form>

            {/* Offline Data Backup */}
            <div className="space-y-2 p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-white/50 dark:bg-[#25201C]/50">
              <h4 className="font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2]">
                Local Storage Backup & Restore
              </h4>
              <p className="text-[11px] text-[#7B6F63] leading-relaxed">
                Your movies, episodes, food logs, and pet health records are automatically saved in your browser. Download a backup anytime.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={onExportData}
                  className="min-h-[42px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] hover:bg-[#F3ECE4] font-medium transition-all active:scale-[0.98] touch-manipulation"
                >
                  <Download className="w-3.5 h-3.5 text-[#8C6D4F]" />
                  <span>Download Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[42px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] hover:bg-[#F3ECE4] font-medium transition-all active:scale-[0.98] touch-manipulation"
                >
                  <Upload className="w-3.5 h-3.5 text-[#8C6D4F]" />
                  <span>Restore File</span>
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

            {/* Reset to Seed */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-[#7B6F63]">Reset demo sample records:</span>
              <button
                type="button"
                onClick={handleResetConfirm}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] rounded border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 active:scale-95 transition-all touch-manipulation"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Data</span>
              </button>
            </div>
          </div>
        ) : (
          /* Cloud Hosting & Supabase Tab */
          <div className="mt-4 space-y-4 text-xs">
            {/* Status card */}
            <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-white/60 dark:bg-[#25201C]/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2]">
                  Supabase Cloud Status
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                    isSupabaseConfigured
                      ? 'bg-[#5B7A58]/20 text-[#5B7A58]'
                      : 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  {isSupabaseConfigured ? 'Connected' : 'Offline / LocalStorage'}
                </span>
              </div>

              <p className="text-[11px] text-[#7B6F63] leading-relaxed">
                {isSupabaseConfigured
                  ? 'VITE_SUPABASE_URL is detected. Your app can query and persist to your Supabase PostgreSQL cluster.'
                  : 'Currently running in high-speed offline local storage mode. Once you configure your Supabase URL & Anon Key on Vercel, cloud persistence activates automatically.'}
              </p>

              {isSupabaseConfigured && (
                <button
                  type="button"
                  onClick={handleTestSupabase}
                  disabled={isTestingSupabase}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] text-xs font-medium hover:bg-[#F3ECE4] disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingSupabase ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              )}
            </div>

            {/* Quick 3-Step Vercel & Supabase Roadmap */}
            <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#F7F2EB] dark:bg-[#221C18] space-y-2.5">
              <h4 className="font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2]">
                Langkah Gratis Hosting Vercel & Supabase
              </h4>
              <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-[#594E44] dark:text-[#C5B8AA] leading-relaxed">
                <li>
                  <strong>Buka Supabase.com (Free Tier):</strong> Buat project baru, lalu buka menu <code>SQL Editor</code> dan jalankan file <code>supabase_schema.sql</code> yang telah disediakan di root proyek ini.
                </li>
                <li>
                  <strong>Ambil Kunci API:</strong> Di Supabase <code>Project Settings &gt; API</code>, salin <strong>Project URL</strong> dan <strong>anon/public Key</strong>.
                </li>
                <li>
                  <strong>Deploy ke Vercel (Free Tier):</strong> Hubungkan repository GitHub ke Vercel, lalu masukkan 2 Environment Variables:
                  <div className="mt-1 font-mono text-[10px] bg-white/70 dark:bg-black/30 p-2 rounded border border-[#E4DCDB] dark:border-[#352F2B]">
                    VITE_SUPABASE_URL = https://xxx.supabase.co<br />
                    VITE_SUPABASE_ANON_KEY = eyJhbGci...
                  </div>
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
