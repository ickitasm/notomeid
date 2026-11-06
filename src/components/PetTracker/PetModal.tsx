/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, HeartPulse } from 'lucide-react';
import { PetProfile, PetSpecies, PetGender } from '../../types';

interface PetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pet: Omit<PetProfile, 'id'>) => void;
  initialPet?: PetProfile | null;
}

export const PetModal: React.FC<PetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPet,
}) => {
  const [name, setName] = useState(initialPet?.name || '');
  const [species, setSpecies] = useState<PetSpecies>(initialPet?.species || 'dog');
  const [breed, setBreed] = useState(initialPet?.breed || '');
  const [birthDate, setBirthDate] = useState(initialPet?.birthDate || '2023-01-01');
  const [gender, setGender] = useState<PetGender>(initialPet?.gender || 'male');
  const [weightKg, setWeightKg] = useState<number>(initialPet?.weightKg ?? 12);
  const [microchipId, setMicrochipId] = useState(initialPet?.microchipId || '');
  const [avatarUrl, setAvatarUrl] = useState(initialPet?.avatarUrl || '');
  const [allergiesInput, setAllergiesInput] = useState(initialPet?.allergies?.join(', ') || '');
  const [dietaryNotes, setDietaryNotes] = useState(initialPet?.dietaryNotes || '');
  const [vetClinicName, setVetClinicName] = useState(initialPet?.vetClinicName || '');
  const [emergencyContact, setEmergencyContact] = useState(initialPet?.emergencyContact || '');

  // Synchronize state when initialPet or isOpen changes
  useEffect(() => {
    if (initialPet) {
      setName(initialPet.name || '');
      setSpecies(initialPet.species || 'dog');
      setBreed(initialPet.breed || '');
      setBirthDate(initialPet.birthDate || '2023-01-01');
      setGender(initialPet.gender || 'male');
      setWeightKg(typeof initialPet.weightKg === 'number' ? initialPet.weightKg : 12);
      setMicrochipId(initialPet.microchipId || '');
      setAvatarUrl(initialPet.avatarUrl || '');
      setAllergiesInput(initialPet.allergies ? initialPet.allergies.join(', ') : '');
      setDietaryNotes(initialPet.dietaryNotes || '');
      setVetClinicName(initialPet.vetClinicName || '');
      setEmergencyContact(initialPet.emergencyContact || '');
    } else {
      setName('');
      setSpecies('dog');
      setBreed('');
      setBirthDate('2023-01-01');
      setGender('male');
      setWeightKg(12);
      setMicrochipId('');
      setAvatarUrl('');
      setAllergiesInput('');
      setDietaryNotes('');
      setVetClinicName('');
      setEmergencyContact('');
    }
  }, [initialPet, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const allergies = allergiesInput
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    onSave({
      name: name.trim(),
      species,
      breed: breed.trim() || 'Mixed',
      birthDate,
      gender,
      weightKg: Number(weightKg) || 0,
      microchipId: microchipId.trim() || undefined,
      avatarUrl: avatarUrl.trim() || undefined,
      allergies,
      dietaryNotes: dietaryNotes.trim() || undefined,
      vetClinicName: vetClinicName.trim() || undefined,
      emergencyContact: emergencyContact.trim() || undefined,
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
              {initialPet ? `Edit ${initialPet.name}'s Profile` : 'Register New Pet'}
            </h3>
            <p className="text-xs text-[#7B6F63] dark:text-[#9F9184]">
              Store identity details, microchip ID, and dietary specifications.
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
          {/* Name & Species */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Pet Name <span className="text-[#C85A32]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Kopi, Luna"
                className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-sm focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Species
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value as PetSpecies)}
                className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#A86438]"
              >
                <option value="dog">Dog 🐕</option>
                <option value="cat">Cat 🐈</option>
                <option value="bird">Bird 🦜</option>
                <option value="rabbit">Rabbit 🐇</option>
                <option value="other">Other Pet</option>
              </select>
            </div>
          </div>

          {/* Breed & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Breed
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="e.g. Golden Retriever"
                className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Gender
              </label>
              <div className="flex gap-2 mt-0.5">
                {(['male', 'female'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-1.5 rounded-lg border capitalize transition-colors text-xs font-medium ${
                      gender === g
                        ? 'border-[#A86438] bg-[#A86438]/10 text-[#A86438] font-semibold'
                        : 'border-[#E0D7CB] dark:border-[#38312B] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Birth Date & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Birth Date / Adoption Day
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono text-xs focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-xs focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
          </div>

          {/* Microchip & Vet */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Microchip ID #
              </label>
              <input
                type="text"
                value={microchipId}
                onChange={(e) => setMicrochipId(e.target.value)}
                placeholder="15-digit ISO microchip code"
                className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono text-xs focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Primary Vet Clinic
              </label>
              <input
                type="text"
                value={vetClinicName}
                onChange={(e) => setVetClinicName(e.target.value)}
                placeholder="e.g. City Vet Care Hospital"
                className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#A86438]"
              />
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Photo URL (optional)
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#A86438]"
            />
          </div>

          {/* Allergies & Dietary */}
          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Known Allergies (comma-separated)
            </label>
            <input
              type="text"
              value={allergiesInput}
              onChange={(e) => setAllergiesInput(e.target.value)}
              placeholder="e.g. Chicken protein, Bee stings"
              className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#A86438]"
            />
          </div>

          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Dietary Instructions & Emergency Contact
            </label>
            <textarea
              rows={2}
              value={dietaryNotes}
              onChange={(e) => setDietaryNotes(e.target.value)}
              placeholder="Feeding schedule, prescription food brand, emergency phone..."
              className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-xs focus:outline-hidden focus:border-[#A86438]"
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
              {initialPet ? 'Save Changes' : 'Register Pet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
