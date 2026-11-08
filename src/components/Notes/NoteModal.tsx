/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Pin,
  Plus,
  Trash2,
  Tag,
  BookOpen,
  Layers,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Quote,
  CaseUpper,
  CaseLower,
  CaseSensitive,
  RemoveFormatting,
  PenLine,
  Eye,
} from 'lucide-react';
import { NoteItem, NoteCategory, FootnoteItem } from '../../types';
import { translations, Language } from '../../lib/translations';
import { NoteContentRenderer } from './NoteContentRenderer';

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

type FormatAction =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'bullet'
  | 'number'
  | 'heading'
  | 'quote'
  | 'upper'
  | 'lower'
  | 'title'
  | 'clear';

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
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    setActiveTab('write');
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  // Formatting actions engine
  const applyFormat = (action: FormatAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;
    const selectedText = currentVal.substring(start, end);

    let newVal = currentVal;
    let newStart = start;
    let newEnd = end;

    switch (action) {
      case 'bold': {
        const placeholder = language === 'id' ? 'teks tebal' : 'bold text';
        if (selectedText) {
          // Check if already wrapped
          if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
            const unwrapped = selectedText.slice(2, -2);
            newVal = currentVal.slice(0, start) + unwrapped + currentVal.slice(end);
            newEnd = start + unwrapped.length;
          } else {
            const wrapped = `**${selectedText}**`;
            newVal = currentVal.slice(0, start) + wrapped + currentVal.slice(end);
            newEnd = start + wrapped.length;
          }
        } else {
          const insert = `**${placeholder}**`;
          newVal = currentVal.slice(0, start) + insert + currentVal.slice(end);
          newStart = start + 2;
          newEnd = newStart + placeholder.length;
        }
        break;
      }

      case 'italic': {
        const placeholder = language === 'id' ? 'teks miring' : 'italic text';
        if (selectedText) {
          if (selectedText.startsWith('*') && selectedText.endsWith('*')) {
            const unwrapped = selectedText.slice(1, -1);
            newVal = currentVal.slice(0, start) + unwrapped + currentVal.slice(end);
            newEnd = start + unwrapped.length;
          } else {
            const wrapped = `*${selectedText}*`;
            newVal = currentVal.slice(0, start) + wrapped + currentVal.slice(end);
            newEnd = start + wrapped.length;
          }
        } else {
          const insert = `*${placeholder}*`;
          newVal = currentVal.slice(0, start) + insert + currentVal.slice(end);
          newStart = start + 1;
          newEnd = newStart + placeholder.length;
        }
        break;
      }

      case 'underline': {
        const placeholder = language === 'id' ? 'teks garis bawah' : 'underlined text';
        if (selectedText) {
          if (selectedText.startsWith('<u>') && selectedText.endsWith('</u>')) {
            const unwrapped = selectedText.slice(3, -4);
            newVal = currentVal.slice(0, start) + unwrapped + currentVal.slice(end);
            newEnd = start + unwrapped.length;
          } else {
            const wrapped = `<u>${selectedText}</u>`;
            newVal = currentVal.slice(0, start) + wrapped + currentVal.slice(end);
            newEnd = start + wrapped.length;
          }
        } else {
          const insert = `<u>${placeholder}</u>`;
          newVal = currentVal.slice(0, start) + insert + currentVal.slice(end);
          newStart = start + 3;
          newEnd = newStart + placeholder.length;
        }
        break;
      }

      case 'strike': {
        const placeholder = language === 'id' ? 'teks coret' : 'strikethrough text';
        if (selectedText) {
          if (selectedText.startsWith('~~') && selectedText.endsWith('~~')) {
            const unwrapped = selectedText.slice(2, -2);
            newVal = currentVal.slice(0, start) + unwrapped + currentVal.slice(end);
            newEnd = start + unwrapped.length;
          } else {
            const wrapped = `~~${selectedText}~~`;
            newVal = currentVal.slice(0, start) + wrapped + currentVal.slice(end);
            newEnd = start + wrapped.length;
          }
        } else {
          const insert = `~~${placeholder}~~`;
          newVal = currentVal.slice(0, start) + insert + currentVal.slice(end);
          newStart = start + 2;
          newEnd = newStart + placeholder.length;
        }
        break;
      }

      case 'heading': {
        const lineStart = currentVal.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = currentVal.indexOf('\n', end);
        const actualLineEnd = lineEnd === -1 ? currentVal.length : lineEnd;
        const lineText = currentVal.slice(lineStart, actualLineEnd);

        let newLineText = '';
        if (lineText.startsWith('## ')) {
          newLineText = lineText.slice(3);
        } else {
          newLineText = `## ${lineText}`;
        }
        newVal = currentVal.slice(0, lineStart) + newLineText + currentVal.slice(actualLineEnd);
        newStart = lineStart + newLineText.length;
        newEnd = newStart;
        break;
      }

      case 'quote': {
        const lineStart = currentVal.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = currentVal.indexOf('\n', end);
        const actualLineEnd = lineEnd === -1 ? currentVal.length : lineEnd;
        const lineText = currentVal.slice(lineStart, actualLineEnd);

        let newLineText = '';
        if (lineText.startsWith('> ')) {
          newLineText = lineText.slice(2);
        } else {
          newLineText = `> ${lineText}`;
        }
        newVal = currentVal.slice(0, lineStart) + newLineText + currentVal.slice(actualLineEnd);
        newStart = lineStart + newLineText.length;
        newEnd = newStart;
        break;
      }

      case 'bullet': {
        const lineStart = currentVal.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = currentVal.indexOf('\n', end);
        const actualLineEnd = lineEnd === -1 ? currentVal.length : lineEnd;
        const block = currentVal.slice(lineStart, actualLineEnd);
        const lines = block.split('\n');

        const allBulleted = lines.every((l) => l.startsWith('- '));
        const transformedLines = lines.map((l) =>
          allBulleted ? l.replace(/^- \s*/, '') : `- ${l.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '')}`
        );
        const newBlock = transformedLines.join('\n');
        newVal = currentVal.slice(0, lineStart) + newBlock + currentVal.slice(actualLineEnd);
        newStart = lineStart;
        newEnd = lineStart + newBlock.length;
        break;
      }

      case 'number': {
        const lineStart = currentVal.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = currentVal.indexOf('\n', end);
        const actualLineEnd = lineEnd === -1 ? currentVal.length : lineEnd;
        const block = currentVal.slice(lineStart, actualLineEnd);
        const lines = block.split('\n');

        const allNumbered = lines.every((l) => /^\d+\.\s/.test(l));
        const transformedLines = lines.map((l, idx) =>
          allNumbered ? l.replace(/^\d+\.\s*/, '') : `${idx + 1}. ${l.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, '')}`
        );
        const newBlock = transformedLines.join('\n');
        newVal = currentVal.slice(0, lineStart) + newBlock + currentVal.slice(actualLineEnd);
        newStart = lineStart;
        newEnd = lineStart + newBlock.length;
        break;
      }

      case 'upper': {
        if (selectedText) {
          const transformed = selectedText.toUpperCase();
          newVal = currentVal.slice(0, start) + transformed + currentVal.slice(end);
          newStart = start;
          newEnd = start + transformed.length;
        } else {
          // Transform whole line
          const lineStart = currentVal.lastIndexOf('\n', start - 1) + 1;
          const lineEnd = currentVal.indexOf('\n', end);
          const actualLineEnd = lineEnd === -1 ? currentVal.length : lineEnd;
          const lineText = currentVal.slice(lineStart, actualLineEnd);
          const transformed = lineText.toUpperCase();
          newVal = currentVal.slice(0, lineStart) + transformed + currentVal.slice(actualLineEnd);
          newStart = lineStart;
          newEnd = lineStart + transformed.length;
        }
        break;
      }

      case 'lower': {
        if (selectedText) {
          const transformed = selectedText.toLowerCase();
          newVal = currentVal.slice(0, start) + transformed + currentVal.slice(end);
          newStart = start;
          newEnd = start + transformed.length;
        } else {
          const lineStart = currentVal.lastIndexOf('\n', start - 1) + 1;
          const lineEnd = currentVal.indexOf('\n', end);
          const actualLineEnd = lineEnd === -1 ? currentVal.length : lineEnd;
          const lineText = currentVal.slice(lineStart, actualLineEnd);
          const transformed = lineText.toLowerCase();
          newVal = currentVal.slice(0, lineStart) + transformed + currentVal.slice(actualLineEnd);
          newStart = lineStart;
          newEnd = lineStart + transformed.length;
        }
        break;
      }

      case 'title': {
        const toTitleCase = (str: string) =>
          str.replace(/\b\w+/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());

        if (selectedText) {
          const transformed = toTitleCase(selectedText);
          newVal = currentVal.slice(0, start) + transformed + currentVal.slice(end);
          newStart = start;
          newEnd = start + transformed.length;
        } else {
          const lineStart = currentVal.lastIndexOf('\n', start - 1) + 1;
          const lineEnd = currentVal.indexOf('\n', end);
          const actualLineEnd = lineEnd === -1 ? currentVal.length : lineEnd;
          const lineText = currentVal.slice(lineStart, actualLineEnd);
          const transformed = toTitleCase(lineText);
          newVal = currentVal.slice(0, lineStart) + transformed + currentVal.slice(actualLineEnd);
          newStart = lineStart;
          newEnd = lineStart + transformed.length;
        }
        break;
      }

      case 'clear': {
        if (selectedText) {
          // Strip markdown & HTML wrappers from selection
          const cleaned = selectedText
            .replace(/<\/?u>/g, '')
            .replace(/\*\*/g, '')
            .replace(/~~/g, '')
            .replace(/(^|[^\*])\*([^\*]+)\*([^\*]|$)/g, '$1$2$3')
            .replace(/^#+\s+/gm, '')
            .replace(/^>\s+/gm, '')
            .replace(/^[-*]\s+/gm, '')
            .replace(/^\d+\.\s+/gm, '');
          newVal = currentVal.slice(0, start) + cleaned + currentVal.slice(end);
          newStart = start;
          newEnd = start + cleaned.length;
        }
        break;
      }
    }

    setContent(newVal);

    // Maintain focus and restore cursor/selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newStart, newEnd);
    }, 0);
  };

  // Keyboard shortcut listener for bold, italic, underline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (key === 'b') {
        e.preventDefault();
        applyFormat('bold');
      } else if (key === 'i') {
        e.preventDefault();
        applyFormat('italic');
      } else if (key === 'u') {
        e.preventDefault();
        applyFormat('underline');
      }
    }
  };

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
      return filtered.map((fn, idx) => ({ ...fn, index: idx + 1 }));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const parsedTags = tagInput
      .split(',')
      .map((item) => item.trim())
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

  // Live words and character count
  const trimmed = content.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const charCount = content.length;
  const wordCountDisplay = t.wordCounter
    ? t.wordCounter.replace('{words}', String(wordCount)).replace('{chars}', String(charCount))
    : `${wordCount} words · ${charCount} chars`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FFFDF9] dark:bg-[#1C1815] rounded-2xl border border-[#E5DDD2] dark:border-[#38312B] shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto my-auto transition-colors">
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

          {/* Content Body with Quick Formatting Toolbar and Live Preview Tab */}
          <div>
            {/* Editor Top Bar: Tabs & Counter */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1 p-0.5 rounded-xl bg-[#F0EAE1] dark:bg-[#25201C] border border-[#E2D8CC] dark:border-[#352D27]">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'write'
                      ? 'bg-[#FFFDF9] dark:bg-[#1C1815] text-[#D97706] shadow-xs'
                      : 'text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
                  }`}
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>{t.writeTab || 'Tulis'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-[#FFFDF9] dark:bg-[#1C1815] text-[#D97706] shadow-xs'
                      : 'text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{t.previewTab || 'Pratinjau'}</span>
                </button>
              </div>

              {/* Word & Char Count */}
              <span className="text-[11px] font-mono text-[#8F8275] tabular-nums hidden xs:inline-block">
                {wordCountDisplay}
              </span>
            </div>

            {/* When in Write Tab: Show Quick Formatting Toolbar + Textarea */}
            {activeTab === 'write' ? (
              <div className="rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] overflow-hidden focus-within:ring-2 focus-within:ring-[#D97706]/30 transition-all">
                {/* Horizontal Quick Formatting Toolbar */}
                <div className="flex items-center gap-1 p-1.5 bg-[#F4ECE3]/70 dark:bg-[#1E1916]/80 border-b border-[#E8DFD3] dark:border-[#2F2722] overflow-x-auto scrollbar-none touch-pan-x">
                  {/* Inline text formatting group */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => applyFormat('bold')}
                      className="p-1.5 rounded-md text-[#594E44] dark:text-[#C5B8AA] hover:text-[#2B241E] dark:hover:text-[#FFFDF9] hover:bg-[#EAE0D4] dark:hover:bg-[#2D2621] transition-colors cursor-pointer"
                      title={t.toolbarBold || 'Tebal (Ctrl+B)'}
                      aria-label="Bold"
                    >
                      <Bold className="w-3.5 h-3.5 font-bold" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('italic')}
                      className="p-1.5 rounded-md text-[#594E44] dark:text-[#C5B8AA] hover:text-[#2B241E] dark:hover:text-[#FFFDF9] hover:bg-[#EAE0D4] dark:hover:bg-[#2D2621] transition-colors cursor-pointer"
                      title={t.toolbarItalic || 'Miring (Ctrl+I)'}
                      aria-label="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('underline')}
                      className="p-1.5 rounded-md text-[#594E44] dark:text-[#C5B8AA] hover:text-[#2B241E] dark:hover:text-[#FFFDF9] hover:bg-[#EAE0D4] dark:hover:bg-[#2D2621] transition-colors cursor-pointer"
                      title={t.toolbarUnderline || 'Garis Bawah (Ctrl+U)'}
                      aria-label="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('strike')}
                      className="p-1.5 rounded-md text-[#594E44] dark:text-[#C5B8AA] hover:text-[#2B241E] dark:hover:text-[#FFFDF9] hover:bg-[#EAE0D4] dark:hover:bg-[#2D2621] transition-colors cursor-pointer"
                      title={t.toolbarStrike || 'Coret'}
                      aria-label="Strikethrough"
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-px h-4 bg-[#E0D7CB] dark:bg-[#352D26] mx-0.5 shrink-0" />

                  {/* Structure & Lists */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => applyFormat('bullet')}
                      className="p-1.5 rounded-md text-[#594E44] dark:text-[#C5B8AA] hover:text-[#2B241E] dark:hover:text-[#FFFDF9] hover:bg-[#EAE0D4] dark:hover:bg-[#2D2621] transition-colors cursor-pointer"
                      title={t.toolbarBullet || 'Daftar Poin'}
                      aria-label="Bulleted List"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('number')}
                      className="p-1.5 rounded-md text-[#594E44] dark:text-[#C5B8AA] hover:text-[#2B241E] dark:hover:text-[#FFFDF9] hover:bg-[#EAE0D4] dark:hover:bg-[#2D2621] transition-colors cursor-pointer"
                      title={t.toolbarNumbered || 'Daftar Angka'}
                      aria-label="Numbered List"
                    >
                      <ListOrdered className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('heading')}
                      className="p-1.5 rounded-md text-[#594E44] dark:text-[#C5B8AA] hover:text-[#2B241E] dark:hover:text-[#FFFDF9] hover:bg-[#EAE0D4] dark:hover:bg-[#2D2621] transition-colors cursor-pointer"
                      title={t.toolbarHeading || 'Judul Bagian'}
                      aria-label="Section Heading"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('quote')}
                      className="p-1.5 rounded-md text-[#594E44] dark:text-[#C5B8AA] hover:text-[#2B241E] dark:hover:text-[#FFFDF9] hover:bg-[#EAE0D4] dark:hover:bg-[#2D2621] transition-colors cursor-pointer"
                      title={t.toolbarQuote || 'Kutipan (Quote)'}
                      aria-label="Blockquote"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-px h-4 bg-[#E0D7CB] dark:bg-[#352D26] mx-0.5 shrink-0" />

                  {/* Case transformations */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => applyFormat('upper')}
                      className="p-1.5 rounded-md text-[#594E44] dark:text-[#C5B8AA] hover:text-[#2B241E] dark:hover:text-[#FFFDF9] hover:bg-[#EAE0D4] dark:hover:bg-[#2D2621] transition-colors cursor-pointer"
                      title={t.toolbarCaseUpper || 'HURUF BESAR'}
                      aria-label="UPPERCASE"
                    >
                      <CaseUpper className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('lower')}
                      className="p-1.5 rounded-md text-[#594E44] dark:text-[#C5B8AA] hover:text-[#2B241E] dark:hover:text-[#FFFDF9] hover:bg-[#EAE0D4] dark:hover:bg-[#2D2621] transition-colors cursor-pointer"
                      title={t.toolbarCaseLower || 'huruf kecil'}
                      aria-label="lowercase"
                    >
                      <CaseLower className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => applyFormat('title')}
                      className="p-1.5 rounded-md text-[#594E44] dark:text-[#C5B8AA] hover:text-[#2B241E] dark:hover:text-[#FFFDF9] hover:bg-[#EAE0D4] dark:hover:bg-[#2D2621] transition-colors cursor-pointer"
                      title={t.toolbarCaseTitle || 'Kapital Tiap Kata'}
                      aria-label="Title Case"
                    >
                      <CaseSensitive className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-px h-4 bg-[#E0D7CB] dark:bg-[#352D26] mx-0.5 shrink-0" />

                  {/* Clear formatting */}
                  <div className="flex items-center shrink-0">
                    <button
                      type="button"
                      onClick={() => applyFormat('clear')}
                      className="p-1.5 rounded-md text-[#8F8275] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      title={t.toolbarClear || 'Hapus Pemformatan'}
                      aria-label="Clear formatting"
                    >
                      <RemoveFormatting className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.modalContentPlaceholder}
                  className="w-full px-3.5 py-2.5 bg-transparent text-[#2B241E] dark:text-[#EFE9E2] placeholder-[#A09384] focus:outline-hidden leading-relaxed font-sans resize-y min-h-[140px]"
                />
              </div>
            ) : (
              /* Live Preview Tab */
              <div className="rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] p-4 min-h-[185px] max-h-[320px] overflow-y-auto">
                <NoteContentRenderer
                  content={content}
                  emptyPlaceholder={t.previewEmpty}
                />
              </div>
            )}
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
