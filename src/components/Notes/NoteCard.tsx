/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Pin, ChevronDown, ChevronUp, Copy, Check, Edit3, Trash2 } from 'lucide-react';
import { NoteItem, NoteCategory } from '../../types';
import { translations, Language } from '../../lib/translations';

interface NoteCardProps {
  note: NoteItem;
  onEdit: (note: NoteItem) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  language: Language;
}

const CATEGORY_NAMES: Record<NoteCategory, { id: string; en: string }> = {
  idea: { id: 'Ide', en: 'Idea' },
  project: { id: 'Proyek', en: 'Project' },
  personal: { id: 'Pribadi', en: 'Personal' },
  research: { id: 'Riset', en: 'Research' },
  archive: { id: 'Arsip', en: 'Archive' },
};

const CATEGORY_ACCENT: Record<NoteCategory, string> = {
  idea: 'text-blue-600 dark:text-blue-400',
  project: 'text-[#C85A32]',
  personal: 'text-[#5B7A58]',
  research: 'text-[#D97706]',
  archive: 'text-stone-500',
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  language,
}) => {
  const t = translations[language].notes;
  const [isFootnotesOpen, setIsFootnotesOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const hasFootnotes = note.footnotes && note.footnotes.length > 0;
  const categoryLabel = CATEGORY_NAMES[note.category]?.[language] || note.category;
  const accentClass = CATEGORY_ACCENT[note.category] || 'text-[#D97706]';

  const handleCopy = () => {
    let textToCopy = `${note.title}\n\n${note.content}`;
    if (hasFootnotes) {
      textToCopy += `\n\n--- ${language === 'id' ? 'Catatan Kaki' : 'Footnotes'} ---`;
      note.footnotes.forEach((fn) => {
        textToCopy += `\n[${fn.index}] ${fn.label}: ${fn.content}`;
      });
    }

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const formattedDate = new Date(note.updatedAt || note.createdAt).toLocaleDateString(
    language === 'id' ? 'id-ID' : 'en-US',
    { month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 bg-[#FFFDF9] dark:bg-[#1C1815] ${
        note.isPinned
          ? 'border-[#D97706]/40 shadow-sm ring-1 ring-[#D97706]/20'
          : 'border-[#E5DDD2] dark:border-[#2D2722] hover:border-[#D0C4B4] dark:hover:border-[#3E3630] shadow-xs'
      }`}
    >
      <div>
        {/* Top Header Strip: Category & Pin & Actions */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={`tracking-wider uppercase text-[11px] font-mono ${accentClass}`}>
              {categoryLabel}
            </span>
            <span className="text-[#8F8275] font-normal" aria-hidden="true">·</span>
            <span className="text-[#8F8275] text-[11px] font-mono tabular-nums">
              {formattedDate}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Pin Toggle */}
            <button
              type="button"
              onClick={() => onTogglePin(note.id)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                note.isPinned
                  ? 'text-[#D97706] hover:bg-[#D97706]/10'
                  : 'text-[#8F8275] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C]'
              }`}
              title={note.isPinned ? t.unpinTooltip : t.pinTooltip}
            >
              <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-[#D97706]' : ''}`} />
            </button>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-[#8F8275] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] transition-colors cursor-pointer"
              title={t.copyNote}
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Edit Button */}
            <button
              type="button"
              onClick={() => onEdit(note)}
              className="p-1.5 rounded-lg text-[#8F8275] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>

            {/* Delete Button */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t.deleteConfirm)) {
                  onDelete(note.id);
                }
              }}
              className="p-1.5 rounded-lg text-[#8F8275] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Note Title */}
        <h4 className="font-serif text-lg font-bold text-[#2B241E] dark:text-[#EFE9E2] leading-snug tracking-tight mb-2">
          {note.title}
        </h4>

        {/* Note Content */}
        <p className="text-xs sm:text-sm text-[#594E44] dark:text-[#C5B8AA] leading-relaxed whitespace-pre-line font-sans line-clamp-6">
          {note.content}
        </p>

        {/* Tags Metadata Strip (Clean Unboxed) */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[#EAE2D8]/80 dark:border-[#28221D]">
            {note.tags.map((tag, idx) => (
              <span
                key={tag}
                className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] font-medium"
              >
                #{tag}
                {idx < note.tags.length - 1 && <span className="text-[#A09384] ml-1.5">·</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footnotes Expandable Section */}
      {hasFootnotes && (
        <div className="mt-4 pt-3 border-t border-[#EAE2D8] dark:border-[#2E2823]">
          <button
            type="button"
            onClick={() => setIsFootnotesOpen((v) => !v)}
            className="w-full flex items-center justify-between py-1 text-xs font-semibold text-[#D97706] hover:text-[#B45309] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>{note.footnotes.length} {t.footnotesCount}</span>
            </span>
            {isFootnotesOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {isFootnotesOpen && (
            <div className="mt-2.5 space-y-2 text-xs bg-[#FAF7F2] dark:bg-[#14110F] p-3 rounded-xl border border-[#E0D7CB] dark:border-[#332C26]">
              {note.footnotes.map((fn) => (
                <div key={fn.id} className="flex items-start gap-2 text-[#594E44] dark:text-[#C5B8AA]">
                  <span className="font-mono font-bold text-[11px] text-[#D97706] shrink-0 mt-0.5">
                    [{fn.index}]
                  </span>
                  <div>
                    {fn.label && (
                      <span className="font-semibold text-[#2B241E] dark:text-[#EFE9E2] mr-1.5">
                        {fn.label}:
                      </span>
                    )}
                    <span className="leading-relaxed">{fn.content}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
