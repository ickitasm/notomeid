/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Plus, Search, MoonStar, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { DreamLog } from '../../types';
import { DreamCard } from './DreamCard';
import { DreamModal } from './DreamModal';
import { DreamKpiDashboard } from './DreamKpiDashboard';
import { ConfirmDeleteModal } from '../Common/ConfirmDeleteModal';
import { translations, Language } from '../../lib/translations';

interface DreamCatcherViewProps {
  dreams: DreamLog[];
  onAddDream: (dream: Omit<DreamLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateDream: (id: string, updates: Partial<DreamLog>) => void;
  onDeleteDream: (id: string) => void;
  language: Language;
}

export const DreamCatcherView: React.FC<DreamCatcherViewProps> = ({
  dreams,
  onAddDream,
  onUpdateDream,
  onDeleteDream,
  language,
}) => {
  const t = translations[language].dreams;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'lucid' | 'nightmare' | 'recurring'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDream, setEditingDream] = useState<DreamLog | null>(null);
  const [dreamToDelete, setDreamToDelete] = useState<DreamLog | null>(null);

  // Filter dreams based on search & mode
  const filteredDreams = useMemo(() => {
    return dreams
      .filter((d) => {
        if (filterMode === 'lucid' && d.lucidityScore < 3) return false;
        if (filterMode === 'nightmare' && !d.isNightmare) return false;
        if (filterMode === 'recurring' && !d.isRecurring) return false;

        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase().trim();
        const inTitle = d.title.toLowerCase().includes(q);
        const inDesc = d.description.toLowerCase().includes(q);
        const inTags = d.tags?.some((tag) => tag.toLowerCase().includes(q));
        const inNotes = d.interpretationNotes?.toLowerCase().includes(q);

        return inTitle || inDesc || inTags || inNotes;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dreams, filterMode, searchQuery]);

  const handleOpenAdd = () => {
    setEditingDream(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dream: DreamLog) => {
    setEditingDream(dream);
    setIsModalOpen(true);
  };

  const handleSaveModal = (data: Omit<DreamLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingDream) {
      onUpdateDream(editingDream.id, data);
    } else {
      onAddDream(data);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#E5DDD2] dark:border-[#2D2722]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-[#6366F1] mb-1">
            <MoonStar className="w-3.5 h-3.5" />
            <span>{t.tag}</span>
            <span className="text-[#A09384]">·</span>
            <span className="text-[#8F8275]">{dreams.length} Jurnal</span>
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
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white font-medium text-xs sm:text-sm shadow-xs transition-all active:scale-95 touch-manipulation cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addBtn}</span>
        </button>
      </div>

      {/* KPI Analytics Dashboard */}
      <DreamKpiDashboard dreams={dreams} language={language} />

      {/* Toolbar: Search & Segmented Filter Modes */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F8275]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-xs sm:text-sm text-[#2B241E] dark:text-[#EFE9E2] placeholder-[#A09384] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/30 transition-all"
          />
        </div>

        {/* Segmented Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors touch-manipulation cursor-pointer shrink-0 ${
              filterMode === 'all'
                ? 'bg-[#EFE8DD] dark:bg-[#28221D] text-[#2B241E] dark:text-[#EFE9E2] font-semibold shadow-xs'
                : 'text-[#7B6F63] dark:text-[#9F9184] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#201B17]'
            }`}
          >
            {t.allFilter}
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('lucid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors touch-manipulation cursor-pointer shrink-0 ${
              filterMode === 'lucid'
                ? 'bg-[#6366F1]/15 text-[#6366F1] font-semibold shadow-xs'
                : 'text-[#7B6F63] dark:text-[#9F9184] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#201B17]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
            <span>{t.lucidOnly}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('nightmare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors touch-manipulation cursor-pointer shrink-0 ${
              filterMode === 'nightmare'
                ? 'bg-rose-500/15 text-rose-600 font-semibold shadow-xs'
                : 'text-[#7B6F63] dark:text-[#9F9184] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#201B17]'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>{t.nightmareOnly}</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('recurring')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors touch-manipulation cursor-pointer shrink-0 ${
              filterMode === 'recurring'
                ? 'bg-sky-500/15 text-sky-600 font-semibold shadow-xs'
                : 'text-[#7B6F63] dark:text-[#9F9184] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#201B17]'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-500" />
            <span>{t.recurringOnly}</span>
          </button>
        </div>
      </div>

      {/* Main Grid of Dream Cards */}
      {filteredDreams.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9]/60 dark:bg-[#1C1815]/60">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#6366F1]/10 text-[#6366F1] flex items-center justify-center mb-3">
            <MoonStar className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-base font-bold text-[#2B241E] dark:text-[#EFE9E2]">
            {searchQuery || filterMode !== 'all' ? (language === 'id' ? 'Tidak ada mimpi yang cocok' : 'No matching dreams found') : t.noDreams}
          </h4>
          <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] mt-1 max-w-sm mx-auto">
            {searchQuery || filterMode !== 'all'
              ? (language === 'id' ? 'Coba ubah kata kunci atau pilih filter mode lain.' : 'Try adjusting keywords or selecting another filter mode.')
              : t.noDreamsDesc}
          </p>
          {searchQuery || filterMode !== 'all' ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterMode('all');
              }}
              className="mt-4 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#EFE8DD] dark:bg-[#28221D] text-[#2B241E] dark:text-[#EFE9E2] hover:bg-[#E5DDD2] transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#6366F1] text-white hover:bg-[#4F46E5] transition-colors cursor-pointer"
            >
              {t.addBtn}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDreams.map((dream) => (
            <DreamCard
              key={dream.id}
              dream={dream}
              onEdit={handleOpenEdit}
              onDelete={setDreamToDelete}
              language={language}
            />
          ))}
        </div>
      )}

      {/* Dream Add/Edit Modal */}
      <DreamModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        initialDream={editingDream}
        language={language}
      />

      {/* Delete Dream Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(dreamToDelete)}
        onClose={() => setDreamToDelete(null)}
        onConfirm={() => {
          if (dreamToDelete) {
            onDeleteDream(dreamToDelete.id);
            setDreamToDelete(null);
          }
        }}
        title={language === 'id' ? 'Hapus Catatan Mimpi?' : 'Delete Dream Log?'}
        itemName={dreamToDelete?.title}
        description={
          language === 'id'
            ? 'Catatan mimpi ini akan dihapus permanen dari jurnal impian Anda.'
            : 'This dream log will be permanently removed from your dream journal.'
        }
        confirmText={language === 'id' ? 'Hapus Mimpi' : 'Delete Dream'}
        cancelText={language === 'id' ? 'Batal' : 'Cancel'}
      />
    </div>
  );
};
