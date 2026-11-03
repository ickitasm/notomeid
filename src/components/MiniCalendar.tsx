/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export interface CalendarHighlight {
  color: string; // Tailwind color class or hex like '#C85A32'
  label?: string;
  count?: number;
  type?: 'dot' | 'badge';
}

interface MiniCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  highlights?: Record<string, CalendarHighlight>;
  title?: string;
  variant?: 'media' | 'nutrition' | 'pet' | 'default';
  className?: string;
}

export const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  onSelectDate,
  highlights = {},
  title = 'Calendar',
  variant = 'default',
  className = '',
}) => {
  const [currentYear, setCurrentYear] = useState(() => {
    const parts = selectedDate.split('-');
    return parseInt(parts[0], 10) || 2026;
  });

  const [currentMonth, setCurrentMonth] = useState(() => {
    const parts = selectedDate.split('-');
    return parseInt(parts[1], 10) - 1 || 10; // 0-indexed
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

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

  const handleGoToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const d = String(today.getDate()).padStart(2, '0');
    setCurrentYear(y);
    setCurrentMonth(m);
    onSelectDate(`${y}-${String(m + 1).padStart(2, '0')}-${d}`);
  };

  // Generate days in month
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const days: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Previous month padding
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

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const m = currentMonth + 1;
    days.push({
      day: d,
      dateStr: `${currentYear}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      isCurrentMonth: true,
    });
  }

  // Next month padding to fill out 35 or 42 grid cells
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

  const todayStr = new Date().toISOString().slice(0, 10);

  // Variant themes
  const accentColors = {
    media: 'border-[#C85A32] text-[#C85A32]',
    nutrition: 'border-[#5B7A58] text-[#5B7A58]',
    pet: 'border-[#A86438] text-[#A86438]',
    default: 'border-[#8C6D4F] text-[#8C6D4F]',
  };

  const selectedBgColors = {
    media: 'bg-[#C85A32] text-white',
    nutrition: 'bg-[#5B7A58] text-white',
    pet: 'bg-[#A86438] text-white',
    default: 'bg-[#8C6D4F] text-white',
  };

  return (
    <div className={`rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4 text-[#2D2823] dark:text-[#EAE3DA] ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-[#8C6D4F] dark:text-[#B59C82]" />
          <span className="font-serif text-sm font-semibold tracking-wide">
            {monthNames[currentMonth]} {currentYear}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleGoToday}
            className="text-[11px] font-medium px-2 py-1 rounded border border-[#E4DCDB] dark:border-[#352F2B] hover:bg-[#F4ECE4] dark:hover:bg-[#2A2420] transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            className="p-1 rounded hover:bg-[#F4ECE4] dark:hover:bg-[#2A2420] transition-colors text-[#6F645A] dark:text-[#A89C90]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next month"
            className="p-1 rounded hover:bg-[#F4ECE4] dark:hover:bg-[#2A2420] transition-colors text-[#6F645A] dark:text-[#A89C90]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day of Week headers */}
      <div className="grid grid-cols-7 text-center mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-[11px] font-medium text-[#8F8275] dark:text-[#8E8074] py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {days.map((item) => {
          const isSelected = item.dateStr === selectedDate;
          const isToday = item.dateStr === todayStr;
          const highlight = highlights[item.dateStr];

          return (
            <button
              key={item.dateStr}
              type="button"
              onClick={() => onSelectDate(item.dateStr)}
              className={`relative flex flex-col items-center justify-center h-8 rounded-lg text-xs font-mono tabular-nums transition-all ${
                isSelected
                  ? `${selectedBgColors[variant]} font-semibold shadow-xs`
                  : item.isCurrentMonth
                  ? 'text-[#2D2823] dark:text-[#EAE3DA] hover:bg-[#F4ECE4] dark:hover:bg-[#2A2420]'
                  : 'text-[#BBB0A3] dark:text-[#5A5149] hover:bg-[#F4ECE4] dark:hover:bg-[#2A2420]'
              } ${isToday && !isSelected ? 'ring-1 ring-[#8C6D4F] dark:ring-[#B59C82] font-semibold' : ''}`}
            >
              <span>{item.day}</span>
              {/* Highlight indicator */}
              {highlight && (
                <span
                  style={{ backgroundColor: highlight.color }}
                  className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'ring-1 ring-white' : ''
                  }`}
                  title={highlight.label}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
