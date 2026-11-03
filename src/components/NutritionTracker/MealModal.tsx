/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Utensils, Sparkles } from 'lucide-react';
import { MealItem, MealType } from '../../types';

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meal: Omit<MealItem, 'id'>) => void;
  defaultMealType?: MealType;
}

const COMMON_PRESETS: { name: string; mealType: MealType; cal: number; sugar: number; protein: number }[] = [
  { name: 'Oatmeal with Blueberries & Chia', mealType: 'breakfast', cal: 350, sugar: 7, protein: 12 },
  { name: 'Sourdough & Scrambled Eggs', mealType: 'breakfast', cal: 420, sugar: 2, protein: 20 },
  { name: 'Black Americano Coffee', mealType: 'breakfast', cal: 5, sugar: 0, protein: 0 },
  { name: 'Grilled Chicken Breast Bowl', mealType: 'lunch', cal: 580, sugar: 4, protein: 46 },
  { name: 'Tuna Salad on Whole Grain', mealType: 'lunch', cal: 490, sugar: 3, protein: 34 },
  { name: 'Greek Yogurt with Drizzle of Honey', mealType: 'snack', cal: 180, sugar: 12, protein: 15 },
  { name: 'Handful Roasted Almonds (30g)', mealType: 'snack', cal: 170, sugar: 1, protein: 6 },
  { name: 'Pan-seared Salmon & Sweet Potato', mealType: 'dinner', cal: 640, sugar: 5, protein: 44 },
  { name: 'Grass-fed Beef Steak & Broccoli', mealType: 'dinner', cal: 680, sugar: 2, protein: 50 },
];

export const MealModal: React.FC<MealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultMealType = 'breakfast',
}) => {
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number>(350);
  const [sugarGrams, setSugarGrams] = useState<number>(5);
  const [proteinGrams, setProteinGrams] = useState<number>(20);
  const [carbsGrams, setCarbsGrams] = useState<number>(30);
  const [fatGrams, setFatGrams] = useState<number>(10);
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });

  if (!isOpen) return null;

  const applyPreset = (preset: typeof COMMON_PRESETS[0]) => {
    setName(preset.name);
    setMealType(preset.mealType);
    setCalories(preset.cal);
    setSugarGrams(preset.sugar);
    setProteinGrams(preset.protein);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      mealType,
      name: name.trim(),
      calories: Math.max(0, Number(calories)),
      sugarGrams: Math.max(0, Number(sugarGrams)),
      proteinGrams: Math.max(0, Number(proteinGrams)),
      carbsGrams: Math.max(0, Number(carbsGrams)),
      fatGrams: Math.max(0, Number(fatGrams)),
      time,
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
            <h3 className="font-serif text-lg font-bold">Log Food & Beverage</h3>
            <p className="text-xs text-[#7B6F63] dark:text-[#9F9184]">
              Accurately track calories and watch daily sugar intake.
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

        {/* Quick Presets Strip */}
        <div className="mt-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#7B6F63] dark:text-[#9F9184] mb-1.5">
            <Sparkles className="w-3 h-3 text-[#D9822B]" />
            <span>Quick Suggestions</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {COMMON_PRESETS.slice(0, 5).map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="px-2.5 py-1 rounded-md text-[11px] border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] hover:border-[#5B7A58] whitespace-nowrap transition-colors text-left"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {/* Meal Category */}
          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Meal Time
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMealType(m)}
                  className={`py-1.5 rounded-lg border text-xs font-medium capitalize transition-colors ${
                    mealType === m
                      ? 'border-[#5B7A58] bg-[#5B7A58]/10 text-[#5B7A58] font-semibold'
                      : 'border-[#E4DCDB] dark:border-[#352F2B] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Food Name */}
          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Food or Drink Description <span className="text-[#C85A32]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Avocado Toast with Poached Egg"
              className="w-full px-3 py-2 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] text-sm focus:outline-hidden focus:border-[#5B7A58]"
            />
          </div>

          {/* Calories & Sugar (Primary metrics) */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-[#F7F2EB] dark:bg-[#221C18] border border-[#E4DCDB] dark:border-[#352F2B]">
            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Calories (kcal) <span className="text-[#C85A32]">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                required
                value={calories}
                onChange={(e) => setCalories(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-md border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-sm font-semibold focus:outline-hidden focus:border-[#5B7A58]"
              />
            </div>

            <div>
              <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
                Sugar (grams) <span className="text-[#D9822B]">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={sugarGrams}
                onChange={(e) => setSugarGrams(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded-md border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-sm font-semibold focus:outline-hidden focus:border-[#5B7A58]"
              />
            </div>
          </div>

          {/* Macros & Time */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] text-[#7B6F63] mb-1">Protein (g)</label>
              <input
                type="number"
                min="0"
                value={proteinGrams}
                onChange={(e) => setProteinGrams(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-md border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#7B6F63] mb-1">Carbs (g)</label>
              <input
                type="number"
                min="0"
                value={carbsGrams}
                onChange={(e) => setCarbsGrams(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-md border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#7B6F63] mb-1">Fat (g)</label>
              <input
                type="number"
                min="0"
                value={fatGrams}
                onChange={(e) => setFatGrams(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 rounded-md border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1 text-[#594E44] dark:text-[#C5B8AA]">
              Logged Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono text-xs focus:outline-hidden focus:border-[#5B7A58]"
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
              className="px-5 py-2 rounded-lg bg-[#5B7A58] text-white text-xs font-medium hover:bg-[#4D674A] transition-colors"
            >
              Save Food Entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
