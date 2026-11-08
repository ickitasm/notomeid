/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Film,
  Tv,
  Plus,
  Search,
  Star,
  CheckCircle2,
  Clock,
  Calendar as CalendarIcon,
  Play,
  Edit2,
  Trash2,
  Bookmark,
  X,
} from 'lucide-react';
import { MediaItem, MediaType, MediaStatus } from '../../types';
import { MiniCalendar, CalendarHighlight } from '../MiniCalendar';
import { MediaModal } from './MediaModal';
import { ConfirmDeleteModal } from '../Common/ConfirmDeleteModal';
import { translations, Language } from '../../lib/translations';

interface MediaViewProps {
  mediaItems: MediaItem[];
  onAddItem: (item: Omit<MediaItem, 'id' | 'updatedAt'>) => void;
  onUpdateItem: (id: string, updates: Partial<MediaItem>) => void;
  onDeleteItem: (id: string) => void;
  onIncrementEpisode: (id: string) => void;
  onDecrementEpisode?: (id: string) => void;
  language?: Language;
}

export const MediaView: React.FC<MediaViewProps> = ({
  mediaItems,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onIncrementEpisode,
  onDecrementEpisode,
  language = 'id',
}) => {
  const t = translations[language].media;
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<MediaStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [mobileTab, setMobileTab] = useState<'catalog' | 'calendar'>('catalog');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);

  // Quick duration tracker state
  const [durationItem, setDurationItem] = useState<MediaItem | null>(null);
  const [durHours, setDurHours] = useState<number | string>('');
  const [durMinutes, setDurMinutes] = useState<number | string>('');
  const [durSeconds, setDurSeconds] = useState<number | string>('');

  const handleOpenDuration = (item: MediaItem) => {
    setDurationItem(item);
    setDurHours(item.durationNotes?.hours !== undefined ? item.durationNotes.hours : '');
    setDurMinutes(item.durationNotes?.minutes !== undefined ? item.durationNotes.minutes : '');
    setDurSeconds(item.durationNotes?.seconds !== undefined ? item.durationNotes.seconds : '');
  };

  const handleSaveDuration = () => {
    if (!durationItem) return;
    const h = Math.max(0, parseInt(String(durHours), 10) || 0);
    const m = Math.min(59, Math.max(0, parseInt(String(durMinutes), 10) || 0));
    const s = Math.min(59, Math.max(0, parseInt(String(durSeconds), 10) || 0));
    onUpdateItem(durationItem.id, {
      durationNotes: (h > 0 || m > 0 || s > 0) ? { hours: h, minutes: m, seconds: s } : undefined,
    });
    setDurationItem(null);
  };

  const handleClearDuration = () => {
    if (!durationItem) return;
    onUpdateItem(durationItem.id, { durationNotes: undefined });
    setDurationItem(null);
  };

  const formatDuration = (d?: { hours: number; minutes: number; seconds: number }) => {
    if (!d || (d.hours === 0 && d.minutes === 0 && d.seconds === 0)) return null;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.hours)}:${pad(d.minutes)}:${pad(d.seconds)}`;
  };

  // Compute stats
  const stats = useMemo(() => {
    const total = mediaItems.length;
    const watching = mediaItems.filter((m) => m.status === 'watching').length;
    const completed = mediaItems.filter((m) => m.status === 'completed').length;
    const totalEpisodes = mediaItems.reduce((acc, m) => {
      if (m.type === 'series' && m.seriesDetails) {
        return acc + m.seriesDetails.currentEpisode;
      }
      return acc;
    }, 0);
    return { total, watching, completed, totalEpisodes };
  }, [mediaItems]);

  // Mini-calendar highlights
  const calendarHighlights = useMemo(() => {
    const map: Record<string, CalendarHighlight> = {};
    mediaItems.forEach((item) => {
      if (item.scheduledWatchDate) {
        map[item.scheduledWatchDate] = {
          color: '#C85A32',
          label: `Watch: ${item.title}`,
        };
      } else if (item.releaseDate) {
        map[item.releaseDate] = {
          color: '#D9822B',
          label: `Release: ${item.title}`,
        };
      }
    });
    return map;
  }, [mediaItems]);

  // Filtered list
  const filteredItems = useMemo(() => {
    return mediaItems.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchGenre = item.genres.some((g) => g.toLowerCase().includes(q));
        const matchNotes = item.notes?.toLowerCase().includes(q);
        if (!matchTitle && !matchGenre && !matchNotes) return false;
      }
      return true;
    });
  }, [mediaItems, selectedType, selectedStatus, searchQuery]);

  // Items scheduled for selected calendar date
  const dateScheduledItems = useMemo(() => {
    return mediaItems.filter(
      (m) => m.scheduledWatchDate === selectedDate || m.releaseDate === selectedDate
    );
  }, [mediaItems, selectedDate]);

  const handleEdit = (item: MediaItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleSaveModal = (itemData: Omit<MediaItem, 'id' | 'updatedAt'>) => {
    if (editingItem) {
      onUpdateItem(editingItem.id, itemData);
    } else {
      onAddItem(itemData);
    }
    setEditingItem(null);
  };

  return (
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="pb-6 border-b border-[#E4DCDB] dark:border-[#352F2B]">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2] leading-tight">
            <span className="block">Catat</span>
            <span className="block text-[#C85A32] dark:text-[#E07A52]">Film,</span>
            <span className="block">Serial.</span>
          </h1>
          <p className="text-sm sm:text-base text-[#7B6F63] dark:text-[#9F9184] mt-2.5 max-w-2xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-4 sm:p-5 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
          <div className="text-xs font-semibold text-[#7B6F63] dark:text-[#9F9184]">
            {t.totalLib}
          </div>
          <div className="mt-1.5 font-serif text-2xl sm:text-3xl font-bold text-[#2B241E] dark:text-[#EFE9E2] font-mono tabular-nums">
            {stats.total}
          </div>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
          <div className="text-xs font-semibold text-[#7B6F63] dark:text-[#9F9184]">
            {t.currentlyWatching}
          </div>
          <div className="mt-1.5 font-serif text-2xl sm:text-3xl font-bold text-[#C85A32] font-mono tabular-nums">
            {stats.watching}
          </div>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
          <div className="text-xs font-semibold text-[#7B6F63] dark:text-[#9F9184]">
            {t.episodesLogged}
          </div>
          <div className="mt-1.5 font-serif text-2xl sm:text-3xl font-bold text-[#5B7A58] font-mono tabular-nums">
            {stats.totalEpisodes}
          </div>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
          <div className="text-xs font-semibold text-[#7B6F63] dark:text-[#9F9184]">
            {t.completed}
          </div>
          <div className="mt-1.5 font-serif text-2xl sm:text-3xl font-bold text-[#2B241E] dark:text-[#EFE9E2] font-mono tabular-nums">
            {stats.completed}
          </div>
        </div>
      </div>

      {/* Mobile Segmented Switcher (Visible on mobile/tablet, hidden on desktop lg:) */}
      <div className="lg:hidden flex items-center p-1 bg-[#EAE2D7] dark:bg-[#25201C] rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
            mobileTab === 'catalog'
              ? 'bg-white dark:bg-[#161311] text-[#2B241E] dark:text-[#EFE9E2] shadow-xs'
              : 'text-[#7B6F63] dark:text-[#9F9184]'
          }`}
        >
          <Film className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>{language === 'id' ? 'Katalog Film & Serial' : 'Catalog & Library'}</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('calendar')}
          className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation ${
            mobileTab === 'calendar'
              ? 'bg-white dark:bg-[#161311] text-[#2B241E] dark:text-[#EFE9E2] shadow-xs'
              : 'text-[#7B6F63] dark:text-[#9F9184]'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>{language === 'id' ? 'Kalender Jadwal' : 'Schedule Calendar'}</span>
        </button>
      </div>

      {/* Two Column Layout: Main Content (Filters + Grid) & Side Mini-Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main 2-column wide content */}
        <div className={`lg:col-span-2 space-y-6 ${mobileTab === 'catalog' ? 'block' : 'hidden lg:block'}`}>
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 p-3 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
            {/* Type tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[#F4ECE3] dark:bg-[#25201C] rounded-xl">
              {(['all', 'movie', 'series'] as const).map((typeVal) => (
                <button
                  key={typeVal}
                  type="button"
                  onClick={() => setSelectedType(typeVal)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    selectedType === typeVal
                      ? 'bg-white dark:bg-[#161311] text-[#2B241E] dark:text-[#EFE9E2] shadow-xs font-semibold'
                      : 'text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
                  }`}
                >
                  {typeVal === 'all' ? t.allTypes : typeVal === 'movie' ? t.moviesOnly : t.showsOnly}
                </button>
              ))}
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['all', 'watching', 'watchlist', 'completed'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                    selectedStatus === s
                      ? 'border-[#C85A32] bg-[#C85A32]/10 text-[#C85A32] font-semibold'
                      : 'border-transparent text-[#6F645A] dark:text-[#A89C90] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C]'
                  }`}
                >
                  {s === 'all'
                    ? t.allStatus
                    : s === 'watching'
                    ? t.watchingStatus
                    : s === 'watchlist'
                    ? t.watchlistStatus
                    : t.completedStatus}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[180px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8275]" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs sm:text-sm focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>
          </div>

          {/* Cards List */}
          {filteredItems.length === 0 ? (
            <div className="p-14 text-center rounded-2xl border border-dashed border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
              <Film className="w-10 h-10 mx-auto text-[#8F8275] mb-3" />
              <h3 className="font-serif text-lg font-semibold">{t.noResults}</h3>
              <p className="text-xs sm:text-sm text-[#7B6F63] mt-1.5 max-w-sm mx-auto leading-relaxed">
                {t.noResultsDesc}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] text-xs sm:text-sm font-medium hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] cursor-pointer transition-colors"
              >
                {t.resetFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {filteredItems.map((item) => {
                const isSeries = item.type === 'series' && item.seriesDetails;
                const details = item.seriesDetails;
                const progressPercent =
                  isSeries && details
                    ? Math.round((details.currentEpisode / details.totalEpisodes) * 100)
                    : item.status === 'completed'
                    ? 100
                    : 0;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-5 sm:p-6 transition-all hover:border-[#C85A32]/40 hover:shadow-xs"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {item.type === 'series' ? (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#C85A32]">
                              <Tv className="w-4 h-4" />
                              TV Series
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#5B7A58]">
                              <Film className="w-4 h-4" />
                              Movie
                            </span>
                          )}
                          <span className="text-[#8F8275] text-xs">·</span>
                          <span className="text-xs font-mono tabular-nums text-[#7B6F63] dark:text-[#9F9184]">
                            {item.releaseDate ? item.releaseDate.slice(0, 4) : 'TBA'}
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2B241E] dark:text-[#EFE9E2] mt-2.5 leading-snug">
                        {item.title}
                      </h3>

                      {/* Unboxed Metadata Genres */}
                      <div className="flex items-center flex-wrap gap-2 text-xs text-[#7B6F63] dark:text-[#9F9184] mt-1.5">
                        {item.genres.map((g, idx) => (
                          <React.Fragment key={g}>
                            <span>{g}</span>
                            {idx < item.genres.length - 1 && <span aria-hidden="true">·</span>}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Episodic Progress (if TV Series) */}
                      {isSeries && details && (
                        <div className="mt-3.5 p-3.5 sm:p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E9E1D6] dark:border-[#38302A] space-y-2.5">
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-medium text-[#2B241E] dark:text-[#EFE9E2]">
                              Season {details.currentSeason} · Episode {details.currentEpisode} of {details.totalEpisodes}
                            </span>
                            <span className="font-mono tabular-nums text-xs text-[#7B6F63]">
                              {progressPercent}%
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-2 bg-[#E4DCDB] dark:bg-[#38312B] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#C85A32] rounded-full transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          {/* Quick Step Buttons: [-] and [+1 Episode] */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-[#7B6F63]">
                              {item.status === 'completed'
                                ? 'Finished series'
                                : `${details.totalEpisodes - details.currentEpisode} ep left`}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onDecrementEpisode?.(item.id)}
                                disabled={details.currentEpisode <= 0}
                                className="flex items-center justify-center w-7 h-7 rounded-lg border border-[#D5CBC0] dark:border-[#403832] bg-white dark:bg-[#1E1916] text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] disabled:opacity-30 disabled:pointer-events-none transition-colors active:scale-95 cursor-pointer"
                                title="Kurangi 1 Episode (-1)"
                                aria-label="Kurangi 1 Episode"
                              >
                                <span className="text-base font-bold font-mono leading-none">−</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onIncrementEpisode(item.id)}
                                disabled={details.currentEpisode >= details.totalEpisodes}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C85A32] text-white text-xs font-medium hover:bg-[#B34B25] disabled:opacity-40 disabled:pointer-events-none transition-colors active:scale-95 cursor-pointer"
                                title="Tambah 1 Episode (+1)"
                              >
                                <Play className="w-3.5 h-3.5 fill-white" />
                                <span>+1 Episode</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Quick Duration Tracker on Card */}
                      <div className="mt-3 pt-2.5 border-t border-[#EAE2D7]/70 dark:border-[#2D2722] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenDuration(item)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums border border-[#E0D7CB] dark:border-[#38312B] bg-[#F7F2EB] dark:bg-[#201A16] text-[#594E44] dark:text-[#C5B8AA] hover:border-[#C85A32] hover:text-[#C85A32] transition-colors cursor-pointer"
                          title="Klik untuk mencatat durasi sekilas (jam, menit, detik)"
                        >
                          <Clock className="w-3.5 h-3.5 text-[#C85A32]" />
                          <span className="font-medium">
                            {formatDuration(item.durationNotes) || (language === 'id' ? '+ Catat Durasi' : '+ Add Duration')}
                          </span>
                        </button>
                        {formatDuration(item.durationNotes) && (
                          <span className="text-[11px] font-mono text-[#8F8275] dark:text-[#7A7067]">
                            {item.durationNotes?.hours ? `${item.durationNotes.hours}j ` : ''}
                            {item.durationNotes?.minutes ? `${item.durationNotes.minutes}m ` : ''}
                            {item.durationNotes?.seconds ? `${item.durationNotes.seconds}d` : ''}
                          </span>
                        )}
                      </div>

                      {/* Movie Status or Notes */}
                      {item.notes && (
                        <p className="mt-2.5 text-xs sm:text-sm text-[#6F645A] dark:text-[#A89C90] line-clamp-2 italic leading-relaxed">
                          "{item.notes}"
                        </p>
                      )}

                      {/* Scheduled watch date label */}
                      {item.scheduledWatchDate && (
                        <div className="mt-3.5 flex items-center gap-2 text-xs text-[#C85A32] font-mono tabular-nums">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Watch scheduled: {item.scheduledWatchDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Bottom */}
                    <div className="flex items-center justify-between pt-3.5 mt-5 border-t border-[#E4DCDB] dark:border-[#352F2B]">
                      {/* Status Tag (Quiet unboxed) */}
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184]">
                        {item.status === 'watching'
                          ? 'In Progress'
                          : item.status === 'watchlist'
                          ? 'Plan to Watch'
                          : item.status === 'completed'
                          ? 'Completed'
                          : 'On Hold'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="p-2 rounded-lg hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] transition-colors cursor-pointer"
                          title="Edit movie or series details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[#7B6F63] hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Embedded Entertainment Mini-Calendar & Upcoming Schedule */}
        <div className={`space-y-6 ${mobileTab === 'calendar' ? 'block' : 'hidden lg:block'}`}>
          <div className="rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-base font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                  {t.calendarTitle}
                </h3>
                <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] mt-0.5">
                  {t.calendarSubtitle}
                </p>
              </div>
            </div>

            <MiniCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              highlights={calendarHighlights}
              variant="media"
              className="border-0 p-0 bg-transparent"
            />

            {/* Selected Date Context */}
            <div className="mt-4 pt-3 border-t border-[#E4DCDB] dark:border-[#352F2B]">
              <div className="flex items-center justify-between text-xs font-medium mb-2">
                <span className="font-serif text-[#2B241E] dark:text-[#EFE9E2]">
                  {t.agendaOn} {selectedDate}
                </span>
                <span className="text-[11px] font-mono text-[#C85A32]">
                  {dateScheduledItems.length} {t.planned}
                </span>
              </div>

              {dateScheduledItems.length === 0 ? (
                <div className="text-[11px] text-[#7B6F63] py-2 italic">
                  {t.noPlanned}
                </div>
              ) : (
                <div className="space-y-2">
                  {dateScheduledItems.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E9E1D6] dark:border-[#38302A] text-xs"
                    >
                      <div className="font-medium text-[#2B241E] dark:text-[#EFE9E2]">
                        {m.title}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-[11px] text-[#7B6F63]">
                        <span>{m.type === 'series' ? 'TV Series episode' : 'Movie session'}</span>
                        {m.status === 'watching' && (
                          <button
                            type="button"
                            onClick={() => onIncrementEpisode(m.id)}
                            className="text-[#C85A32] font-semibold hover:underline"
                          >
                            +1 Ep
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Queue: In Progress Watchlist */}
          <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4">
            <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#7B6F63] mb-3">
              {t.upNext}
            </h4>
            <div className="space-y-2.5 text-xs">
              {mediaItems
                .filter((m) => m.status === 'watching')
                .slice(0, 4)
                .map((m) => (
                  <div key={m.id} className="flex items-center justify-between">
                    <div className="truncate mr-2">
                      <div className="font-medium truncate text-[#2B241E] dark:text-[#EFE9E2]">
                        {m.title}
                      </div>
                      {m.seriesDetails && (
                        <div className="text-[11px] text-[#7B6F63]">
                          S{m.seriesDetails.currentSeason}E{m.seriesDetails.currentEpisode}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => onIncrementEpisode(m.id)}
                      className="px-2 py-1 rounded bg-[#EFE8DD] dark:bg-[#28221D] hover:bg-[#C85A32] hover:text-white text-[11px] font-medium transition-colors shrink-0 cursor-pointer"
                    >
                      {t.watchBtn}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <MediaModal
        key={editingItem ? editingItem.id : 'new-media'}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveModal}
        initialItem={editingItem}
      />

      {/* Centered Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            onDeleteItem(itemToDelete.id);
          }
        }}
        title={language === 'id' ? 'Hapus Film / Serial?' : 'Delete Movie or Series?'}
        itemName={itemToDelete?.title}
        description={
          language === 'id'
            ? 'Entri film/serial ini beserta progres episode dan penilaiannya akan dihapus secara permanen.'
            : 'This media title along with its progress and rating will be permanently removed.'
        }
        language={language}
      />

      {/* Quick Duration Entry Modal */}
      {durationItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FAF7F2] dark:bg-[#1C1815] p-5 text-[#2D2823] dark:text-[#EAE3DA] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4DCDB] dark:border-[#352F2B]">
              <div className="flex items-center gap-2 min-w-0">
                <Clock className="w-4 h-4 text-[#C85A32] shrink-0" />
                <h3 className="font-serif text-sm font-bold truncate">
                  {language === 'id' ? 'Catatan Durasi Sekilas' : 'Quick Duration Stamp'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDurationItem(null)}
                className="p-1 rounded-lg hover:bg-[#EFE8DD] dark:hover:bg-[#2A2420] text-[#7B6F63] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] truncate font-medium">
                {durationItem.title}
              </p>
              <p className="text-[11px] text-[#8F8275] mt-0.5">
                {language === 'id'
                  ? 'Catat durasi total atau posisi tonton terakhir Anda (jam, menit, detik).'
                  : 'Record total duration or your last watch timestamp (hours, mins, secs).'}
              </p>
            </div>

            {/* Inputs: Jam, Menit, Detik */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <label className="block text-[11px] font-mono text-[#7B6F63] dark:text-[#9F9184] mb-1">
                  {language === 'id' ? 'Jam' : 'Hours'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  placeholder="0"
                  value={durHours}
                  onChange={(e) => setDurHours(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-center text-sm font-semibold focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#7B6F63] dark:text-[#9F9184] mb-1">
                  {language === 'id' ? 'Menit' : 'Mins'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={durMinutes}
                  onChange={(e) => setDurMinutes(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-center text-sm font-semibold focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-[#7B6F63] dark:text-[#9F9184] mb-1">
                  {language === 'id' ? 'Detik' : 'Secs'}
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  placeholder="0"
                  value={durSeconds}
                  onChange={(e) => setDurSeconds(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-center text-sm font-semibold focus:outline-hidden focus:border-[#C85A32]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E4DCDB] dark:border-[#352F2B]">
              {durationItem.durationNotes && (
                <button
                  type="button"
                  onClick={handleClearDuration}
                  className="px-3 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer mr-auto"
                >
                  {language === 'id' ? 'Hapus' : 'Clear'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setDurationItem(null)}
                className="px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] text-xs font-medium hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] transition-colors cursor-pointer"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveDuration}
                className="px-4 py-1.5 rounded-lg bg-[#C85A32] text-white text-xs font-semibold hover:bg-[#B34B25] transition-colors cursor-pointer"
              >
                {language === 'id' ? 'Simpan' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) - stays fixed on scroll */}
      <button
        type="button"
        onClick={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
        aria-label={t.addBtn || 'Tambah Film/Serial'}
        title={t.addBtn || 'Tambah Film/Serial'}
        className="fixed bottom-24 right-5 sm:bottom-8 sm:right-8 z-30 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#C85A32] hover:bg-[#B34B25] text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-white/20 dark:border-white/10 group focus-visible:outline-hidden"
      >
        <Film className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:rotate-12" />
        <span className="sr-only">{t.addBtn}</span>
      </button>
    </div>
  );
};
