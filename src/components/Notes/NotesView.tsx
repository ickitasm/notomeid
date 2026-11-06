/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Search, Pin, Sparkles, BookOpen, Layers } from 'lucide-react';
import { NoteItem, NoteCategory } from '../../types';
import { NoteCard } from './NoteCard';
import { NoteModal } from './NoteModal';
import { ConfirmDeleteModal } from '../Common/ConfirmDeleteModal';
import { translations, Language } from '../../lib/translations';

interface NotesViewProps {
  notes: NoteItem[];
  onAddNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<NoteItem>) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
  language: Language;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onTogglePin,
  language,
}) => {
  const t = translations[language].notes;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<NoteItem | null>(null);

  // Filter notes based on category and search query
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesCategory =
        selectedCategory === 'all' || n.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = n.title.toLowerCase().includes(q);
      const inContent = n.content.toLowerCase().includes(q);
      const inTags = n.tags?.some((tag) => tag.toLowerCase().includes(q));
      const inFootnotes = n.footnotes?.some(
        (fn) =>
          fn.label.toLowerCase().includes(q) ||
          fn.content.toLowerCase().includes(q)
      );

      return inTitle || inContent || inTags || inFootnotes;
    });
  }, [notes, selectedCategory, searchQuery]);

  // Separate pinned vs standard
  const pinnedNotes = useMemo(
    () => filteredNotes.filter((n) => n.isPinned),
    [filteredNotes]
  );
  const regularNotes = useMemo(
    () => filteredNotes.filter((n) => !n.isPinned),
    [filteredNotes]
  );

  const handleOpenAdd = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note: NoteItem) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNote) {
      onUpdateNote(editingNote.id, data);
    } else {
      onAddNote(data);
    }
    setEditingNote(null);
  };

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: t.allCategories },
    { id: 'idea', label: t.categoryIdea },
    { id: 'project', label: t.categoryProject },
    { id: 'personal', label: t.categoryPersonal },
    { id: 'research', label: t.categoryResearch },
    { id: 'archive', label: t.categoryArchive },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5DDD2] dark:border-[#2D2722]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#D97706] mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.tag}</span>
            <span className="text-[#A09384]">·</span>
            <span className="text-[#8F8275]">{notes.length} Total</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
            {t.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#7B6F63] dark:text-[#9F9184] mt-1 max-w-2xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-medium text-xs sm:text-sm shadow-xs transition-all active:scale-95 touch-manipulation cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addBtn}</span>
        </button>
      </div>

      {/* Toolbar: Search & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8275]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-xs sm:text-sm text-[#2B241E] dark:text-[#EFE9E2] placeholder-[#A09384] focus:outline-hidden focus:ring-2 focus:ring-[#D97706]/30 transition-all"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors touch-manipulation cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#EFE8DD] dark:bg-[#28221D] text-[#2B241E] dark:text-[#EFE9E2] font-semibold shadow-xs'
                    : 'text-[#7B6F63] dark:text-[#9F9184] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#201B17]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid View */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9]/60 dark:bg-[#1C1815]/60">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#D97706]/10 text-[#D97706] flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-base font-bold text-[#2B241E] dark:text-[#EFE9E2]">
            {searchQuery || selectedCategory !== 'all' ? t.noFilterResults : t.noNotes}
          </h4>
          <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] mt-1 max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all'
              ? t.noFilterResultsDesc
              : t.noNotesDesc}
          </p>
          {searchQuery || selectedCategory !== 'all' ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#EFE8DD] dark:bg-[#28221D] text-[#2B241E] dark:text-[#EFE9E2] hover:bg-[#E5DDD2] transition-colors cursor-pointer"
            >
              {t.resetFilters}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#D97706] text-white hover:bg-[#B45309] transition-colors cursor-pointer"
            >
              {t.addBtn}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 text-xs font-mono font-semibold uppercase tracking-wider text-[#D97706]">
                <Pin className="w-3.5 h-3.5 fill-[#D97706]" />
                <span>{t.pinnedSection} ({pinnedNotes.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleOpenEdit}
                    onDelete={setNoteToDelete}
                    onTogglePin={onTogglePin}
                    language={language}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Notes Section */}
          {regularNotes.length > 0 && (
            <div>
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 mb-3 text-xs font-mono font-semibold uppercase tracking-wider text-[#8F8275]">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{t.otherSection} ({regularNotes.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regularNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleOpenEdit}
                    onDelete={setNoteToDelete}
                    onTogglePin={onTogglePin}
                    language={language}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note Add/Edit Modal */}
      <NoteModal
        key={editingNote ? editingNote.id : 'new-note'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveModal}
        initialNote={editingNote}
        language={language}
      />

      {/* Delete Note Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(noteToDelete)}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            onDeleteNote(noteToDelete.id);
            setNoteToDelete(null);
          }
        }}
        title={language === 'id' ? 'Hapus Catatan?' : 'Delete Note?'}
        itemName={noteToDelete?.title}
        description={
          language === 'id'
            ? 'Catatan beserta semua referensi dan catatan kakinya akan dihapus secara permanen.'
            : 'This note and all its footnotes will be permanently deleted.'
        }
        confirmText={language === 'id' ? 'Hapus Catatan' : 'Delete Note'}
        cancelText={language === 'id' ? 'Batal' : 'Cancel'}
      />
    </div>
  );
};
