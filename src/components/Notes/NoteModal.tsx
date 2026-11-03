/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Pin, Plus, Trash2, Tag, BookOpen, Layers } from 'lucide-react';
import { NoteItem, NoteCategory, FootnoteItem } from '../../types';
import { translations, Language } from '../../lib/translations';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialNote?: NoteItem | null;
  language: Language;
}

const CATEGORY_COLORS: Record<NoteCategory, string> = {
  idea: '#2563EB',
  project: '#C85A32',
  personal: '#5B7A58',
  research: '#D97706',
  archive: '#78716C',
};

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialNote,
  language,
}) => {
  const t = translations[language].notes;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('idea');
  const [tagInput, setTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState('#D97706');
  const [footnotes, setFootnotes] = useState<FootnoteItem[]>([]);

  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || '');
      setContent(initialNote.content || '');
      setCategory(initialNote.category || 'idea');
      setTagInput((initialNote.tags || []).join(', '));
      setIsPinned(Boolean(initialNote.isPinned));
      setColor(initialNote.color || CATEGORY_COLORS[initialNote.category] || '#D97706');
      setFootnotes(initialNote.footnotes ? [...initialNote.footnotes] : []);
    } else {
      setTitle('');
      setContent('');
      setCategory('idea');
      setTagInput('');
      setIsPinned(false);
      setColor('#D97706');
      setFootnotes([]);
    }
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleAddFootnote = () => {
    const nextIndex = footnotes.length + 1;
    const newFn: FootnoteItem = {
      id: `fn-${Date.now()}-${nextIndex}`,
      index: nextIndex,
      label: `Sumber/Catatan #${nextIndex}`,
      content: '',
    };
    setFootnotes([...footnotes, newFn]);
  };

  const handleUpdateFootnote = (id: string, updates: Partial<FootnoteItem>) => {
    setFootnotes((prev) =>
      prev.map((fn) => (fn.id === id ? { ...fn, ...updates } : fn))
    );
  };

  const handleRemoveFootnote = (id: string) => {
    setFootnotes((prev) => {
      const filtered = prev.filter((fn) => fn.id !== id);
      // Re-index remaining footnotes
      return filtered.map((fn, idx) => ({ ...fn, index: idx + 1 }));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: title.trim() || (language === 'id' ? 'Catatan Tanpa Judul' : 'Untitled Note'),
      content: content.trim(),
      category,
      tags: parsedTags,
      isPinned,
      color,
      footnotes: footnotes.filter((fn) => fn.content.trim() || fn.label.trim()),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FFFDF9] dark:bg-[#1C1815] rounded-2xl border border-[#E5DDD2] dark:border-[#38312B] shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D8] dark:border-[#2E2823]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D97706]/15 text-[#D97706] flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                {initialNote ? t.modalTitleEdit : t.modalTitleAdd}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs sm:text-sm">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184] mb-1.5">
              {t.modalTitlePlaceholder}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.modalTitlePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] text-[#2B241E] dark:text-[#EFE9E2] placeholder-[#A09384] focus:outline-hidden focus:ring-2 focus:ring-[#D97706]/30 font-medium"
            />
          </div>

          {/* Category & Pin Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184] mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#D97706]" />
                <span>{t.modalCategoryLabel}</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value as NoteCategory;
                  setCategory(newCat);
                  setColor(CATEGORY_COLORS[newCat]);
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] text-[#2B241E] dark:text-[#EFE9E2] focus:outline-hidden focus:ring-2 focus:ring-[#D97706]/30"
              >
                <option value="idea">{t.categoryIdea}</option>
                <option value="project">{t.categoryProject}</option>
                <option value="personal">{t.categoryPersonal}</option>
                <option value="research">{t.categoryResearch}</option>
                <option value="archive">{t.categoryArchive}</option>
              </select>
            </div>

            {/* Pin Toggle */}
            <div className="pt-2 sm:pt-5">
              <label className="flex items-center gap-2.5 p-2 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] cursor-pointer hover:border-[#D97706]/50 transition-colors">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-[#D97706] focus:ring-[#D97706] w-4 h-4"
                />
                <Pin className={`w-4 h-4 ${isPinned ? 'text-[#D97706] fill-[#D97706]' : 'text-[#7B6F63]'}`} />
                <span className="text-xs font-medium text-[#2B241E] dark:text-[#EFE9E2] select-none">
                  {t.modalPinLabel}
                </span>
              </label>
            </div>
          </div>

          {/* Content Body */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184] mb-1.5">
              {t.modalContentPlaceholder}
            </label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.modalContentPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] text-[#2B241E] dark:text-[#EFE9E2] placeholder-[#A09384] focus:outline-hidden focus:ring-2 focus:ring-[#D97706]/30 leading-relaxed font-sans"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184] mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#D97706]" />
              <span>{t.modalTagsLabel}</span>
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Desain, Ide, Riset, Notome"
              className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] text-[#2B241E] dark:text-[#EFE9E2] placeholder-[#A09384] focus:outline-hidden focus:ring-2 focus:ring-[#D97706]/30"
            />
          </div>

          {/* Footnotes Section */}
          <div className="pt-2 border-t border-[#EAE2D8] dark:border-[#2E2823]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                  {t.modalFootnotesTitle}
                </span>
                <span className="text-[11px] font-mono text-[#8F8275]">
                  ({footnotes.length})
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddFootnote}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#D97706] hover:bg-[#D97706]/10 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.modalAddFootnote}</span>
              </button>
            </div>

            {footnotes.length === 0 ? (
              <p className="text-xs text-[#8F8275] italic py-2">
                {language === 'id'
                  ? 'Belum ada catatan kaki. Klik tombol "+ Tambah Footnote" untuk menambahkan sitasi atau rujukan beranotasi.'
                  : 'No footnotes yet. Click "+ Add Footnote" to attach citations or annotated sub-notes.'}
              </p>
            ) : (
              <div className="space-y-3">
                {footnotes.map((fn) => (
                  <div
                    key={fn.id}
                    className="p-3 rounded-xl border border-[#E0D7CB] dark:border-[#36302A] bg-[#FAF7F2]/80 dark:bg-[#151210]/80 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="w-5 h-5 rounded-md bg-[#D97706]/15 text-[#D97706] font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                          [{fn.index}]
                        </span>
                        <input
                          type="text"
                          value={fn.label}
                          onChange={(e) => handleUpdateFootnote(fn.id, { label: e.target.value })}
                          placeholder={t.modalFootnoteLabel}
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-[#DED4C7] dark:border-[#3A332C] bg-[#FFFDF9] dark:bg-[#1C1815] text-[#2B241E] dark:text-[#EFE9E2]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFootnote(fn.id)}
                        className="p-1 rounded-md text-[#8F8275] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Hapus Footnote"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={fn.content}
                      onChange={(e) => handleUpdateFootnote(fn.id, { content: e.target.value })}
                      placeholder={t.modalFootnoteContent}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[#DED4C7] dark:border-[#3A332C] bg-[#FFFDF9] dark:bg-[#1C1815] text-[#2B241E] dark:text-[#EFE9E2] placeholder-[#A09384] focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#EAE2D8] dark:border-[#2E2823]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] transition-colors cursor-pointer"
            >
              {t.modalCancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#D97706] hover:bg-[#B45309] text-white shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              {t.modalSave}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
