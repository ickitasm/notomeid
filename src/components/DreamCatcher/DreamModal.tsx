/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, MoonStar, Star, Sparkles, Smile, Meh, Frown, AlertCircle, RefreshCw, Eye } from 'lucide-react';
import { DreamLog, DreamEmotion } from '../../types';
import { translations, Language } from '../../lib/translations';

interface DreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dream: Omit<DreamLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialDream?: DreamLog | null;
  language: Language;
}

export const DreamModal: React.FC<DreamModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDream,
  language,
}) => {
  const t = translations[language].dreams;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [wakeTime, setWakeTime] = useState('06:30');
  const [tagsInput, setTagsInput] = useState('');
  const [emotion, setEmotion] = useState<DreamEmotion>('happy');
  const [clarityScore, setClarityScore] = useState<number>(4);
  const [lucidityScore, setLucidityScore] = useState<number>(3);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isNightmare, setIsNightmare] = useState(false);
  const [interpretationNotes, setInterpretationNotes] = useState('');

  useEffect(() => {
    if (initialDream) {
      setTitle(initialDream.title || '');
      setDescription(initialDream.description || '');
      setDate(initialDream.date || new Date().toISOString().slice(0, 10));
      setWakeTime(initialDream.wakeTime || '06:30');
      setTagsInput((initialDream.tags || []).join(', '));
      setEmotion(initialDream.emotion || 'neutral');
      setClarityScore(initialDream.clarityScore || 3);
      setLucidityScore(initialDream.lucidityScore || 1);
      setIsRecurring(Boolean(initialDream.isRecurring));
      setIsNightmare(Boolean(initialDream.isNightmare));
      setInterpretationNotes(initialDream.interpretationNotes || '');
    } else {
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 10));
      setWakeTime('06:30');
      setTagsInput('');
      setEmotion('happy');
      setClarityScore(4);
      setLucidityScore(2);
      setIsRecurring(false);
      setIsNightmare(false);
      setInterpretationNotes('');
    }
  }, [initialDream, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !description.trim()) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: title.trim() || (language === 'id' ? 'Mimpi Pagi Ini' : 'Morning Dream'),
      description: description.trim(),
      date,
      wakeTime,
      tags: parsedTags,
      emotion,
      clarityScore,
      lucidityScore,
      isRecurring,
      isNightmare,
      interpretationNotes: interpretationNotes.trim() || undefined,
    });
    onClose();
  };

  const emotions: { id: DreamEmotion; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: 'happy', label: t.emotionHappy, icon: Smile, color: 'text-amber-600 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30' },
    { id: 'neutral', label: t.emotionNeutral, icon: Meh, color: 'text-blue-600 border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30' },
    { id: 'sad', label: t.emotionSad, icon: Frown, color: 'text-indigo-600 border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30' },
    { id: 'anxious', label: t.emotionAnxious, icon: AlertCircle, color: 'text-rose-600 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#FFFDF9] dark:bg-[#1C1815] rounded-2xl border border-[#E5DDD2] dark:border-[#38312B] shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto my-auto transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D8] dark:border-[#2E2823]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center">
              <MoonStar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                {initialDream ? t.modalTitleEdit : t.modalTitleAdd}
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
          {/* Dream Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184] mb-1.5">
              {t.modalDreamTitle}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t.modalDreamTitlePlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] text-[#2B241E] dark:text-[#EFE9E2] placeholder-[#A09384] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/30 font-medium"
            />
          </div>

          {/* Date & Wake Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184] mb-1.5">
                {t.modalDate}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] text-[#2B241E] dark:text-[#EFE9E2] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/30"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184] mb-1.5">
                {t.modalWakeTime}
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] text-[#2B241E] dark:text-[#EFE9E2] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/30"
              />
            </div>
          </div>

          {/* Emotion Rating Buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184] mb-2">
              {t.modalEmotion}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {emotions.map((item) => {
                const Icon = item.icon;
                const isSelected = emotion === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEmotion(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-xs font-semibold cursor-pointer text-left ${
                      isSelected
                        ? `${item.color} shadow-xs ring-1 ring-current`
                        : 'border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] text-[#6F645A] dark:text-[#A89C90] hover:bg-[#F4ECE3] dark:hover:bg-[#201B17]'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dream Story / Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184] mb-1.5">
              {t.modalStory}
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.modalStoryPlaceholder}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] text-[#2B241E] dark:text-[#EFE9E2] placeholder-[#A09384] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/30 leading-relaxed font-sans"
            />
          </div>

          {/* Clarity & Lucidity Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-xl border border-[#E0D7CB] dark:border-[#332C26] bg-[#FAF7F2]/60 dark:bg-[#14110F]/60">
            {/* Visual Clarity */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2] flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>{t.modalClarity}</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#6366F1]">{clarityScore} / 5</span>
              </div>
              <div className="flex items-center gap-1.5 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setClarityScore(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= clarityScore
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-[#D0C4B4] dark:text-[#453D35]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Lucidity Score */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>{t.modalLucidity}</span>
                </span>
                <span className="text-xs font-mono font-bold text-[#6366F1]">
                  Level {lucidityScore} ({lucidityScore * 20}%)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={lucidityScore}
                onChange={(e) => setLucidityScore(Number(e.target.value))}
                className="w-full accent-[#6366F1] cursor-pointer mt-2"
              />
              <div className="flex justify-between text-[10px] text-[#8F8275] font-mono mt-1">
                <span>1 (Tidup biasa)</span>
                <span>3 (Semi-sadar)</span>
                <span>5 (Full Lucid)</span>
              </div>
            </div>
          </div>

          {/* Checkboxes: Recurring & Nightmare */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] cursor-pointer hover:border-[#6366F1]/50 transition-colors">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-[#6366F1] focus:ring-[#6366F1] w-4 h-4"
              />
              <RefreshCw className={`w-4 h-4 ${isRecurring ? 'text-[#6366F1]' : 'text-[#7B6F63]'}`} />
              <span className="text-xs font-medium text-[#2B241E] dark:text-[#EFE9E2] select-none">
                {t.modalIsRecurring}
              </span>
            </label>

            <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] cursor-pointer hover:border-rose-500/50 transition-colors">
              <input
                type="checkbox"
                checked={isNightmare}
                onChange={(e) => setIsNightmare(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <AlertCircle className={`w-4 h-4 ${isNightmare ? 'text-rose-600' : 'text-[#7B6F63]'}`} />
              <span className="text-xs font-medium text-[#2B241E] dark:text-[#EFE9E2] select-none">
                {t.modalIsNightmare}
              </span>
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184] mb-1.5">
              {t.modalTags}
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Terbang, Laut, Surealis, Lucid"
              className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] text-[#2B241E] dark:text-[#EFE9E2] placeholder-[#A09384] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/30"
            />
          </div>

          {/* Personal Interpretation Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184] mb-1.5">
              {t.modalInterpretation}
            </label>
            <textarea
              rows={2}
              value={interpretationNotes}
              onChange={(e) => setInterpretationNotes(e.target.value)}
              placeholder={t.modalInterpretationPlaceholder}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DED4C7] dark:border-[#3A332C] bg-[#FAF7F2] dark:bg-[#14110F] text-[#2B241E] dark:text-[#EFE9E2] placeholder-[#A09384] focus:outline-hidden focus:ring-2 focus:ring-[#6366F1]/30 font-sans"
            />
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
              className="px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              {t.modalSave}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
