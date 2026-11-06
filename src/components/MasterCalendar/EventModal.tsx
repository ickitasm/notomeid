/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { CalendarEvent, EventCategory } from '../../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  initialDate?: string;
  initialEvent?: CalendarEvent | null;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialDate,
  initialEvent,
}) => {
  const [title, setTitle] = useState(initialEvent?.title || '');
  const [date, setDate] = useState(initialEvent?.date || initialDate || new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(initialEvent?.time || '19:00');
  const [category, setCategory] = useState<EventCategory>(initialEvent?.category || 'personal');
  const [description, setDescription] = useState(initialEvent?.description || '');

  // Synchronize state when initialEvent, initialDate, or isOpen changes
  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title || '');
      setDate(initialEvent.date || initialDate || new Date().toISOString().slice(0, 10));
      setTime(initialEvent.time || '19:00');
      setCategory(initialEvent.category || 'personal');
      setDescription(initialEvent.description || '');
    } else {
      setTitle('');
      setDate(initialDate || new Date().toISOString().slice(0, 10));
      setTime('19:00');
      setCategory('personal');
      setDescription('');
    }
  }, [initialEvent, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      date,
      time: time || undefined,
      category,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FAF7F2] dark:bg-[#1C1815] p-5 sm:p-6 text-[#2D2823] dark:text-[#EAE3DA] shadow-2xl max-h-[92vh] sm:max-h-[85vh] overflow-y-auto">
        {/* Mobile Grab Handle */}
        <div className="w-10 h-1 bg-[#D5CBC0] dark:bg-[#3D352F] rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-[#E4DCDB] dark:border-[#352F2B]">
          <div>
            <h3 className="font-serif text-lg font-bold">
              {initialEvent ? 'Edit Calendar Event' : 'Add Calendar Event'}
            </h3>
            <p className="text-xs text-[#7B6F63] dark:text-[#9F9184]">
              Schedule a personal reminder, watch session, or vet reminder.
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Event Title <span className="text-[#C85A32]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sunday Meal Prep, Weekend Movie Night"
              className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-sm focus:outline-hidden focus:border-[#C4933F]"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'personal', label: 'Personal & Habits', color: '#C4933F' },
                { id: 'media', label: 'Cinema / Watch Night', color: '#C85A32' },
                { id: 'pet', label: 'Pet Care / Vet', color: '#A86438' },
                { id: 'nutrition', label: 'Nutrition / Weigh-in', color: '#5B7A58' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id as EventCategory)}
                  className={`py-1.5 px-2.5 rounded-lg border text-xs font-medium text-left transition-colors ${
                    category === c.id
                      ? 'border-[#C4933F] bg-[#C4933F]/10 text-[#C4933F] font-semibold'
                      : 'border-[#E0D7CB] dark:border-[#38312B] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]'
                  }`}
                >
                  <span
                    className="inline-block w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: c.color }}
                  />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono text-xs focus:outline-hidden focus:border-[#C4933F]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono text-xs focus:outline-hidden focus:border-[#C4933F]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Notes / Description (optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event details, location, or notes..."
              className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#C4933F]"
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
              className="px-5 py-2 rounded-lg bg-[#C4933F] text-white text-xs font-medium hover:bg-[#AE7F30] transition-colors"
            >
              {initialEvent ? 'Save Changes' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
