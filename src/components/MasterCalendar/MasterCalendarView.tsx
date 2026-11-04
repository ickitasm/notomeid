/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Film,
  Utensils,
  HeartPulse,
  Tag,
  Clock,
  Trash2,
} from 'lucide-react';
import {
  CalendarEvent,
  MediaItem,
  DailyNutritionLog,
  PetMedicalRecord,
  PetProfile,
  EventCategory,
} from '../../types';
import { EventModal } from './EventModal';
import { ConfirmDeleteModal } from '../Common/ConfirmDeleteModal';
import { translations, Language } from '../../lib/translations';

interface MasterCalendarViewProps {
  customEvents: CalendarEvent[];
  mediaItems: MediaItem[];
  nutritionLogs: DailyNutritionLog[];
  medicalRecords: PetMedicalRecord[];
  pets: PetProfile[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  language?: Language;
}

export const MasterCalendarView: React.FC<MasterCalendarViewProps> = ({
  customEvents,
  mediaItems,
  nutritionLogs,
  medicalRecords,
  pets,
  onAddEvent,
  onDeleteEvent,
  language = 'id',
}) => {
  const t = translations[language].calendar;
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);

  // Month navigation state
  const [currentYear, setCurrentYear] = useState(() => {
    return parseInt(selectedDate.split('-')[0], 10) || 2026;
  });
  const [currentMonth, setCurrentMonth] = useState(() => {
    return parseInt(selectedDate.split('-')[1], 10) - 1 || 10;
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Synthesize all events into a unified list
  const allEvents = useMemo(() => {
    const list: CalendarEvent[] = [...customEvents];

    // Media events
    mediaItems.forEach((m) => {
      if (m.scheduledWatchDate) {
        list.push({
          id: `media-watch-${m.id}`,
          title: `Watch: ${m.title}`,
          date: m.scheduledWatchDate,
          category: 'media',
          description: m.type === 'series' && m.seriesDetails
            ? `Season ${m.seriesDetails.currentSeason} Episode ${m.seriesDetails.currentEpisode}`
            : 'Movie session',
          relatedId: m.id,
        });
      }
      if (m.releaseDate && m.releaseDate !== m.scheduledWatchDate) {
        list.push({
          id: `media-rel-${m.id}`,
          title: `Premiere: ${m.title}`,
          date: m.releaseDate,
          category: 'media',
          description: `Release date for ${m.title}`,
          relatedId: m.id,
        });
      }
    });

    // Nutrition events (weigh-ins and high-intake milestones)
    nutritionLogs.forEach((log) => {
      if (log.weightKg) {
        list.push({
          id: `nutr-wt-${log.date}`,
          title: `Weigh-in: ${log.weightKg.toFixed(1)} kg`,
          date: log.date,
          category: 'nutrition',
          description: `${log.caloriesConsumed} kcal consumed · ${log.sugarGrams}g sugar`,
        });
      }
    });

    // Pet health events
    medicalRecords.forEach((r) => {
      const pet = pets.find((p) => p.id === r.petId);
      const petName = pet ? pet.name : 'Pet';

      if (r.nextDueDate) {
        list.push({
          id: `pet-due-${r.id}`,
          title: `${petName}: ${r.title} (Booster Due)`,
          date: r.nextDueDate,
          category: 'pet',
          description: r.clinicName ? `At ${r.clinicName}` : undefined,
          relatedId: r.id,
        });
      }
      if (!r.completed && r.date) {
        list.push({
          id: `pet-appt-${r.id}`,
          title: `${petName}: ${r.title} (Vet Visit)`,
          date: r.date,
          category: 'pet',
          description: r.clinicName ? `At ${r.clinicName}` : undefined,
          relatedId: r.id,
        });
      }
    });

    // Sort by date then time
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [customEvents, mediaItems, nutritionLogs, medicalRecords, pets]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    if (selectedCategory === 'all') return allEvents;
    return allEvents.filter((e) => e.category === selectedCategory);
  }, [allEvents, selectedCategory]);

  // Group events by date for month grid
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [filteredEvents]);

  // Selected date events
  const selectedDateEvents = useMemo(() => {
    return allEvents.filter((e) => e.date === selectedDate);
  }, [allEvents, selectedDate]);

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Days calculation
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = currentMonth === 0 ? 12 : currentMonth;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    days.push({
      day: d,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const m = currentMonth + 1;
    days.push({
      day: d,
      dateStr: `${currentYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isCurrentMonth: true,
    });
  }

  const remainingCells = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const m = currentMonth === 11 ? 1 : currentMonth + 2;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    days.push({
      day: d,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isCurrentMonth: false,
    });
  }

  const categoryColor = (cat: EventCategory) => {
    switch (cat) {
      case 'media':
        return { dot: '#C85A32', text: 'text-[#C85A32]', bg: 'bg-[#C85A32]/10', label: 'Cinema' };
      case 'nutrition':
        return { dot: '#5B7A58', text: 'text-[#5B7A58]', bg: 'bg-[#5B7A58]/10', label: 'Nutrition' };
      case 'pet':
        return { dot: '#A86438', text: 'text-[#A86438]', bg: 'bg-[#A86438]/10', label: 'Pet Care' };
      default:
        return { dot: '#C4933F', text: 'text-[#C4933F]', bg: 'bg-[#C4933F]/10', label: 'Personal' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4DCDB] dark:border-[#352F2B]">
        <div>
          <div className="text-xs uppercase tracking-widest font-mono text-[#C4933F] font-semibold mb-1">
            {t.tag}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
            {t.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#7B6F63] dark:text-[#9F9184] mt-1 max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#C4933F] text-white text-xs sm:text-sm font-medium hover:bg-[#AE7F30] transition-colors shadow-xs whitespace-nowrap self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addEventBtn}</span>
        </button>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
        {/* Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          {[
            { id: 'all', label: t.allEvents },
            { id: 'media', label: t.mediaCategory, color: '#C85A32' },
            { id: 'nutrition', label: t.nutritionCategory, color: '#5B7A58' },
            { id: 'pet', label: t.petCategory, color: '#A86438' },
            { id: 'personal', label: t.personalCategory, color: '#C4933F' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id as EventCategory | 'all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#EFE8DD] dark:bg-[#28221D] text-[#2B241E] dark:text-[#EFE9E2] font-semibold shadow-xs'
                  : 'text-[#6F645A] dark:text-[#A89C90] hover:text-[#2B241E] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C]'
              }`}
            >
              {cat.color && (
                <span
                  className="inline-block w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: cat.color }}
                />
              )}
              {cat.label}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-[#F4ECE3] dark:bg-[#25201C] rounded-lg self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'month'
                ? 'bg-white dark:bg-[#161311] text-[#2B241E] dark:text-[#EFE9E2] shadow-xs font-semibold'
                : 'text-[#6F645A] dark:text-[#A89C90]'
            }`}
          >
            {t.monthGrid}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'agenda'
                ? 'bg-white dark:bg-[#161311] text-[#2B241E] dark:text-[#EFE9E2] shadow-xs font-semibold'
                : 'text-[#6F645A] dark:text-[#A89C90]'
            }`}
          >
            {t.agendaTimeline}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'month' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* 3-Column Month Calendar Grid */}
          <div className="lg:col-span-3 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-5">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#C4933F]" />
                <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setCurrentYear(today.getFullYear());
                    setCurrentMonth(today.getMonth());
                    setSelectedDate(today.toISOString().slice(0, 10));
                  }}
                  className="px-2.5 py-1 text-xs font-medium rounded-md border border-[#E0D7CB] dark:border-[#38312B] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C] transition-colors"
                >
                  Current Month
                </button>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="p-1 rounded-md hover:bg-[#F3ECE4] dark:hover:bg-[#25201C] text-[#6F645A] dark:text-[#A89C90]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="p-1 rounded-md hover:bg-[#F3ECE4] dark:hover:bg-[#25201C] text-[#6F645A] dark:text-[#A89C90]"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Days of Week header */}
            <div className="grid grid-cols-7 text-center mb-2 font-mono text-xs text-[#8F8275]">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => (
                <div key={d} className="py-1">
                  <span className="hidden sm:inline">{d}</span>
                  <span className="sm:hidden">{d.slice(0, 2)}</span>
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {days.map((item) => {
                const dayEvents = eventsByDate[item.dateStr] || [];
                const isSelected = item.dateStr === selectedDate;
                const isToday = item.dateStr === new Date().toISOString().slice(0, 10);

                return (
                  <div
                    key={item.dateStr}
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#C4933F] bg-[#FAF3E8] dark:bg-[#2A2318] shadow-xs'
                        : item.isCurrentMonth
                        ? 'border-[#EAE2D8] dark:border-[#2D2621] bg-white/60 dark:bg-[#161311]/60 hover:border-[#C4933F]/40'
                        : 'border-transparent bg-transparent opacity-40 hover:opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono tabular-nums ${
                          isToday
                            ? 'w-5 h-5 rounded-full bg-[#C4933F] text-white flex items-center justify-center font-bold'
                            : 'font-medium text-[#2B241E] dark:text-[#EFE9E2]'
                        }`}
                      >
                        {item.day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] font-mono font-medium text-[#7B6F63]">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    {/* Events items strip inside cell */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const style = categoryColor(ev.category);
                        return (
                          <div
                            key={ev.id}
                            className="text-[10px] truncate px-1 py-0.5 rounded leading-tight font-medium"
                            style={{ backgroundColor: `${style.dot}20`, color: style.dot }}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-[#8F8275] font-mono">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Date Event Details */}
          <div className="space-y-4">
            <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8] dark:border-[#2E2823]">
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                    Events on {selectedDate}
                  </h3>
                  <p className="text-[11px] text-[#7B6F63] font-mono">
                    {selectedDateEvents.length} scheduled items
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="p-1 rounded hover:bg-[#F3ECE4] dark:hover:bg-[#25201C] text-[#C4933F]"
                  title="Add event for this date"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {selectedDateEvents.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8F8275] italic">
                  No appointments, watch parties, or records scheduled on this day.
                </div>
              ) : (
                <div className="divide-y divide-[#EAE2D8] dark:divide-[#2E2823] mt-2">
                  {selectedDateEvents.map((ev) => {
                    const style = categoryColor(ev.category);
                    const isCustom = ev.id.startsWith('evt-');

                    return (
                      <div key={ev.id} className="py-3 text-xs space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className="text-[10px] font-mono uppercase tracking-wider font-semibold"
                            style={{ color: style.dot }}
                          >
                            {style.label}
                          </span>
                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => setEventToDelete(ev)}
                              className="text-[#8F8275] hover:text-rose-600 p-0.5"
                              title="Delete event"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div className="font-medium text-[#2B241E] dark:text-[#EFE9E2]">
                          {ev.title}
                        </div>

                        {ev.description && (
                          <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184]">
                            {ev.description}
                          </p>
                        )}

                        {ev.time && (
                          <div className="flex items-center gap-1 text-[11px] text-[#8F8275] font-mono">
                            <Clock className="w-3 h-3" />
                            <span>{ev.time}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Color Legend Card */}
            <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4 text-xs space-y-2">
              <div className="font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2] mb-1">
                Category Legend
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]" />
                <span className="text-[#6F645A] dark:text-[#A89C90]">Cinema & Episode Watch Dates</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5B7A58]" />
                <span className="text-[#6F645A] dark:text-[#A89C90]">Nutrition Logs & Weigh-ins</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A86438]" />
                <span className="text-[#6F645A] dark:text-[#A89C90]">Pet Boosters & Vet Exams</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C4933F]" />
                <span className="text-[#6F645A] dark:text-[#A89C90]">Personal Life Schedule</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Agenda View */
        <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-6 max-w-3xl mx-auto space-y-4">
          <h2 className="font-serif text-lg font-bold text-[#2B241E] dark:text-[#EFE9E2]">
            Upcoming Life Agenda
          </h2>

          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7B6F63] italic">
              No events found for this filter category.
            </div>
          ) : (
            <div className="divide-y divide-[#EAE2D8] dark:divide-[#2E2823]">
              {filteredEvents.map((ev) => {
                const style = categoryColor(ev.category);
                const isCustom = ev.id.startsWith('evt-');

                return (
                  <div key={ev.id} className="py-3.5 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-mono uppercase tracking-wider font-semibold"
                          style={{ color: style.dot }}
                        >
                          {style.label}
                        </span>
                        <span className="text-xs text-[#8F8275]">·</span>
                        <span className="font-mono tabular-nums text-xs text-[#7B6F63] font-semibold">
                          {ev.date}
                        </span>
                        {ev.time && (
                          <span className="font-mono text-xs text-[#8F8275]">at {ev.time}</span>
                        )}
                      </div>

                      <div className="font-serif text-base font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                        {ev.title}
                      </div>

                      {ev.description && (
                        <p className="text-xs text-[#7B6F63] dark:text-[#9F9184]">
                          {ev.description}
                        </p>
                      )}
                    </div>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => setEventToDelete(ev)}
                        className="p-1.5 rounded hover:bg-rose-50 text-[#8F8275] hover:text-rose-600 transition-colors"
                        title="Delete custom event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Custom Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAddEvent}
        initialDate={selectedDate}
      />

      {/* Delete Calendar Event Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(eventToDelete)}
        onClose={() => setEventToDelete(null)}
        onConfirm={() => {
          if (eventToDelete) {
            onDeleteEvent(eventToDelete.id);
            setEventToDelete(null);
          }
        }}
        title={language === 'id' ? 'Hapus Agenda Kalender?' : 'Delete Calendar Event?'}
        itemName={eventToDelete?.title}
        description={
          language === 'id'
            ? 'Agenda pribadi ini akan dihapus dari jadwal kalender Anda.'
            : 'This personal event will be removed from your calendar schedule.'
        }
        confirmText={language === 'id' ? 'Hapus Agenda' : 'Delete Event'}
        cancelText={language === 'id' ? 'Batal' : 'Cancel'}
      />
    </div>
  );
};
