/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Language } from '../../lib/translations';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  description?: string;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  cancelText?: string;
  language?: Language;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  description,
  confirmLabel,
  confirmText,
  cancelLabel,
  cancelText,
  language = 'id',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const defaultTitle = language === 'id' ? 'Konfirmasi Hapus' : 'Confirm Deletion';
  const defaultDesc =
    language === 'id'
      ? 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.'
      : 'Are you sure you want to delete this item? This action cannot be undone.';
  const defaultConfirm = language === 'id' ? 'Hapus Permanen' : 'Delete Permanently';
  const defaultCancel = language === 'id' ? 'Batal' : 'Cancel';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#FFFDF9] dark:bg-[#1C1815] rounded-2xl border border-[#E5DDD2] dark:border-[#38312B] shadow-2xl p-5 sm:p-6 my-auto transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Warning Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
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

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#2B241E] dark:text-[#EFE9E2] leading-snug">
            {title || defaultTitle}
          </h3>

          {itemName && (
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#14110F] border border-[#EAE2D8] dark:border-[#2D2722] text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2] truncate">
              "{itemName}"
            </div>
          )}

          <p className="text-xs sm:text-sm text-[#7B6F63] dark:text-[#9F9184] leading-relaxed">
            {description || defaultDesc}
          </p>
        </div>

        {/* Buttons (Ergonomic Touch Targets >= 44px) */}
        <div className="flex items-center justify-end gap-2.5 pt-5 mt-4 border-t border-[#EAE2D8] dark:border-[#2E2823]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] transition-colors cursor-pointer"
          >
            {cancelText || cancelLabel || defaultCancel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-xs transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{confirmText || confirmLabel || defaultConfirm}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
