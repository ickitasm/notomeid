/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Plus,
  Flame,
  Candy,
  Scale,
  Droplets,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { DailyNutritionLog, MealItem, MealType } from '../../types';
import { MiniCalendar, CalendarHighlight } from '../MiniCalendar';
import { MealModal } from './MealModal';
import { NutritionCharts } from './NutritionCharts';

interface NutritionViewProps {
  logs: DailyNutritionLog[];
  getLogForDate: (date: string) => DailyNutritionLog;
  onAddMeal: (date: string, meal: Omit<MealItem, 'id'>) => void;
  onDeleteMeal: (date: string, mealId: string) => void;
  onUpdateWeight: (date: string, weightKg: number) => void;
  onUpdateWater: (date: string, deltaMl: number) => void;
  calorieGoal: number;
  sugarLimit: number;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  logs,
  getLogForDate,
  onAddMeal,
  onDeleteMeal,
  onUpdateWeight,
  onUpdateWater,
  calorieGoal,
  sugarLimit,
}) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultMealType, setModalDefaultMealType] = useState<MealType>('breakfast');
  const [weightInputValue, setWeightInputValue] = useState('');

  // Active day's data
  const currentLog = useMemo(() => getLogForDate(selectedDate), [getLogForDate, selectedDate]);

  // Handle date stepping
  const stepDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);

  // Group meals
  const mealGroups: { type: MealType; label: string; icon: string }[] = [
    { type: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { type: 'lunch', label: 'Lunch', icon: '☀️' },
    { type: 'dinner', label: 'Dinner', icon: '🌙' },
    { type: 'snack', label: 'Snacks & Drinks', icon: '🍎' },
  ];

  // Calendar highlights
  const calendarHighlights = useMemo(() => {
    const map: Record<string, CalendarHighlight> = {};
    logs.forEach((log) => {
      if (log.caloriesConsumed > 0) {
        if (log.caloriesConsumed <= log.calorieGoal) {
          map[log.date] = { color: '#5B7A58', label: `${log.caloriesConsumed} kcal (On Target)` };
        } else {
          map[log.date] = { color: '#D9822B', label: `${log.caloriesConsumed} kcal (Over Goal)` };
        }
      }
    });
    return map;
  }, [logs]);

  // Sugar intake status calculation
  const sugarPercent = Math.round((currentLog.sugarGrams / (currentLog.sugarLimitGrams || sugarLimit)) * 100);
  const isSugarSpike = currentLog.sugarGrams > (currentLog.sugarLimitGrams || sugarLimit);

  // Calorie calculations
  const caloriePercent = Math.round((currentLog.caloriesConsumed / (currentLog.calorieGoal || calorieGoal)) * 100);
  const remainingCalories = (currentLog.calorieGoal || calorieGoal) - currentLog.caloriesConsumed;

  const handleOpenAddMeal = (type: MealType) => {
    setModalDefaultMealType(type);
    setIsModalOpen(true);
  };

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(weightInputValue);
    if (!isNaN(parsed) && parsed > 20 && parsed < 300) {
      onUpdateWeight(selectedDate, parsed);
      setWeightInputValue('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4DCDB] dark:border-[#352F2B]">
        <div>
          <div className="text-xs uppercase tracking-widest font-mono text-[#5B7A58] font-semibold mb-1">
            Metabolic & Nutritional Journal
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
            Daily Calories & Biometrics
          </h1>
          <p className="text-xs sm:text-sm text-[#7B6F63] dark:text-[#9F9184] mt-1 max-w-2xl">
            Monitor daily calorie balance, keep added sugar within safe limits, and track body weight trends.
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-[#FFFDF9] dark:bg-[#1C1815] p-1.5 rounded-xl border border-[#E4DCDB] dark:border-[#352F2B]">
          <button
            type="button"
            onClick={() => stepDate(-1)}
            aria-label="Previous day"
            className="p-1.5 rounded-lg hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] text-[#6F645A] dark:text-[#A89C90] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2 font-mono text-xs font-semibold tabular-nums text-[#2B241E] dark:text-[#EFE9E2]">
            <CalendarIcon className="w-3.5 h-3.5 text-[#5B7A58]" />
            <span>{selectedDate}</span>
            {isToday && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#5B7A58]/15 text-[#5B7A58] uppercase font-sans font-medium">
                Today
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => stepDate(1)}
            aria-label="Next day"
            className="p-1.5 rounded-lg hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] text-[#6F645A] dark:text-[#A89C90] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
              className="ml-1 px-2 py-1 rounded text-[11px] font-medium border border-[#E0D7CB] dark:border-[#38312B] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] transition-colors"
            >
              Jump Today
            </button>
          )}
        </div>
      </div>

      {/* 4 Primary Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Daily Calories */}
        <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#7B6F63] dark:text-[#9F9184]">
                Calories Consumed
              </span>
              <Flame className="w-4 h-4 text-[#C85A32]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold font-mono tabular-nums text-[#2B241E] dark:text-[#EFE9E2]">
                {currentLog.caloriesConsumed}
              </span>
              <span className="text-xs font-mono text-[#7B6F63] dark:text-[#9F9184]">
                / {currentLog.calorieGoal || calorieGoal} kcal
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[#EAE2D8] dark:bg-[#2E2823] rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  caloriePercent > 105 ? 'bg-[#D9822B]' : 'bg-[#5B7A58]'
                }`}
                style={{ width: `${Math.min(caloriePercent, 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EAE2D8] dark:border-[#2E2823] text-[11px] text-[#7B6F63] dark:text-[#9F9184]">
            {remainingCalories >= 0 ? (
              <span><strong className="text-[#5B7A58]">{remainingCalories} kcal</strong> budget remaining</span>
            ) : (
              <span><strong className="text-[#D9822B]">{Math.abs(remainingCalories)} kcal</strong> over target budget</span>
            )}
          </div>
        </div>

        {/* 2. Sugar Intake */}
        <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#7B6F63] dark:text-[#9F9184]">
                Sugar Intake
              </span>
              <Candy className="w-4 h-4 text-[#D9822B]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold font-mono tabular-nums text-[#2B241E] dark:text-[#EFE9E2]">
                {currentLog.sugarGrams}
              </span>
              <span className="text-xs font-mono text-[#7B6F63] dark:text-[#9F9184]">
                / {currentLog.sugarLimitGrams || sugarLimit}g limit
              </span>
            </div>
            {/* Sugar bar */}
            <div className="w-full h-1.5 bg-[#EAE2D8] dark:bg-[#2E2823] rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isSugarSpike ? 'bg-[#C85A32]' : 'bg-[#D9822B]'
                }`}
                style={{ width: `${Math.min(sugarPercent, 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EAE2D8] dark:border-[#2E2823] flex items-center justify-between text-[11px]">
            {isSugarSpike ? (
              <span className="text-[#C85A32] font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Sugar Spike Alert
              </span>
            ) : (
              <span className="text-[#5B7A58] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Within WHO guidelines
              </span>
            )}
            <span className="font-mono text-[10px] text-[#7B6F63]">{sugarPercent}%</span>
          </div>
        </div>

        {/* 3. Weight Tracking */}
        <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#7B6F63] dark:text-[#9F9184]">
                Daily Body Weight
              </span>
              <Scale className="w-4 h-4 text-[#8C6D4F]" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold font-mono tabular-nums text-[#2B241E] dark:text-[#EFE9E2]">
                {currentLog.weightKg ? currentLog.weightKg.toFixed(1) : '—'}
              </span>
              <span className="text-xs font-mono text-[#7B6F63] dark:text-[#9F9184]">kg</span>
            </div>
          </div>

          <form onSubmit={handleSaveWeight} className="mt-3 pt-2 border-t border-[#EAE2D8] dark:border-[#2E2823] flex items-center gap-1.5">
            <input
              type="number"
              step="0.1"
              min="30"
              max="250"
              placeholder={currentLog.weightKg ? `${currentLog.weightKg} kg` : 'Log weight (kg)'}
              value={weightInputValue}
              onChange={(e) => setWeightInputValue(e.target.value)}
              className="w-full px-2 py-1 text-xs rounded border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums focus:outline-hidden focus:border-[#8C6D4F]"
            />
            <button
              type="submit"
              className="px-2 py-1 rounded bg-[#8C6D4F] text-white text-xs font-medium hover:bg-[#785C42] shrink-0 transition-colors"
            >
              Save
            </button>
          </form>
        </div>

        {/* 4. Water Hydration */}
        <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#7B6F63] dark:text-[#9F9184]">
                Water Intake
              </span>
              <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-serif text-3xl font-bold font-mono tabular-nums text-[#2B241E] dark:text-[#EFE9E2]">
                {currentLog.waterMl}
              </span>
              <span className="text-xs font-mono text-[#7B6F63] dark:text-[#9F9184]">
                / 2500 ml target
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#EAE2D8] dark:bg-[#2E2823] rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-cyan-600 dark:bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(Math.round((currentLog.waterMl / 2500) * 100), 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#EAE2D8] dark:border-[#2E2823] flex items-center justify-between">
            <span className="text-[11px] text-[#7B6F63] font-mono">
              ~{(currentLog.waterMl / 250).toFixed(1)} glasses
            </span>
            <button
              type="button"
              onClick={() => onUpdateWater(selectedDate, 250)}
              className="px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-[11px] font-medium hover:bg-cyan-100 transition-colors"
            >
              +250 ml
            </button>
          </div>
        </div>
      </div>

      {/* SVG Interactive Trend Analytics Section */}
      <NutritionCharts
        logs={logs}
        calorieGoal={calorieGoal}
        sugarLimit={sugarLimit}
      />

      {/* Main Two-Column View: Meals Log & Embedded Nutrition Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Meal Logs by Category */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E4DCDB] dark:border-[#352F2B]">
            <h3 className="font-serif text-lg font-bold text-[#2B241E] dark:text-[#EFE9E2]">
              Food Log for {selectedDate}
            </h3>
            <button
              type="button"
              onClick={() => handleOpenAddMeal('breakfast')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5B7A58] text-white text-xs font-medium hover:bg-[#4D674A] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Meal Item</span>
            </button>
          </div>

          {currentLog.meals.length === 0 ? (
            <div className="p-10 text-center rounded-xl border border-dashed border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
              <Utensils className="w-7 h-7 mx-auto text-[#8F8275] mb-2" />
              <h4 className="font-serif text-sm font-semibold">No food logged yet for this day</h4>
              <p className="text-xs text-[#7B6F63] mt-1 max-w-sm mx-auto">
                Log your breakfast, lunch, dinner, or snacks to track calories and sugar.
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {mealGroups.map((group) => (
                  <button
                    key={group.type}
                    type="button"
                    onClick={() => handleOpenAddMeal(group.type)}
                    className="px-2.5 py-1 rounded-md border border-[#E0D7CB] dark:border-[#38312B] text-xs font-medium hover:bg-[#F3ECE4] dark:hover:bg-[#25201C]"
                  >
                    + {group.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {mealGroups.map((group) => {
                const groupMeals = currentLog.meals.filter((m) => m.mealType === group.type);
                const groupCal = groupMeals.reduce((s, m) => s + m.calories, 0);
                const groupSugar = groupMeals.reduce((s, m) => s + m.sugarGrams, 0);

                return (
                  <div
                    key={group.type}
                    className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4"
                  >
                    {/* Meal Group Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D8] dark:border-[#2E2823]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{group.icon}</span>
                        <h4 className="font-serif text-sm font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                          {group.label}
                        </h4>
                        <span className="text-xs text-[#8F8275]">({groupMeals.length})</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-xs font-mono tabular-nums text-[#7B6F63] dark:text-[#9F9184]">
                          <strong className="text-[#2B241E] dark:text-[#EFE9E2]">{groupCal}</strong> kcal ·{' '}
                          <span className="text-[#D9822B]">{groupSugar}g</span> sugar
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenAddMeal(group.type)}
                          className="p-1 rounded hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] text-[#5B7A58]"
                          title={`Add item to ${group.label}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Meal Items */}
                    {groupMeals.length === 0 ? (
                      <div className="py-2.5 text-xs text-[#8F8275] italic">
                        No {group.label.toLowerCase()} items recorded.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#EAE2D8] dark:divide-[#2E2823]">
                        {groupMeals.map((meal) => (
                          <div
                            key={meal.id}
                            className="py-2.5 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-medium text-[#2B241E] dark:text-[#EFE9E2]">
                                {meal.name}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-[#7B6F63] dark:text-[#9F9184] font-mono mt-0.5">
                                <span>{meal.time}</span>
                                {meal.proteinGrams !== undefined && (
                                  <>
                                    <span>·</span>
                                    <span>{meal.proteinGrams}g pro</span>
                                  </>
                                )}
                                {meal.carbsGrams !== undefined && (
                                  <>
                                    <span>·</span>
                                    <span>{meal.carbsGrams}g carb</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right font-mono tabular-nums">
                                <div className="font-semibold text-[#2B241E] dark:text-[#EFE9E2]">
                                  {meal.calories} kcal
                                </div>
                                <div className="text-[11px] text-[#D9822B]">
                                  {meal.sugarGrams}g sugar
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => onDeleteMeal(selectedDate, meal.id)}
                                className="p-1 rounded text-[#8F8275] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                title="Remove meal item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Embedded Nutrition Mini-Calendar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-4">
            <div className="mb-3">
              <h3 className="font-serif text-sm font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                Nutrition & Weigh-in Calendar
              </h3>
              <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184]">
                Select any date to view historical meals & calorie targets
              </p>
            </div>

            <MiniCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              highlights={calendarHighlights}
              variant="nutrition"
              className="border-0 p-0 bg-transparent"
            />

            {/* Calendar Legend */}
            <div className="mt-4 pt-3 border-t border-[#E4DCDB] dark:border-[#352F2B] text-[11px] space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5B7A58]" />
                <span className="text-[#6F645A] dark:text-[#A89C90]">On Target Calorie Goal</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D9822B]" />
                <span className="text-[#6F645A] dark:text-[#A89C90]">Exceeded Calorie Target</span>
              </div>
            </div>
          </div>

          {/* Daily Advice Card */}
          <div className="rounded-xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#F7F2EB] dark:bg-[#221C18] p-4 text-xs text-[#594E44] dark:text-[#C5B8AA] space-y-1.5">
            <div className="font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2]">
              Sugar Guidance Note
            </div>
            <p className="leading-relaxed text-[11px]">
              The American Heart Association (AHA) recommends limiting added sugars to ~36g (9 tsp) daily for men and ~25g (6 tsp) for women to prevent insulin spikes and hepatic strain.
            </p>
          </div>
        </div>
      </div>

      {/* Meal Entry Modal */}
      <MealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(meal) => onAddMeal(selectedDate, meal)}
        defaultMealType={modalDefaultMealType}
      />
    </div>
  );
};
