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
} from 'lucide-react';
import { MediaItem, MediaType, MediaStatus } from '../../types';
import { MiniCalendar, CalendarHighlight } from '../MiniCalendar';
import { MediaModal } from './MediaModal';

interface MediaViewProps {
  mediaItems: MediaItem[];
  onAddItem: (item: Omit<MediaItem, 'id' | 'updatedAt'>) => void;
  onUpdateItem: (id: string, updates: Partial<MediaItem>) => void;
  onDeleteItem: (id: string) => void;
  onIncrementEpisode: (id: string) => void;
}

export const MediaView: React.FC<MediaViewProps> = ({
  mediaItems,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onIncrementEpisode,
}) => {
  const [selectedType, setSelectedType] = useState<MediaType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<MediaStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

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
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4DCDB] dark:border-[#352F2B]">
        <div>
          <div className="text-xs uppercase tracking-widest font-mono text-[#C85A32] font-semibold mb-1">
            Entertainment Chronicle
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
            Cinema & Series Archive
          </h1>
          <p className="text-xs sm:text-sm text-[#7B6F63] dark:text-[#9F9184] mt-1 max-w-2xl">
            Track episodic progress, ratings, and upcoming release dates with your personal watch planner.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C85A32] text-white text-xs sm:text-sm font-medium hover:bg-[#B34B25] transition-colors shadow-xs whitespace-nowrap self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Movie / Series</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
          <div className="text-[11px] font-medium text-[#7B6F63] dark:text-[#9F9184]">
            Total In Library
          </div>
          <div className="mt-1 font-serif text-2xl font-bold text-[#2B241E] dark:text-[#EFE9E2] font-mono tabular-nums">
            {stats.total}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
          <div className="text-[11px] font-medium text-[#7B6F63] dark:text-[#9F9184]">
            Currently Watching
          </div>
          <div className="mt-1 font-serif text-2xl font-bold text-[#C85A32] font-mono tabular-nums">
            {stats.watching}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
          <div className="text-[11px] font-medium text-[#7B6F63] dark:text-[#9F9184]">
            Episodes Logged
          </div>
          <div className="mt-1 font-serif text-2xl font-bold text-[#5B7A58] font-mono tabular-nums">
            {stats.totalEpisodes}
          </div>
        </div>
        <div className="p-3.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
          <div className="text-[11px] font-medium text-[#7B6F63] dark:text-[#9F9184]">
            Completed
          </div>
          <div className="mt-1 font-serif text-2xl font-bold text-[#2B241E] dark:text-[#EFE9E2] font-mono tabular-nums">
            {stats.completed}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Main Content (Filters + Grid) & Side Mini-Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main 2-column wide content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
            {/* Type tabs */}
            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-[#F4ECE3] dark:bg-[#25201C] rounded-lg">
              {(['all', 'movie', 'series'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    selectedType === t
                      ? 'bg-white dark:bg-[#161311] text-[#2B241E] dark:text-[#EFE9E2] shadow-xs font-semibold'
                      : 'text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] dark:hover:text-[#EFE9E2]'
                  }`}
                >
                  {t === 'all' ? 'All Types' : t === 'movie' ? 'Movies' : 'TV Shows'}
                </button>
              ))}
            </div>

            {/* Status tabs */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {(['all', 'watching', 'watchlist', 'completed'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStatus(s)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors whitespace-nowrap ${
                    selectedStatus === s
                      ? 'border-[#C85A32] bg-[#C85A32]/10 text-[#C85A32] font-semibold'
                      : 'border-transparent text-[#6F645A] dark:text-[#A89C90] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C]'
                  }`}
                >
                  {s === 'all' ? 'All Status' : s === 'watching' ? 'Watching' : s === 'watchlist' ? 'Watchlist' : 'Done'}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[160px]">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F8275]" />
              <input
                type="text"
                placeholder="Search titles, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>
          </div>

          {/* Cards List */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-dashed border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
              <Film className="w-8 h-8 mx-auto text-[#8F8275] mb-2" />
              <h3 className="font-serif text-base font-semibold">No media matches this filter</h3>
              <p className="text-xs text-[#7B6F63] mt-1 max-w-sm mx-auto">
                Try clearing search terms or add a new film or show to start tracking.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="mt-4 px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] text-xs font-medium hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="flex flex-col justify-between rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4 transition-all hover:border-[#C85A32]/40"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {item.type === 'series' ? (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-[#C85A32]">
                              <Tv className="w-3.5 h-3.5" />
                              TV Series
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-[#5B7A58]">
                              <Film className="w-3.5 h-3.5" />
                              Movie
                            </span>
                          )}
                          <span className="text-[#8F8275] text-xs">·</span>
                          <span className="text-[11px] font-mono tabular-nums text-[#7B6F63] dark:text-[#9F9184]">
                            {item.releaseDate ? item.releaseDate.slice(0, 4) : 'TBA'}
                          </span>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-1 text-xs font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{item.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-lg font-bold text-[#2B241E] dark:text-[#EFE9E2] mt-1.5 leading-snug">
                        {item.title}
                      </h3>

                      {/* Unboxed Metadata Genres */}
                      <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-[#7B6F63] dark:text-[#9F9184] mt-1">
                        {item.genres.map((g, idx) => (
                          <React.Fragment key={g}>
                            <span>{g}</span>
                            {idx < item.genres.length - 1 && <span aria-hidden="true">·</span>}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Episodic Progress (if TV Series) */}
                      {isSeries && details && (
                        <div className="mt-3 p-3 rounded-lg bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E9E1D6] dark:border-[#38302A] space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-[#2B241E] dark:text-[#EFE9E2]">
                              Season {details.currentSeason} · Episode {details.currentEpisode} of {details.totalEpisodes}
                            </span>
                            <span className="font-mono tabular-nums text-[11px] text-[#7B6F63]">
                              {progressPercent}%
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-1.5 bg-[#E4DCDB] dark:bg-[#38312B] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#C85A32] rounded-full transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>

                          {/* Quick Step Button */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-[#7B6F63]">
                              {item.status === 'completed'
                                ? 'Finished series'
                                : `${details.totalEpisodes - details.currentEpisode} ep left`}
                            </span>
                            <button
                              type="button"
                              onClick={() => onIncrementEpisode(item.id)}
                              disabled={details.currentEpisode >= details.totalEpisodes}
                              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#C85A32] text-white text-[11px] font-medium hover:bg-[#B34B25] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                            >
                              <Play className="w-3 h-3 fill-white" />
                              <span>+1 Episode</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Movie Status or Notes */}
                      {item.notes && (
                        <p className="mt-2 text-xs text-[#6F645A] dark:text-[#A89C90] line-clamp-2 italic">
                          "{item.notes}"
                        </p>
                      )}

                      {/* Scheduled watch date label */}
                      {item.scheduledWatchDate && (
                        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[#C85A32] font-mono tabular-nums">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>Watch scheduled: {item.scheduledWatchDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Bottom */}
                    <div className="flex items-center justify-between pt-3 mt-4 border-t border-[#E4DCDB] dark:border-[#352F2B]">
                      {/* Status Tag (Quiet unboxed) */}
                      <span className="text-[11px] font-medium uppercase tracking-wider text-[#7B6F63] dark:text-[#9F9184]">
                        {item.status === 'watching'
                          ? 'In Progress'
                          : item.status === 'watchlist'
                          ? 'Plan to Watch'
                          : item.status === 'completed'
                          ? 'Completed'
                          : 'On Hold'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="p-1.5 rounded hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] text-[#7B6F63] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] transition-colors"
                          title="Edit movie or series details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[#7B6F63] hover:text-rose-600 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                  Watch & Release Calendar
                </h3>
                <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184]">
                  Mini-calendar for movie nights & premiere dates
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
                  Agenda on {selectedDate}
                </span>
                <span className="text-[11px] font-mono text-[#C85A32]">
                  {dateScheduledItems.length} planned
                </span>
              </div>

              {dateScheduledItems.length === 0 ? (
                <div className="text-[11px] text-[#7B6F63] py-2 italic">
                  No watch sessions or premieres marked for this date.
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
              Up Next to Watch
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
                      className="px-2 py-1 rounded bg-[#EFE8DD] dark:bg-[#28221D] hover:bg-[#C85A32] hover:text-white text-[11px] font-medium transition-colors shrink-0"
                    >
                      Watch
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <MediaModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveModal}
        initialItem={editingItem}
      />
    </div>
  );
};
