/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertOctagon, Trash2, X, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Language } from '../../lib/translations';

interface MassiveResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteReset: (mode: 'empty' | 'seed') => void;
  language: Language;
}

export const MassiveResetModal: React.FC<MassiveResetModalProps> = ({
  isOpen,
  onClose,
  onExecuteReset,
  language,
}) => {
  const [resetMode, setResetMode] = useState<'empty' | 'seed'>('empty');
  const [confirmInput, setConfirmInput] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const targetKeyword = language === 'id' ? 'HAPUS' : 'DELETE';
  const isKeywordMatched = confirmInput.trim().toUpperCase() === targetKeyword;

  useEffect(() => {
    if (isOpen) {
      setConfirmInput('');
      setResetMode('empty');
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isKeywordMatched) return;
    setIsSuccess(true);
    setTimeout(() => {
      onExecuteReset(resetMode);
      onClose();
    }, 600);
  };

  const isId = language === 'id';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#FFFDF9] dark:bg-[#1C1815] rounded-2xl border border-rose-300/80 dark:border-rose-900/60 shadow-2xl p-5 sm:p-7 my-auto transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-rose-700 dark:text-rose-400">
                {isId ? 'Reset Seluruh Data Masif' : 'Massive Data Wipe & Reset'}
              </h3>
              <p className="text-[11px] text-[#8F8275] font-mono mt-0.5">
                {isId ? 'Tindakan Destruktif Permanen' : 'Permanent Destructive Action'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8F8275] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#28221D] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 leading-relaxed text-xs">
            {isId ? (
              <span>
                <strong>Perhatian:</strong> Tindakan ini akan menghapus <strong>seluruh data lokal</strong> Anda tanpa terkecuali, meliputi: seluruh riwayat film/serial, log nutrisi & makanan harian, catatan medis & obat anabul, agenda kalender, semua catatan & footnotes, serta jurnal mimpi.
              </span>
            ) : (
              <span>
                <strong>Warning:</strong> This action will permanently erase <strong>all your local data</strong>, including all cinema/series logs, nutrition & meal records, pet healthcare records, calendar events, notes with footnotes, and sleep dream journals.
              </span>
            )}
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184] mb-2">
              {isId ? 'Pilih Mode Pembersihan' : 'Select Reset Mode'}
            </label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  resetMode === 'empty'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20 text-[#2B241E] dark:text-[#EFE9E2]'
                    : 'border-[#E0D7CB] dark:border-[#332C26] bg-[#FAF7F2] dark:bg-[#14110F] text-[#7B6F63] dark:text-[#9F9184]'
                }`}
              >
                <input
                  type="radio"
                  name="resetMode"
                  value="empty"
                  checked={resetMode === 'empty'}
                  onChange={() => setResetMode('empty')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <div className="font-semibold text-xs sm:text-sm">
                    {isId ? 'Kosongkan Seluruh Data (Fresh Zero State)' : 'Wipe Clean (Zero State)'}
                  </div>
                  <div className="text-[11px] text-[#8F8275] mt-0.5">
                    {isId
                      ? 'Semua data dihapus bersih menjadi kosong total siap pakai baru.'
                      : 'All records emptied completely, leaving a fresh clean slate.'}
                  </div>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  resetMode === 'seed'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-[#2B241E] dark:text-[#EFE9E2]'
                    : 'border-[#E0D7CB] dark:border-[#332C26] bg-[#FAF7F2] dark:bg-[#14110F] text-[#7B6F63] dark:text-[#9F9184]'
                }`}
              >
                <input
                  type="radio"
                  name="resetMode"
                  value="seed"
                  checked={resetMode === 'seed'}
                  onChange={() => setResetMode('seed')}
                  className="mt-0.5 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="font-semibold text-xs sm:text-sm">
                    {isId ? 'Reset ke Data Bawaan Notome (Seed Data)' : 'Reset to Default Seed Data'}
                  </div>
                  <div className="text-[11px] text-[#8F8275] mt-0.5">
                    {isId
                      ? 'Mengembalikan seluruh data ke sampel lengkap awal bawaan Notome.'
                      : 'Restores all records to Notome default sample catalogues.'}
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Verification Keyword Input */}
          <div className="p-3.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-[#FAF7F2] dark:bg-[#14110F] space-y-2">
            <label className="block text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2]">
              {isId ? (
                <span>
                  Ketik kata konfirmasi <strong className="font-mono text-rose-600 dark:text-rose-400">{targetKeyword}</strong> di bawah untuk membuka proteksi:
                </span>
              ) : (
                <span>
                  Type the confirmation phrase <strong className="font-mono text-rose-600 dark:text-rose-400">{targetKeyword}</strong> below to unlock:
                </span>
              )}
            </label>
            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={targetKeyword}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FFFDF9] dark:bg-[#1C1815] text-[#2B241E] dark:text-[#EFE9E2] font-mono font-bold tracking-wider uppercase text-center focus:outline-hidden focus:ring-2 focus:ring-rose-500/40 text-sm"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-4 border-t border-[#EAE2D8] dark:border-[#2E2823]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] transition-colors cursor-pointer"
          >
            {isId ? 'Batal' : 'Cancel'}
          </button>
          <button
            type="button"
            disabled={!isKeywordMatched || isSuccess}
            onClick={handleConfirm}
            className={`min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer ${
              isKeywordMatched && !isSuccess
                ? 'bg-rose-600 hover:bg-rose-700 text-white active:scale-95'
                : 'bg-rose-300 dark:bg-rose-950/40 text-white/50 cursor-not-allowed opacity-60'
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white animate-spin" />
                <span>{isId ? 'Membersihkan Data...' : 'Wiping Data...'}</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>{isId ? 'Hapus Semua Data Sekarang' : 'Execute Massive Reset'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
