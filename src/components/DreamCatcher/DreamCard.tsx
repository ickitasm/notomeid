/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, RefreshCw, AlertCircle, Edit3, Trash2, Smile, Meh, Frown, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { DreamLog, DreamEmotion } from '../../types';
import { translations, Language } from '../../lib/translations';

interface DreamCardProps {
  dream: DreamLog;
  onEdit: (dream: DreamLog) => void;
  onDelete: (id: string) => void;
  language: Language;
}

const EMOTION_CONFIG: Record<
  DreamEmotion,
  { labelId: string; labelEn: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  happy: { labelId: 'Gembira & Tenang', labelEn: 'Joyful & Peaceful', icon: Smile, color: 'text-amber-600 bg-amber-500/10 border-amber-300 dark:border-amber-900/50' },
  neutral: { labelId: 'Datar & Netral', labelEn: 'Calm & Neutral', icon: Meh, color: 'text-blue-600 bg-blue-500/10 border-blue-300 dark:border-blue-900/50' },
  sad: { labelId: 'Sedih & Melankolis', labelEn: 'Melancholic', icon: Frown, color: 'text-indigo-600 bg-indigo-500/10 border-indigo-300 dark:border-indigo-900/50' },
  anxious: { labelId: 'Gelisah & Cemas', labelEn: 'Anxious & Uneasy', icon: AlertCircle, color: 'text-rose-600 bg-rose-500/10 border-rose-300 dark:border-rose-900/50' },
};

export const DreamCard: React.FC<DreamCardProps> = ({
  dream,
  onEdit,
  onDelete,
  language,
}) => {
  const t = translations[language].dreams;
  const [showInterpretation, setShowInterpretation] = useState(false);

  const emotionInfo = EMOTION_CONFIG[dream.emotion] || EMOTION_CONFIG.neutral;
  const EmotionIcon = emotionInfo.icon;
  const emotionLabel = language === 'id' ? emotionInfo.labelId : emotionInfo.labelEn;

  const formattedDate = new Date(dream.date).toLocaleDateString(
    language === 'id' ? 'id-ID' : 'en-US',
    { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <div
      className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-200 bg-[#FFFDF9] dark:bg-[#1C1815] ${
        dream.isNightmare
          ? 'border-rose-300/70 dark:border-rose-900/50 shadow-xs'
          : dream.lucidityScore >= 3
          ? 'border-[#6366F1]/40 dark:border-[#6366F1]/30 shadow-xs'
          : 'border-[#E5DDD2] dark:border-[#2D2722] hover:border-[#D0C4B4] dark:hover:border-[#3E3630]'
      }`}
    >
      <div>
        {/* Top Header Strip */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Emotion Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${emotionInfo.color}`}
            >
              <EmotionIcon className="w-3 h-3" />
              <span>{emotionLabel}</span>
            </span>

            {/* Recurring Tag */}
            {dream.isRecurring && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-sky-300 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 text-[10px] font-semibold">
                <RefreshCw className="w-2.5 h-2.5" />
                <span>{t.recurringBadge}</span>
              </span>
            )}

            {/* Nightmare Tag */}
            {dream.isNightmare && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-[10px] font-semibold">
                <AlertCircle className="w-2.5 h-2.5" />
                <span>{t.nightmareBadge}</span>
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(dream)}
              className="p-1.5 rounded-lg text-[#8F8275] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t.deleteConfirm)) {
                  onDelete(dream.id);
                }
              }}
              className="p-1.5 rounded-lg text-[#8F8275] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Date and Wake Time */}
        <div className="text-[11px] font-mono text-[#8F8275] mb-2 flex items-center gap-2">
          <span className="tabular-nums">{formattedDate}</span>
          {dream.wakeTime && (
            <>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">Bangun: {dream.wakeTime}</span>
            </>
          )}
        </div>

        {/* Dream Title */}
        <h4 className="font-serif text-lg font-bold text-[#2B241E] dark:text-[#EFE9E2] leading-snug tracking-tight mb-2">
          {dream.title}
        </h4>

        {/* Dream Narrative */}
        <p className="text-xs sm:text-sm text-[#594E44] dark:text-[#C5B8AA] leading-relaxed whitespace-pre-line font-sans line-clamp-5">
          {dream.description}
        </p>

        {/* Tags metadata strip */}
        {dream.tags && dream.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-[#EAE2D8]/80 dark:border-[#28221D]">
            {dream.tags.map((tag, idx) => (
              <span
                key={tag}
                className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] font-medium"
              >
                #{tag}
                {idx < dream.tags.length - 1 && <span className="text-[#A09384] ml-1.5">·</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Metrics: Lucidity & Clarity */}
      <div className="mt-4 pt-3 border-t border-[#EAE2D8] dark:border-[#2E2823] space-y-2">
        <div className="flex items-center justify-between text-xs">
          {/* Lucidity Score */}
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6366F1]" />
            <span className="text-[#7B6F63] dark:text-[#9F9184] font-medium">Lucid:</span>
            <span className="font-mono font-bold text-[#6366F1] tabular-nums">
              {dream.lucidityScore * 20}%
            </span>
          </div>

          {/* Clarity Stars */}
          <div className="flex items-center gap-1" title={`${dream.clarityScore}/5 Visual Clarity`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-3.5 h-3.5 ${
                  star <= dream.clarityScore
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-[#D0C4B4] dark:text-[#453D35]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Personal Interpretation Toggle */}
        {dream.interpretationNotes && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowInterpretation((v) => !v)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-[#6366F1] hover:text-[#4F46E5] transition-colors cursor-pointer"
            >
              <span>{language === 'id' ? 'Catatan Interpretasi Pribadi' : 'Personal Interpretation'}</span>
              {showInterpretation ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showInterpretation && (
              <p className="mt-1.5 text-xs text-[#594E44] dark:text-[#C5B8AA] bg-[#FAF7F2] dark:bg-[#14110F] p-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#332C26] leading-relaxed italic">
                "{dream.interpretationNotes}"
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
