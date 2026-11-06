/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Film, Tv, Star, Calendar } from 'lucide-react';
import { MediaItem, MediaType, MediaStatus } from '../../types';

interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<MediaItem, 'id' | 'updatedAt'>) => void;
  initialItem?: MediaItem | null;
}

const AVAILABLE_GENRES = [
  'Sci-Fi', 'Drama', 'Thriller', 'Action', 'Comedy', 'Adventure',
  'Crime', 'Mystery', 'Animation', 'Horror', 'Documentary', 'Fantasy'
];

export const MediaModal: React.FC<MediaModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const [title, setTitle] = useState(initialItem?.title || '');
  const [type, setType] = useState<MediaType>(initialItem?.type || 'series');
  const [status, setStatus] = useState<MediaStatus>(initialItem?.status || 'watching');
  const [rating, setRating] = useState<number>(initialItem?.rating ?? 8.5);
  const [releaseDate, setReleaseDate] = useState(initialItem?.releaseDate || '');
  const [scheduledWatchDate, setScheduledWatchDate] = useState(initialItem?.scheduledWatchDate || '');
  const [posterUrl, setPosterUrl] = useState(initialItem?.posterUrl || '');
  const [notes, setNotes] = useState(initialItem?.notes || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialItem?.genres || ['Sci-Fi', 'Drama']);

  // Series details
  const [totalSeasons, setTotalSeasons] = useState(initialItem?.seriesDetails?.totalSeasons || 1);
  const [totalEpisodes, setTotalEpisodes] = useState(initialItem?.seriesDetails?.totalEpisodes || 10);
  const [currentSeason, setCurrentSeason] = useState(initialItem?.seriesDetails?.currentSeason || 1);
  const [currentEpisode, setCurrentEpisode] = useState(initialItem?.seriesDetails?.currentEpisode || 1);

  // Synchronize state when initialItem or isOpen changes
  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title || '');
      setType(initialItem.type || 'series');
      setStatus(initialItem.status || 'watching');
      setRating(typeof initialItem.rating === 'number' ? initialItem.rating : 8.5);
      setReleaseDate(initialItem.releaseDate || '');
      setScheduledWatchDate(initialItem.scheduledWatchDate || '');
      setPosterUrl(initialItem.posterUrl || '');
      setNotes(initialItem.notes || '');
      setSelectedGenres(initialItem.genres && initialItem.genres.length > 0 ? initialItem.genres : ['Sci-Fi', 'Drama']);
      setTotalSeasons(initialItem.seriesDetails?.totalSeasons || 1);
      setTotalEpisodes(initialItem.seriesDetails?.totalEpisodes || 10);
      setCurrentSeason(initialItem.seriesDetails?.currentSeason || 1);
      setCurrentEpisode(initialItem.seriesDetails?.currentEpisode || 1);
    } else {
      setTitle('');
      setType('series');
      setStatus('watching');
      setRating(8.5);
      setReleaseDate('');
      setScheduledWatchDate('');
      setPosterUrl('');
      setNotes('');
      setSelectedGenres(['Sci-Fi', 'Drama']);
      setTotalSeasons(1);
      setTotalEpisodes(10);
      setCurrentSeason(1);
      setCurrentEpisode(1);
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      type,
      status,
      rating: Number(rating),
      releaseDate: releaseDate || undefined,
      scheduledWatchDate: scheduledWatchDate || undefined,
      posterUrl: posterUrl.trim() || undefined,
      genres: selectedGenres,
      notes: notes.trim() || undefined,
      seriesDetails:
        type === 'series'
          ? {
              totalSeasons: Math.max(1, Number(totalSeasons)),
              totalEpisodes: Math.max(1, Number(totalEpisodes)),
              currentSeason: Math.max(1, Number(currentSeason)),
              currentEpisode: Math.max(0, Number(currentEpisode)),
            }
          : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-t-3xl sm:rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FAF7F2] dark:bg-[#1C1815] p-5 sm:p-6 text-[#2D2823] dark:text-[#EAE3DA] shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Mobile Grab Handle */}
        <div className="w-10 h-1 bg-[#D5CBC0] dark:bg-[#3D352F] rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-[#E4DCDB] dark:border-[#352F2B]">
          <div>
            <h3 className="font-serif text-lg font-bold">
              {initialItem ? 'Edit Media Entry' : 'Add Movie or TV Series'}
            </h3>
            <p className="text-xs text-[#7B6F63] dark:text-[#9F9184]">
              Keep track of episodic progress, release dates, and watch schedules.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#EFE8DD] dark:hover:bg-[#2A2420] text-[#7B6F63] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Type Selector */}
          <div>
            <label className="block font-medium mb-1.5 text-[#594E44] dark:text-[#C5B8AA]">
              Media Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('series')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  type === 'series'
                    ? 'border-[#C85A32] bg-[#C85A32]/10 text-[#C85A32] font-semibold'
                    : 'border-[#E4DCDB] dark:border-[#352F2B] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]'
                }`}
              >
                <Tv className="w-4 h-4" />
                TV Series & Episodes
              </button>
              <button
                type="button"
                onClick={() => setType('movie')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                  type === 'movie'
                    ? 'border-[#C85A32] bg-[#C85A32]/10 text-[#C85A32] font-semibold'
                    : 'border-[#E4DCDB] dark:border-[#352F2B] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]'
                }`}
              >
                <Film className="w-4 h-4" />
                Feature Film
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Title <span className="text-[#C85A32]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Severance, Dune: Part Two"
              className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-sm focus:outline-hidden focus:border-[#C85A32]"
            />
          </div>

          {/* Status & Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Watch Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MediaStatus)}
                className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
              >
                <option value="watching">Currently Watching</option>
                <option value="watchlist">Plan to Watch</option>
                <option value="completed">Completed</option>
                <option value="dropped">On Hold / Dropped</option>
              </select>
            </div>

            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Rating (1 - 10)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-xs focus:outline-hidden focus:border-[#C85A32]"
                />
                <Star className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
              </div>
            </div>
          </div>

          {/* Series Specifics */}
          {type === 'series' && (
            <div className="p-3 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#F7F2EB] dark:bg-[#221C18] space-y-3">
              <div className="font-serif font-semibold text-xs text-[#594E44] dark:text-[#C5B8AA]">
                Episodic Progress
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[11px] text-[#7B6F63]">Current Season</span>
                  <input
                    type="number"
                    min="1"
                    value={currentSeason}
                    onChange={(e) => setCurrentSeason(parseInt(e.target.value, 10) || 1)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-md border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-[#7B6F63]">Current Episode</span>
                  <input
                    type="number"
                    min="0"
                    value={currentEpisode}
                    onChange={(e) => setCurrentEpisode(parseInt(e.target.value, 10) || 0)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-md border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-[#7B6F63]">Total Seasons</span>
                  <input
                    type="number"
                    min="1"
                    value={totalSeasons}
                    onChange={(e) => setTotalSeasons(parseInt(e.target.value, 10) || 1)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-md border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-[#7B6F63]">Total Episodes</span>
                  <input
                    type="number"
                    min="1"
                    value={totalEpisodes}
                    onChange={(e) => setTotalEpisodes(parseInt(e.target.value, 10) || 1)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-md border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Premiere / Release Date
              </label>
              <input
                type="date"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono text-xs focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Schedule Watch Date (for Calendar)
              </label>
              <input
                type="date"
                value={scheduledWatchDate}
                onChange={(e) => setScheduledWatchDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono text-xs focus:outline-hidden focus:border-[#C85A32]"
              />
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block font-medium mb-1.5 text-[#594E44] dark:text-[#C5B8AA]">
              Genres
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_GENRES.map((g) => {
                const isSelected = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGenre(g)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'bg-[#C85A32] text-white'
                        : 'border border-[#E0D7CB] dark:border-[#38312B] text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Poster Image URL */}
          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Poster Image URL (optional)
            </label>
            <input
              type="url"
              value={posterUrl}
              onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
            />
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Personal Impressions & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cinematography thoughts, favorite quotes, or watch party notes..."
              className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C85A32]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E4DCDB] dark:border-[#352F2B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] text-xs font-medium hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#C85A32] text-white text-xs font-medium hover:bg-[#B34B25] transition-colors"
            >
              {initialItem ? 'Update Entry' : 'Save to Collection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
