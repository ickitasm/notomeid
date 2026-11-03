/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  HeartPulse,
  Plus,
  Syringe,
  Stethoscope,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  ShieldAlert,
  Pill,
  Scale,
  Phone,
} from 'lucide-react';
import { PetProfile, PetMedicalRecord, PetMedication, MedicalRecordType } from '../../types';
import { MiniCalendar, CalendarHighlight } from '../MiniCalendar';
import { PetModal } from './PetModal';
import { MedicalRecordModal } from './MedicalRecordModal';

interface PetViewProps {
  pets: PetProfile[];
  medicalRecords: PetMedicalRecord[];
  medications: PetMedication[];
  onAddPet: (pet: Omit<PetProfile, 'id'>) => PetProfile;
  onUpdatePet: (id: string, updates: Partial<PetProfile>) => void;
  onDeletePet: (id: string) => void;
  onAddMedicalRecord: (record: Omit<PetMedicalRecord, 'id'>) => PetMedicalRecord;
  onUpdateMedicalRecord: (id: string, updates: Partial<PetMedicalRecord>) => void;
  onDeleteMedicalRecord: (id: string) => void;
  onAddMedication: (med: Omit<PetMedication, 'id'>) => PetMedication;
  onUpdateMedication: (id: string, updates: Partial<PetMedication>) => void;
  onDeleteMedication: (id: string) => void;
}

export const PetView: React.FC<PetViewProps> = ({
  pets,
  medicalRecords,
  medications,
  onAddPet,
  onUpdatePet,
  onDeletePet,
  onAddMedicalRecord,
  onUpdateMedicalRecord,
  onDeleteMedicalRecord,
  onAddMedication,
  onUpdateMedication,
  onDeleteMedication,
}) => {
  const [activePetId, setActivePetId] = useState<string>(() => pets[0]?.id || '');
  const [selectedRecordType, setSelectedRecordType] = useState<MedicalRecordType | 'all'>('all');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(() => new Date().toISOString().slice(0, 10));

  // Modals
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PetMedicalRecord | null>(null);

  // Fallback to first pet if active was deleted
  const currentPet = useMemo(() => {
    return pets.find((p) => p.id === activePetId) || pets[0] || null;
  }, [pets, activePetId]);

  // Records for current pet
  const currentRecords = useMemo(() => {
    if (!currentPet) return [];
    return medicalRecords.filter((r) => r.petId === currentPet.id);
  }, [medicalRecords, currentPet]);

  // Meds for current pet
  const currentMeds = useMemo(() => {
    if (!currentPet) return [];
    return medications.filter((m) => m.petId === currentPet.id);
  }, [medications, currentPet]);

  // Calendar highlights: upcoming due dates and appointment days
  const calendarHighlights = useMemo(() => {
    const map: Record<string, CalendarHighlight> = {};
    currentRecords.forEach((r) => {
      if (r.nextDueDate) {
        map[r.nextDueDate] = {
          color: '#A86438',
          label: `Due: ${r.title}`,
        };
      }
      if (!r.completed && r.date) {
        map[r.date] = {
          color: '#D9822B',
          label: `Vet Appt: ${r.title}`,
        };
      }
    });
    return map;
  }, [currentRecords]);

  // Upcoming items across all records
  const upcomingAlerts = useMemo(() => {
    const today = new Date('2026-11-03');
    return currentRecords.filter((r) => {
      if (!r.completed) return true;
      if (r.nextDueDate) {
        const dueDate = new Date(r.nextDueDate);
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 45;
      }
      return false;
    });
  }, [currentRecords]);

  // Calculate age string
  const calculateAge = (birthDateStr: string) => {
    try {
      const birth = new Date(birthDateStr);
      const now = new Date('2026-11-03');
      let years = now.getFullYear() - birth.getFullYear();
      let months = now.getMonth() - birth.getMonth();
      if (months < 0) {
        years--;
        months += 12;
      }
      if (years <= 0) return `${months} months old`;
      return `${years} yrs ${months} mos`;
    } catch {
      return '';
    }
  };

  const filteredRecords = useMemo(() => {
    if (selectedRecordType === 'all') return currentRecords;
    return currentRecords.filter((r) => r.type === selectedRecordType);
  }, [currentRecords, selectedRecordType]);

  const handleEditRecord = (record: PetMedicalRecord) => {
    setEditingRecord(record);
    setIsRecordModalOpen(true);
  };

  const handleSaveRecord = (data: Omit<PetMedicalRecord, 'id'>) => {
    if (editingRecord) {
      onUpdateMedicalRecord(editingRecord.id, data);
    } else {
      onAddMedicalRecord(data);
    }
    setEditingRecord(null);
  };

  if (!currentPet) {
    return (
      <div className="p-12 text-center rounded-xl border border-dashed border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
        <HeartPulse className="w-8 h-8 mx-auto text-[#A86438] mb-2" />
        <h3 className="font-serif text-lg font-bold">No Pets Registered</h3>
        <p className="text-xs text-[#7B6F63] mt-1 max-w-sm mx-auto">
          Add your dog, cat, or other beloved companions to track vaccination boosters and medical records.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsEditingPet(false);
            setIsPetModalOpen(true);
          }}
          className="mt-4 px-4 py-2 rounded-lg bg-[#A86438] text-white text-xs font-medium hover:bg-[#92542B] transition-colors"
        >
          Register First Pet
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4DCDB] dark:border-[#352F2B]">
        <div>
          <div className="text-xs uppercase tracking-widest font-mono text-[#A86438] font-semibold mb-1">
            Veterinary & Care Ledger
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
            Pet Biography & Medic Records
          </h1>
          <p className="text-xs sm:text-sm text-[#7B6F63] dark:text-[#9F9184] mt-1 max-w-2xl">
            Keep lifelong immunization cards, veterinary clinical exams, prescriptions, and booster dates in one place.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              setIsEditingPet(false);
              setIsPetModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-xs font-medium hover:bg-[#F3ECE4] dark:hover:bg-[#25201C] transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Another Pet</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingRecord(null);
              setIsRecordModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#A86438] text-white text-xs font-medium hover:bg-[#92542B] transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Log Vet Record</span>
          </button>
        </div>
      </div>

      {/* Pet Switcher Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {pets.map((pet) => {
          const isActive = pet.id === currentPet.id;
          const speciesIcon = pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : pet.species === 'bird' ? '🦜' : '🐇';
          return (
            <button
              key={pet.id}
              type="button"
              onClick={() => setActivePetId(pet.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'border-[#A86438] bg-[#A86438]/10 text-[#A86438] font-semibold shadow-xs'
                  : 'border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] text-[#6F645A] dark:text-[#A89C90] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C]'
              }`}
            >
              <span>{speciesIcon}</span>
              <span>{pet.name}</span>
              <span className="text-[11px] text-[#8F8275]">· {pet.breed}</span>
            </button>
          );
        })}
      </div>

      {/* Pet Biography Showcase Card */}
      <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-5">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {/* Pet Avatar with styled fallback */}
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-[#E0D7CB] dark:border-[#38312B] bg-[#F7F2EB] dark:bg-[#25201C] flex items-center justify-center">
              {currentPet.avatarUrl ? (
                <img
                  src={currentPet.avatarUrl}
                  alt={currentPet.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">
                  {currentPet.species === 'dog' ? '🐕' : currentPet.species === 'cat' ? '🐈' : '🐾'}
                </span>
              )}
            </div>

            {/* Core Identity */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-2xl font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                  {currentPet.name}
                </h2>
                <span className="text-xs capitalize px-2 py-0.5 rounded-full border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FAF7F2] dark:bg-[#221C18] text-[#7B6F63]">
                  {currentPet.gender}
                </span>
              </div>

              {/* Unboxed metadata row */}
              <div className="flex items-center flex-wrap gap-2 text-xs text-[#7B6F63] dark:text-[#9F9184] mt-1 font-mono">
                <span>{currentPet.breed}</span>
                <span>·</span>
                <span>{calculateAge(currentPet.birthDate)}</span>
                <span>·</span>
                <span className="text-[#2B241E] dark:text-[#EFE9E2] font-semibold">
                  {currentPet.weightKg.toFixed(1)} kg
                </span>
                {currentPet.microchipId && (
                  <>
                    <span>·</span>
                    <span>Microchip #{currentPet.microchipId}</span>
                  </>
                )}
              </div>

              {/* Allergies & Diet Warning */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {currentPet.allergies.length > 0 ? (
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-md border border-amber-200 dark:border-amber-900/40">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Allergies: {currentPet.allergies.join(', ')}</span>
                  </div>
                ) : (
                  <span className="text-[#8F8275] text-[11px]">No known drug or food allergies</span>
                )}

                {currentPet.vetClinicName && (
                  <div className="flex items-center gap-1 text-[#7B6F63] text-xs">
                    <Stethoscope className="w-3.5 h-3.5 text-[#A86438]" />
                    <span>Primary Clinic: {currentPet.vetClinicName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Pet Management Actions */}
          <div className="flex items-center gap-2 self-end md:self-start">
            <button
              type="button"
              onClick={() => {
                setIsEditingPet(true);
                setIsPetModalOpen(true);
              }}
              className="p-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C] text-[#7B6F63] hover:text-[#2B241E] transition-colors"
              title="Edit profile & health parameters"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {pets.length > 1 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to remove ${currentPet.name}'s profile?`)) {
                    onDeletePet(currentPet.id);
                  }
                }}
                className="p-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[#7B6F63] hover:text-rose-600 transition-colors"
                title="Delete pet profile"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dietary note if present */}
        {currentPet.dietaryNotes && (
          <div className="mt-4 pt-3 border-t border-[#EAE2D8] dark:border-[#2E2823] text-xs text-[#6F645A] dark:text-[#A89C90] italic">
            Dietary & Care Note: "{currentPet.dietaryNotes}"
          </div>
        )}
      </div>

      {/* Upcoming Reminders Alert Bar */}
      {upcomingAlerts.length > 0 && (
        <div className="p-3.5 rounded-xl border border-[#D9822B]/40 bg-[#FAF4ED] dark:bg-[#251F19] text-xs space-y-2">
          <div className="flex items-center gap-2 font-serif font-bold text-[#D9822B]">
            <AlertTriangle className="w-4 h-4" />
            <span>Upcoming Veterinary & Vaccination Due Dates</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {upcomingAlerts.map((rec) => (
              <div
                key={rec.id}
                className="flex items-center justify-between p-2 rounded-lg bg-white/70 dark:bg-[#1C1815]/70 border border-[#EAE2D8] dark:border-[#38312B]"
              >
                <div>
                  <div className="font-medium text-[#2B241E] dark:text-[#EFE9E2]">{rec.title}</div>
                  <div className="text-[11px] font-mono text-[#7B6F63]">
                    Due Date: {rec.nextDueDate || rec.date}
                  </div>
                </div>
                {!rec.completed && (
                  <button
                    type="button"
                    onClick={() => onUpdateMedicalRecord(rec.id, { completed: true })}
                    className="px-2 py-1 rounded bg-[#5B7A58] text-white text-[11px] font-medium hover:bg-[#4D674A] transition-colors"
                  >
                    Mark Done
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Records & Side Embedded Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Main Column: Medical Records & Medications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Medical History Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-[#E4DCDB] dark:border-[#352F2B]">
              <h3 className="font-serif text-lg font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                Medical Timeline ({currentRecords.length})
              </h3>

              {/* Record type filter tabs */}
              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                {(['all', 'vaccine', 'checkup', 'deworming', 'medication'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedRecordType(t)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors whitespace-nowrap ${
                      selectedRecordType === t
                        ? 'bg-[#A86438] text-white font-semibold'
                        : 'border border-[#E0D7CB] dark:border-[#38312B] text-[#6F645A] dark:text-[#A89C90] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]'
                    }`}
                  >
                    {t === 'all' ? 'All Records' : t}
                  </button>
                ))}
              </div>
            </div>

            {filteredRecords.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] text-xs text-[#7B6F63]">
                No records recorded under this category.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRecords.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] space-y-2 hover:border-[#A86438]/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase font-mono tracking-wider text-[#A86438] font-semibold">
                            {record.type}
                          </span>
                          <span className="text-xs text-[#8F8275]">·</span>
                          <span className="text-xs font-mono tabular-nums text-[#7B6F63]">
                            {record.date}
                          </span>
                          {record.completed ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#5B7A58] font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#D9822B] font-medium">
                              <Clock className="w-3.5 h-3.5" /> Scheduled
                            </span>
                          )}
                        </div>

                        <h4 className="font-serif text-base font-bold text-[#2B241E] dark:text-[#EFE9E2] mt-1">
                          {record.title}
                        </h4>
                      </div>

                      {/* Record Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleEditRecord(record)}
                          className="p-1 rounded hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] text-[#7B6F63] transition-colors"
                          title="Edit record"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteMedicalRecord(record.id)}
                          className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30 text-[#7B6F63] hover:text-rose-600 transition-colors"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata strip */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6F645A] dark:text-[#A89C90]">
                      {record.clinicName && (
                        <span>Clinic: <strong>{record.clinicName}</strong></span>
                      )}
                      {record.veterinarian && (
                        <span>Doctor: <strong>{record.veterinarian}</strong></span>
                      )}
                      {record.cost !== undefined && (
                        <span className="font-mono">Cost: <strong>${record.cost.toFixed(2)}</strong></span>
                      )}
                    </div>

                    {/* Next Due Date Booster Banner */}
                    {record.nextDueDate && (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-[#A86438] bg-[#F7F2EB] dark:bg-[#25201C] px-2.5 py-1 rounded-md">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>Next Booster / Due Date: <strong>{record.nextDueDate}</strong></span>
                      </div>
                    )}

                    {record.notes && (
                      <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] italic pt-1">
                        "{record.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Medications & Preventive Chews */}
          <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8] dark:border-[#2E2823]">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#A86438]" />
                <h3 className="font-serif text-base font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                  Prescriptions & Supplements ({currentMeds.length})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  const name = prompt('Medication name (e.g. NexGard Spectra, Probiotics):');
                  if (!name) return;
                  const dosage = prompt('Dosage (e.g. 1 chewable, 2 drops):', '1 unit') || '1 unit';
                  const frequency = prompt('Frequency (e.g. Monthly, Daily morning):', 'Daily') || 'Daily';
                  onAddMedication({
                    petId: currentPet.id,
                    name,
                    dosage,
                    frequency,
                    startDate: new Date().toISOString().slice(0, 10),
                    isActive: true,
                  });
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] text-xs font-medium hover:bg-[#F3ECE4] dark:hover:bg-[#25201C] transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Medication</span>
              </button>
            </div>

            {currentMeds.length === 0 ? (
              <div className="py-4 text-xs text-[#8F8275] italic text-center">
                No active medications or supplements logged for {currentPet.name}.
              </div>
            ) : (
              <div className="divide-y divide-[#EAE2D8] dark:divide-[#2E2823] mt-2">
                {currentMeds.map((med) => (
                  <div key={med.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#2B241E] dark:text-[#EFE9E2]">
                          {med.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${med.isActive ? 'bg-[#5B7A58]/15 text-[#5B7A58]' : 'bg-[#E0D7CB] text-[#7B6F63]'}`}>
                          {med.isActive ? 'Active' : 'Completed'}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#7B6F63] font-mono mt-0.5">
                        {med.dosage} · {med.frequency}
                      </div>
                      {med.notes && (
                        <div className="text-[11px] text-[#8F8275] italic mt-0.5">{med.notes}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateMedication(med.id, { isActive: !med.isActive })}
                        className="px-2 py-1 rounded text-[11px] border border-[#E0D7CB] dark:border-[#38312B] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C] transition-colors"
                      >
                        {med.isActive ? 'Pause' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteMedication(med.id)}
                        className="p-1 text-[#8F8275] hover:text-rose-600"
                        title="Remove medication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Embedded Pet Care Mini-Calendar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4">
            <div className="mb-3">
              <h3 className="font-serif text-sm font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                Pet Care & Vet Schedule
              </h3>
              <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184]">
                Mini-calendar highlighting vaccine boosters & checkups
              </p>
            </div>

            <MiniCalendar
              selectedDate={selectedCalendarDate}
              onSelectDate={setSelectedCalendarDate}
              highlights={calendarHighlights}
              variant="pet"
              className="border-0 p-0 bg-transparent"
            />

            {/* Selected Date Context in Pet Care */}
            <div className="mt-4 pt-3 border-t border-[#E4DCDB] dark:border-[#352F2B]">
              <div className="text-xs font-serif font-semibold text-[#2B241E] dark:text-[#EFE9E2] mb-1.5">
                Care Items on {selectedCalendarDate}
              </div>

              {(() => {
                const dayRecords = currentRecords.filter(
                  (r) => r.nextDueDate === selectedCalendarDate || (!r.completed && r.date === selectedCalendarDate)
                );

                if (dayRecords.length === 0) {
                  return (
                    <div className="text-[11px] text-[#7B6F63] italic py-1">
                      No medical appointments or booster deadlines on this date.
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    {dayRecords.map((r) => (
                      <div
                        key={r.id}
                        className="p-2.5 rounded-lg bg-[#FAF7F2] dark:bg-[#25201C] border border-[#E9E1D6] dark:border-[#38302A] text-xs"
                      >
                        <div className="font-semibold text-[#A86438]">{r.title}</div>
                        <div className="text-[11px] text-[#7B6F63]">
                          {r.nextDueDate === selectedCalendarDate ? 'Booster Due Date' : 'Scheduled Vet Exam'}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Quick Pet Health Tip Card */}
          <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#F7F2EB] dark:bg-[#221C18] p-4 text-xs text-[#594E44] dark:text-[#C5B8AA] space-y-1.5">
            <div className="font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2]">
              Preventive Health Tip
            </div>
            <p className="leading-relaxed text-[11px]">
              Annual booster titers and monthly heartworm prophylaxis keep your pet protected while minimizing medication over-exposure. Check with your vet annually for dental scaling.
            </p>
          </div>
        </div>
      </div>

      {/* Pet Registration / Edit Modal */}
      <PetModal
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
        onSave={(data) => {
          if (isEditingPet && currentPet) {
            onUpdatePet(currentPet.id, data);
          } else {
            const newPet = onAddPet(data);
            setActivePetId(newPet.id);
          }
        }}
        initialPet={isEditingPet ? currentPet : null}
      />

      {/* Medical Record Modal */}
      <MedicalRecordModal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSaveRecord}
        petId={currentPet.id}
        petName={currentPet.name}
        initialRecord={editingRecord}
      />
    </div>
  );
};
