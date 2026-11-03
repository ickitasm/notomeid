/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { MoonStar, Sparkles, AlertCircle, RefreshCw, BarChart3, HeartHandshake } from 'lucide-react';
import { DreamLog, DreamEmotion } from '../../types';
import { translations, Language } from '../../lib/translations';

interface DreamKpiDashboardProps {
  dreams: DreamLog[];
  language: Language;
}

export const DreamKpiDashboard: React.FC<DreamKpiDashboardProps> = ({
  dreams,
  language,
}) => {
  const t = translations[language].dreams;

  const total = dreams.length;

  // Compute Lucidity Metrics
  const lucidDreamsCount = useMemo(
    () => dreams.filter((d) => d.lucidityScore >= 3).length,
    [dreams]
  );
  const lucidityRate = total > 0 ? Math.round((lucidDreamsCount / total) * 100) : 0;

  // Compute Nightmare Metrics
  const nightmareCount = useMemo(
    () => dreams.filter((d) => d.isNightmare).length,
    [dreams]
  );
  const nightmareRate = total > 0 ? Math.round((nightmareCount / total) * 100) : 0;

  // Compute Recurring Count
  const recurringCount = useMemo(
    () => dreams.filter((d) => d.isRecurring).length,
    [dreams]
  );

  // Compute Emotion Distribution
  const emotionStats = useMemo(() => {
    const counts: Record<DreamEmotion, number> = {
      happy: 0,
      neutral: 0,
      sad: 0,
      anxious: 0,
    };
    dreams.forEach((d) => {
      if (counts[d.emotion] !== undefined) {
        counts[d.emotion] += 1;
      }
    });

    const happyPct = total > 0 ? Math.round((counts.happy / total) * 100) : 0;
    const neutralPct = total > 0 ? Math.round((counts.neutral / total) * 100) : 0;
    const sadPct = total > 0 ? Math.round((counts.sad / total) * 100) : 0;
    const anxiousPct = total > 0 ? Math.round((counts.anxious / total) * 100) : 0;

    return { counts, happyPct, neutralPct, sadPct, anxiousPct };
  }, [dreams, total]);

  // Compute 7-Day Trend (from past 6 days + today)
  const weeklyTrend = useMemo(() => {
    const today = new Date();
    const days: { dateStr: string; label: string; count: number; hasLucid: boolean }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
        weekday: 'narrow',
      });

      const dayDreams = dreams.filter((item) => item.date === dateStr);
      const hasLucid = dayDreams.some((item) => item.lucidityScore >= 3);

      days.push({
        dateStr,
        label: dayLabel,
        count: dayDreams.length,
        hasLucid,
      });
    }

    const maxCount = Math.max(...days.map((d) => d.count), 1);
    return { days, maxCount };
  }, [dreams, language]);

  return (
    <div className="space-y-4">
      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Dreams */}
        <div className="p-4 rounded-2xl border border-[#E5DDD2] dark:border-[#2D2722] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs">
          <div className="flex items-center justify-between text-[#8F8275] mb-1">
            <span className="text-xs font-medium">{t.kpiTotalDreams}</span>
            <MoonStar className="w-4 h-4 text-[#6366F1]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#2B241E] dark:text-[#EFE9E2] tabular-nums">
              {total}
            </span>
            <span className="text-[11px] text-[#8F8275]">{language === 'id' ? 'catatan' : 'logs'}</span>
          </div>
        </div>

        {/* Lucidity Rate */}
        <div className="p-4 rounded-2xl border border-[#E5DDD2] dark:border-[#2D2722] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs">
          <div className="flex items-center justify-between text-[#8F8275] mb-1">
            <span className="text-xs font-medium">{t.kpiLucidityRate}</span>
            <Sparkles className="w-4 h-4 text-[#6366F1]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-[#6366F1] tabular-nums">
              {lucidityRate}%
            </span>
            <span className="text-[11px] text-[#8F8275] tabular-nums">({lucidDreamsCount} lucid)</span>
          </div>
        </div>

        {/* Nightmare Rate */}
        <div className="p-4 rounded-2xl border border-[#E5DDD2] dark:border-[#2D2722] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs">
          <div className="flex items-center justify-between text-[#8F8275] mb-1">
            <span className="text-xs font-medium">{t.kpiNightmareRate}</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {nightmareRate}%
            </span>
            <span className="text-[11px] text-[#8F8275] tabular-nums">({nightmareCount} kali)</span>
          </div>
        </div>

        {/* Recurring Dreams */}
        <div className="p-4 rounded-2xl border border-[#E5DDD2] dark:border-[#2D2722] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs">
          <div className="flex items-center justify-between text-[#8F8275] mb-1">
            <span className="text-xs font-medium">{t.kpiRecurringCount}</span>
            <RefreshCw className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-sky-600 dark:text-sky-400 tabular-nums">
              {recurringCount}
            </span>
            <span className="text-[11px] text-[#8F8275]">{language === 'id' ? 'pola terulang' : 'recurring'}</span>
          </div>
        </div>
      </div>

      {/* Dual Analytics Row: Emotion Proportions & Weekly Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Emotion Ratio Bar */}
        <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl border border-[#E5DDD2] dark:border-[#2D2722] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2] flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-[#D97706]" />
                <span>{t.kpiEmotionRatio}</span>
              </span>
              <span className="text-[11px] font-mono text-[#8F8275]">
                {total} {language === 'id' ? 'Sampel Mimpi' : 'Dream Samples'}
              </span>
            </div>

            {/* Proportional Segment Bar */}
            <div className="h-4 w-full rounded-full bg-[#EAE2D8] dark:bg-[#28221D] overflow-hidden flex shadow-inner">
              {emotionStats.happyPct > 0 && (
                <div
                  style={{ width: `${emotionStats.happyPct}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`Gembira: ${emotionStats.happyPct}%`}
                />
              )}
              {emotionStats.neutralPct > 0 && (
                <div
                  style={{ width: `${emotionStats.neutralPct}%` }}
                  className="bg-blue-500 h-full transition-all"
                  title={`Datar: ${emotionStats.neutralPct}%`}
                />
              )}
              {emotionStats.sadPct > 0 && (
                <div
                  style={{ width: `${emotionStats.sadPct}%` }}
                  className="bg-indigo-500 h-full transition-all"
                  title={`Sedih: ${emotionStats.sadPct}%`}
                />
              )}
              {emotionStats.anxiousPct > 0 && (
                <div
                  style={{ width: `${emotionStats.anxiousPct}%` }}
                  className="bg-rose-500 h-full transition-all"
                  title={`Gelisah: ${emotionStats.anxiousPct}%`}
                />
              )}
            </div>
          </div>

          {/* Emotion Legend Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-2 border-t border-[#EAE2D8] dark:border-[#2E2823] text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <div>
                <div className="font-semibold text-[#2B241E] dark:text-[#EFE9E2] tabular-nums">
                  {emotionStats.happyPct}%
                </div>
                <div className="text-[10px] text-[#8F8275] truncate">{t.emotionHappy}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
              <div>
                <div className="font-semibold text-[#2B241E] dark:text-[#EFE9E2] tabular-nums">
                  {emotionStats.neutralPct}%
                </div>
                <div className="text-[10px] text-[#8F8275] truncate">{t.emotionNeutral}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
              <div>
                <div className="font-semibold text-[#2B241E] dark:text-[#EFE9E2] tabular-nums">
                  {emotionStats.sadPct}%
                </div>
                <div className="text-[10px] text-[#8F8275] truncate">{t.emotionSad}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <div>
                <div className="font-semibold text-[#2B241E] dark:text-[#EFE9E2] tabular-nums">
                  {emotionStats.anxiousPct}%
                </div>
                <div className="text-[10px] text-[#8F8275] truncate">{t.emotionAnxious}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly 7-Day Trend Strip */}
        <div className="lg:col-span-5 p-4 sm:p-5 rounded-2xl border border-[#E5DDD2] dark:border-[#2D2722] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#2B241E] dark:text-[#EFE9E2] flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#6366F1]" />
              <span>{t.kpiWeeklyTrend}</span>
            </span>
            <span className="text-[10px] font-mono text-[#8F8275]">7 Hari</span>
          </div>

          {/* Bar Chart Visual */}
          <div className="grid grid-cols-7 gap-2 items-end h-24 pt-4">
            {weeklyTrend.days.map((day) => {
              const heightPct = Math.max((day.count / weeklyTrend.maxCount) * 100, 10);
              return (
                <div key={day.dateStr} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono tabular-nums text-[#8F8275]">
                    {day.count > 0 ? day.count : ''}
                  </span>
                  <div
                    style={{ height: `${day.count > 0 ? heightPct : 6}%` }}
                    className={`w-full max-w-[28px] rounded-t-md transition-all ${
                      day.count > 0
                        ? day.hasLucid
                          ? 'bg-[#6366F1]'
                          : 'bg-[#818CF8]'
                        : 'bg-[#EAE2D8] dark:bg-[#28221D]'
                    }`}
                    title={`${day.dateStr}: ${day.count} mimpi`}
                  />
                  <span className="text-[11px] font-mono text-[#7B6F63] dark:text-[#9F9184]">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-[#8F8275] pt-2 border-t border-[#EAE2D8] dark:border-[#2E2823] mt-2 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#6366F1]" />
              <span>{language === 'id' ? 'Mimpi Lucid' : 'Lucid Dreams'}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#818CF8]" />
              <span>{language === 'id' ? 'Mimpi Standar' : 'Standard'}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
