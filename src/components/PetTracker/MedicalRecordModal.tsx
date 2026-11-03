/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Syringe, Stethoscope, Pill, Scissors } from 'lucide-react';
import { PetMedicalRecord, MedicalRecordType } from '../../types';

interface MedicalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<PetMedicalRecord, 'id'>) => void;
  petId: string;
  petName: string;
  initialRecord?: PetMedicalRecord | null;
}

const RECORD_TYPES: { type: MedicalRecordType; label: string; icon: string }[] = [
  { type: 'vaccine', label: 'Vaccination', icon: '💉' },
  { type: 'checkup', label: 'Vet Checkup', icon: '🩺' },
  { type: 'deworming', label: 'Deworming & Parasite', icon: '🛡️' },
  { type: 'medication', label: 'Prescription', icon: '💊' },
  { type: 'surgery', label: 'Procedure / Surgery', icon: '✂️' },
  { type: 'lab', label: 'Lab Bloodwork', icon: '🔬' },
];

export const MedicalRecordModal: React.FC<MedicalRecordModalProps> = ({
  isOpen,
  onClose,
  onSave,
  petId,
  petName,
  initialRecord,
}) => {
  const [type, setType] = useState<MedicalRecordType>(initialRecord?.type || 'vaccine');
  const [title, setTitle] = useState(initialRecord?.title || '');
  const [date, setDate] = useState(initialRecord?.date || new Date().toISOString().slice(0, 10));
  const [nextDueDate, setNextDueDate] = useState(initialRecord?.nextDueDate || '');
  const [clinicName, setClinicName] = useState(initialRecord?.clinicName || 'Harmony Animal Hospital');
  const [veterinarian, setVeterinarian] = useState(initialRecord?.veterinarian || '');
  const [cost, setCost] = useState<number | undefined>(initialRecord?.cost);
  const [completed, setCompleted] = useState<boolean>(initialRecord ? initialRecord.completed : true);
  const [notes, setNotes] = useState(initialRecord?.notes || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      petId,
      type,
      title: title.trim(),
      date,
      nextDueDate: nextDueDate || undefined,
      clinicName: clinicName.trim() || undefined,
      veterinarian: veterinarian.trim() || undefined,
      cost: cost ? Number(cost) : undefined,
      completed,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FAF7F2] dark:bg-[#1C1815] p-5 sm:p-6 text-[#2D2823] dark:text-[#EAE3DA] shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Mobile Grab Handle */}
        <div className="w-10 h-1 bg-[#D5CBC0] dark:bg-[#3D352F] rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-[#E4DCDB] dark:border-[#352F2B]">
          <div>
            <h3 className="font-serif text-lg font-bold">
              {initialRecord ? 'Edit Medical Record' : `Log Health Event for ${petName}`}
            </h3>
            <p className="text-xs text-[#7B6F63] dark:text-[#9F9184]">
              Track vaccinations, veterinary exams, and recurring booster schedules.
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
          {/* Record Category */}
          <div>
            <label className="block font-medium mb-1.5 text-[#594E44] dark:text-[#C5B8AA]">
              Record Category
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {RECORD_TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setType(t.type)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    type === t.type
                      ? 'border-[#A86438] bg-[#A86438]/10 text-[#A86438] font-semibold'
                      : 'border-[#E4DCDB] dark:border-[#352F2B] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span className="truncate">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Treatment / Vaccine Name <span className="text-[#C85A32]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rabies 3-Year Booster, Core FVRCP, Dental Scale & Polish"
              className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-sm focus:outline-hidden focus:border-[#A86438]"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Date Administered
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono text-xs focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Next Due Date (Booster)
              </label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono text-xs focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
          </div>

          {/* Clinic & Veterinarian */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Clinic / Animal Hospital
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                placeholder="e.g. Harmony Animal Hospital"
                className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Veterinarian / Doctor Name
              </label>
              <input
                type="text"
                value={veterinarian}
                onChange={(e) => setVeterinarian(e.target.value)}
                placeholder="Dr. Sarah Jenkins, DVM"
                className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
          </div>

          {/* Cost & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={cost !== undefined ? cost : ''}
                onChange={(e) => setCost(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="e.g. 75.00"
                className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-xs focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Record Status
              </label>
              <div className="flex gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => setCompleted(true)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    completed
                      ? 'border-[#5B7A58] bg-[#5B7A58]/10 text-[#5B7A58] font-semibold'
                      : 'border-[#E0D7CB] dark:border-[#38312B] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]'
                  }`}
                >
                  Completed
                </button>
                <button
                  type="button"
                  onClick={() => setCompleted(false)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    !completed
                      ? 'border-[#D9822B] bg-[#D9822B]/10 text-[#D9822B] font-semibold'
                      : 'border-[#E0D7CB] dark:border-[#38312B] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]'
                  }`}
                >
                  Upcoming Due
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Clinical Observations & Prescription Details
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Dosage instructions, weight at checkup, doctor's advice..."
              className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#A86438]"
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
              className="px-5 py-2 rounded-lg bg-[#A86438] text-white text-xs font-medium hover:bg-[#92542B] transition-colors"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
