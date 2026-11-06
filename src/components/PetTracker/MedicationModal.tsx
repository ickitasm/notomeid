/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Pill, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { PetMedication } from '../../types';
import { Language } from '../../lib/translations';

interface MedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<PetMedication, 'id'>) => void;
  petId: string;
  petName: string;
  initialMedication?: PetMedication | null;
  language?: Language;
}

export const MedicationModal: React.FC<MedicationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  petId,
  petName,
  initialMedication,
  language = 'id',
}) => {
  const isId = language === 'id';

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialMedication) {
      setName(initialMedication.name || '');
      setDosage(initialMedication.dosage || '');
      setFrequency(initialMedication.frequency || '');
      setStartDate(initialMedication.startDate || new Date().toISOString().slice(0, 10));
      setEndDate(initialMedication.endDate || '');
      setIsActive(initialMedication.isActive ?? true);
      setNotes(initialMedication.notes || '');
    } else {
      setName('');
      setDosage('1 unit');
      setFrequency('Daily');
      setStartDate(new Date().toISOString().slice(0, 10));
      setEndDate('');
      setIsActive(true);
      setNotes('');
    }
    setError(null);
  }, [initialMedication, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(isId ? 'Nama obat atau suplemen wajib diisi.' : 'Medication or supplement name is required.');
      return;
    }

    onSave({
      petId,
      name: name.trim(),
      dosage: dosage.trim() || '1 unit',
      frequency: frequency.trim() || 'Daily',
      startDate: startDate || new Date().toISOString().slice(0, 10),
      endDate: endDate || undefined,
      isActive,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const frequencyPresets = isId
    ? [
        { label: '1x Sehari', val: '1x sehari' },
        { label: '2x Sehari', val: '2x sehari' },
        { label: 'Bulanan', val: 'Bulanan (Monthly)' },
        { label: 'Jika Perlu', val: 'Sesuai kebutuhan' },
      ]
    : [
        { label: 'Once Daily', val: 'Once daily' },
        { label: 'Twice Daily', val: 'Twice daily' },
        { label: 'Monthly', val: 'Monthly' },
        { label: 'As Needed', val: 'As needed' },
      ];

  const dosagePresets = isId
    ? ['1 tablet', '1 tetes', '2 ml sirup', '1 kunyah']
    : ['1 chewable', '1 drop', '2 ml liquid', '1 tablet'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FAF7F2] dark:bg-[#1C1815] p-5 sm:p-6 text-[#2D2823] dark:text-[#EAE3DA] shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Mobile Grab Handle */}
        <div className="w-10 h-1 bg-[#D5CBC0] dark:bg-[#3D352F] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Dialog Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#E4DCDB] dark:border-[#352F2B]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#A86438]/15 text-[#A86438] flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold leading-tight">
                {initialMedication
                  ? isId
                    ? 'Edit Resep & Suplemen'
                    : 'Edit Medication / Supplement'
                  : isId
                  ? 'Catat Obat / Suplemen Baru'
                  : 'Add Medication / Supplement'}
              </h3>
              <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] mt-0.5 font-medium">
                {isId ? `Untuk ${petName}` : `For ${petName}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#8F8275] hover:text-[#2D2823] dark:hover:text-[#EAE3DA] hover:bg-[#EAE2D8] dark:hover:bg-[#28221D] transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Medication Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F645A] dark:text-[#A89C90] mb-1.5">
              {isId ? 'Nama Obat / Vitamin / Suplemen *' : 'Medication or Supplement Name *'}
            </label>
            <input
              type="text"
              required
              placeholder={isId ? 'cth: NexGard Spectra, Probiotik Kucing, Omega-3' : 'e.g. NexGard Spectra, Probiotics, Omega-3 Oil'}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-sm focus:outline-hidden focus:border-[#A86438] focus:ring-1 focus:ring-[#A86438] transition-all"
            />
          </div>

          {/* Dosage & Frequency Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Dosage */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F645A] dark:text-[#A89C90] mb-1.5">
                {isId ? 'Dosis *' : 'Dosage *'}
              </label>
              <input
                type="text"
                required
                placeholder={isId ? 'cth: 1 butir kunyah, 2 tetes' : 'e.g. 1 chewable, 2 drops'}
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-sm focus:outline-hidden focus:border-[#A86438] focus:ring-1 focus:ring-[#A86438] transition-all"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {dosagePresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDosage(preset)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#ECE4D8] dark:bg-[#2B241E] text-[#6F645A] dark:text-[#B3A698] hover:bg-[#A86438]/20 hover:text-[#A86438] transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F645A] dark:text-[#A89C90] mb-1.5">
                {isId ? 'Frekuensi Pemberian *' : 'Frequency *'}
              </label>
              <input
                type="text"
                required
                placeholder={isId ? 'cth: 1x sehari, Bulanan' : 'e.g. Daily morning, Monthly'}
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-sm focus:outline-hidden focus:border-[#A86438] focus:ring-1 focus:ring-[#A86438] transition-all"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {frequencyPresets.map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => setFrequency(preset.val)}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#ECE4D8] dark:bg-[#2B241E] text-[#6F645A] dark:text-[#B3A698] hover:bg-[#A86438]/20 hover:text-[#A86438] transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dates: Start Date & End Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F645A] dark:text-[#A89C90] mb-1.5">
                {isId ? 'Mulai Konsumsi' : 'Start Date'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-sm font-mono focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F645A] dark:text-[#A89C90] mb-1.5">
                {isId ? 'Selesai / Hingga (Opsional)' : 'End Date (Optional)'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-sm font-mono focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#221C18]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`w-4.5 h-4.5 ${isActive ? 'text-[#5B7A58]' : 'text-[#8F8275]'}`} />
              <div>
                <span className="text-xs sm:text-sm font-semibold">
                  {isId ? 'Status Rutinitas Aktif' : 'Active Medication Status'}
                </span>
                <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184]">
                  {isActive
                    ? isId
                      ? 'Saat ini masih rutin diberikan kepada hewan'
                      : 'Currently being actively administered'
                    : isId
                    ? 'Resep sudah selesai atau dihentikan sementara'
                    : 'Course completed or paused'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                isActive ? 'bg-[#5B7A58]' : 'bg-[#D5CBC0] dark:bg-[#3D352F]'
              }`}
              role="switch"
              aria-checked={isActive}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6F645A] dark:text-[#A89C90] mb-1.5">
              {isId ? 'Catatan Tambahan / Pantangan (Opsional)' : 'Special Instructions / Notes (Optional)'}
            </label>
            <textarea
              rows={2}
              placeholder={isId ? 'cth: Berikan sesudah makan pagi bersama potongan daging/camilan basah.' : 'e.g. Administer with wet food in the morning.'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-sm focus:outline-hidden focus:border-[#A86438] resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E4DCDB] dark:border-[#352F2B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#E0D7CB] dark:border-[#38312B] text-xs sm:text-sm font-semibold hover:bg-[#EAE2D8] dark:hover:bg-[#25201C] transition-colors cursor-pointer"
            >
              {isId ? 'Batal' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#A86438] hover:bg-[#92542B] text-white text-xs sm:text-sm font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {initialMedication
                ? isId
                  ? 'Simpan Perubahan'
                  : 'Update Prescription'
                : isId
                ? 'Simpan Resep'
                : 'Save Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
