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
  Edit2,
} from 'lucide-react';
import { DailyNutritionLog, MealItem, MealType } from '../../types';
import { MiniCalendar, CalendarHighlight } from '../MiniCalendar';
import { MealModal } from './MealModal';
import { NutritionCharts } from './NutritionCharts';
import { ConfirmDeleteModal } from '../Common/ConfirmDeleteModal';
import { translations, Language } from '../../lib/translations';

interface NutritionViewProps {
  logs: DailyNutritionLog[];
  getLogForDate: (date: string) => DailyNutritionLog;
  onAddMeal: (date: string, meal: Omit<MealItem, 'id'>) => void;
  onUpdateMeal?: (date: string, mealId: string, updates: Partial<MealItem>) => void;
  onDeleteMeal: (date: string, mealId: string) => void;
  onUpdateWeight: (date: string, weightKg: number) => void;
  onUpdateWater: (date: string, deltaMl: number) => void;
  calorieGoal: number;
  sugarLimit: number;
  language?: Language;
}

export const NutritionView: React.FC<NutritionViewProps> = ({
  logs,
  getLogForDate,
  onAddMeal,
  onUpdateMeal,
  onDeleteMeal,
  onUpdateWeight,
  onUpdateWater,
  calorieGoal,
  sugarLimit,
  language = 'id',
}) => {
  const t = translations[language].nutrition;
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDefaultMealType, setModalDefaultMealType] = useState<MealType>('breakfast');
  const [editingMeal, setEditingMeal] = useState<{ date: string; meal: MealItem } | null>(null);
  const [weightInputValue, setWeightInputValue] = useState('');
  const [mealToDelete, setMealToDelete] = useState<{ date: string; meal: MealItem } | null>(null);

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
    setEditingMeal(null);
    setModalDefaultMealType(type);
    setIsModalOpen(true);
  };

  const handleEditMeal = (meal: MealItem) => {
    setEditingMeal({ date: selectedDate, meal });
    setModalDefaultMealType(meal.mealType);
    setIsModalOpen(true);
  };

  const handleSaveMeal = (mealData: Omit<MealItem, 'id'>) => {
    if (editingMeal) {
      if (onUpdateMeal) {
        onUpdateMeal(editingMeal.date, editingMeal.meal.id, mealData);
      }
    } else {
      onAddMeal(selectedDate, mealData);
    }
    setEditingMeal(null);
    setIsModalOpen(false);
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
    <div className="space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-[#E4DCDB] dark:border-[#352F2B]">
        <div>
          <div className="text-xs uppercase tracking-widest font-mono text-[#5B7A58] font-semibold mb-1.5">
            {t.tag}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#2B241E] dark:text-[#EFE9E2]">
            {t.title}
          </h1>
          <p className="text-sm sm:text-base text-[#7B6F63] dark:text-[#9F9184] mt-1.5 max-w-2xl leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-2.5 self-start md:self-auto bg-[#FFFDF9] dark:bg-[#1C1815] p-2 rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] shadow-xs">
          <button
            type="button"
            onClick={() => stepDate(-1)}
            aria-label="Previous day"
            className="p-2 rounded-xl hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] text-[#6F645A] dark:text-[#A89C90] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4.5 h-4.5" />
          </button>

          <div className="flex items-center gap-2 px-2.5 font-mono text-sm font-semibold tabular-nums text-[#2B241E] dark:text-[#EFE9E2]">
            <CalendarIcon className="w-4 h-4 text-[#5B7A58]" />
            <span>{selectedDate}</span>
            {isToday && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-[#5B7A58]/15 text-[#5B7A58] uppercase font-sans font-semibold">
                {t.today}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => stepDate(1)}
            aria-label="Next day"
            className="p-2 rounded-xl hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] text-[#6F645A] dark:text-[#A89C90] transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4.5 h-4.5" />
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}
              className="ml-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[#E0D7CB] dark:border-[#38312B] hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] transition-colors cursor-pointer"
            >
              {t.jumpToday}
            </button>
          )}
        </div>
      </div>

      {/* 4 Primary Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {/* 1. Daily Calories */}
        <div className="rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-[#7B6F63] dark:text-[#9F9184]">
                {t.caloriesConsumed}
              </span>
              <Flame className="w-4.5 h-4.5 text-[#C85A32]" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold font-mono tabular-nums text-[#2B241E] dark:text-[#EFE9E2]">
                {currentLog.caloriesConsumed}
              </span>
              <span className="text-xs sm:text-sm font-mono text-[#7B6F63] dark:text-[#9F9184]">
                / {currentLog.calorieGoal || calorieGoal} kcal
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-2 bg-[#EAE2D8] dark:bg-[#2E2823] rounded-full mt-3.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  caloriePercent > 105 ? 'bg-[#D9822B]' : 'bg-[#5B7A58]'
                }`}
                style={{ width: `${Math.min(caloriePercent, 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#EAE2D8] dark:border-[#2E2823] text-xs text-[#7B6F63] dark:text-[#9F9184]">
            {remainingCalories >= 0 ? (
              <span><strong className="text-[#5B7A58]">{remainingCalories} kcal</strong> {t.budgetRemaining}</span>
            ) : (
              <span><strong className="text-[#D9822B]">{Math.abs(remainingCalories)} kcal</strong> {t.overBudget}</span>
            )}
          </div>
        </div>

        {/* 2. Sugar Intake */}
        <div className="rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-[#7B6F63] dark:text-[#9F9184]">
                {t.sugarIntake}
              </span>
              <Candy className="w-4.5 h-4.5 text-[#D9822B]" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold font-mono tabular-nums text-[#2B241E] dark:text-[#EFE9E2]">
                {currentLog.sugarGrams}
              </span>
              <span className="text-xs sm:text-sm font-mono text-[#7B6F63] dark:text-[#9F9184]">
                / {currentLog.sugarLimitGrams || sugarLimit}g {t.limit}
              </span>
            </div>
            {/* Sugar bar */}
            <div className="w-full h-2 bg-[#EAE2D8] dark:bg-[#2E2823] rounded-full mt-3.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isSugarSpike ? 'bg-[#C85A32]' : 'bg-[#D9822B]'
                }`}
                style={{ width: `${Math.min(sugarPercent, 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#EAE2D8] dark:border-[#2E2823] flex items-center justify-between text-xs">
            {isSugarSpike ? (
              <span className="text-[#C85A32] font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {t.sugarSpikeAlert}
              </span>
            ) : (
              <span className="text-[#5B7A58] font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t.sugarWithinGuideline}
              </span>
            )}
            <span className="font-mono text-xs text-[#7B6F63] font-semibold">{sugarPercent}%</span>
          </div>
        </div>

        {/* 3. Weight Tracking */}
        <div className="rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-[#7B6F63] dark:text-[#9F9184]">
                {t.dailyWeight}
              </span>
              <Scale className="w-4.5 h-4.5 text-[#8C6D4F]" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold font-mono tabular-nums text-[#2B241E] dark:text-[#EFE9E2]">
                {currentLog.weightKg ? currentLog.weightKg.toFixed(1) : '—'}
              </span>
              <span className="text-xs sm:text-sm font-mono text-[#7B6F63] dark:text-[#9F9184]">kg</span>
            </div>
          </div>

          <form onSubmit={handleSaveWeight} className="mt-4 pt-2.5 border-t border-[#EAE2D8] dark:border-[#2E2823] flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="30"
              max="250"
              placeholder={currentLog.weightKg ? `${currentLog.weightKg} kg` : t.logWeightPlaceholder}
              value={weightInputValue}
              onChange={(e) => setWeightInputValue(e.target.value)}
              className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#25201C] font-mono tabular-nums focus:outline-hidden focus:border-[#8C6D4F]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-[#8C6D4F] text-white text-xs sm:text-sm font-medium hover:bg-[#785C42] shrink-0 transition-colors cursor-pointer active:scale-95"
            >
              {t.saveWeight}
            </button>
          </form>
        </div>

        {/* 4. Water Hydration */}
        <div className="rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-5 sm:p-6 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-semibold text-[#7B6F63] dark:text-[#9F9184]">
                {t.waterIntake}
              </span>
              <Droplets className="w-4.5 h-4.5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="font-serif text-3xl sm:text-4xl font-bold font-mono tabular-nums text-[#2B241E] dark:text-[#EFE9E2]">
                {currentLog.waterMl}
              </span>
              <span className="text-xs sm:text-sm font-mono text-[#7B6F63] dark:text-[#9F9184]">
                / {t.waterTarget}
              </span>
            </div>
            <div className="w-full h-2 bg-[#EAE2D8] dark:bg-[#2E2823] rounded-full mt-3.5 overflow-hidden">
              <div
                className="h-full bg-cyan-600 dark:bg-cyan-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(Math.round((currentLog.waterMl / 2500) * 100), 100)}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-2.5 border-t border-[#EAE2D8] dark:border-[#2E2823] flex items-center justify-between">
            <span className="text-xs text-[#7B6F63] font-mono">
              ~{(currentLog.waterMl / 250).toFixed(1)} {t.glasses}
            </span>
            <button
              type="button"
              onClick={() => onUpdateWater(selectedDate, 250)}
              className="px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-semibold hover:bg-cyan-100 transition-colors cursor-pointer active:scale-95"
            >
              {t.addWater}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Meal Logs by Category */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4DCDB] dark:border-[#352F2B]">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2B241E] dark:text-[#EFE9E2]">
              {t.foodLogTitle} ({selectedDate})
            </h3>
            <button
              type="button"
              onClick={() => handleOpenAddMeal('breakfast')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5B7A58] text-white text-xs sm:text-sm font-semibold hover:bg-[#4D674A] transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t.logMealBtn}</span>
            </button>
          </div>

          {currentLog.meals.length === 0 ? (
            <div className="p-14 text-center rounded-2xl border border-dashed border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815]">
              <Utensils className="w-9 h-9 mx-auto text-[#8F8275] mb-3" />
              <h4 className="font-serif text-base font-semibold">{t.noFoodLogged}</h4>
              <p className="text-xs sm:text-sm text-[#7B6F63] mt-1.5 max-w-sm mx-auto leading-relaxed">
                {t.noFoodDesc}
              </p>
              <div className="flex justify-center flex-wrap gap-2.5 mt-5">
                {mealGroups.map((group) => (
                  <button
                    key={group.type}
                    type="button"
                    onClick={() => handleOpenAddMeal(group.type)}
                    className="px-3.5 py-1.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] text-xs sm:text-sm font-medium hover:bg-[#F3ECE4] dark:hover:bg-[#25201C] cursor-pointer transition-colors"
                  >
                    + {group.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {mealGroups.map((group) => {
                const groupMeals = currentLog.meals.filter((m) => m.mealType === group.type);
                const groupCal = groupMeals.reduce((s, m) => s + m.calories, 0);
                const groupSugar = groupMeals.reduce((s, m) => s + m.sugarGrams, 0);

                return (
                  <div
                    key={group.type}
                    className="rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-5 sm:p-6 shadow-xs"
                  >
                    {/* Meal Group Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8] dark:border-[#2E2823]">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{group.icon}</span>
                        <h4 className="font-serif text-base font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                          {group.label}
                        </h4>
                        <span className="text-xs text-[#8F8275]">({groupMeals.length})</span>
                      </div>

                      <div className="flex items-center gap-3.5">
                        <div className="text-xs sm:text-sm font-mono tabular-nums text-[#7B6F63] dark:text-[#9F9184]">
                          <strong className="text-[#2B241E] dark:text-[#EFE9E2]">{groupCal}</strong> kcal ·{' '}
                          <span className="text-[#D9822B] font-semibold">{groupSugar}g</span> sugar
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenAddMeal(group.type)}
                          className="p-1.5 rounded-lg hover:bg-[#F4ECE3] dark:hover:bg-[#25201C] text-[#5B7A58] cursor-pointer"
                          title={`Add item to ${group.label}`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Meal Items */}
                    {groupMeals.length === 0 ? (
                      <div className="py-3 text-xs sm:text-sm text-[#8F8275] italic">
                        No {group.label.toLowerCase()} items recorded.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#EAE2D8] dark:divide-[#2E2823]">
                        {groupMeals.map((meal) => (
                          <div
                            key={meal.id}
                            className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm"
                          >
                            <div>
                              <div className="font-medium text-[#2B241E] dark:text-[#EFE9E2] text-sm">
                                {meal.name}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#7B6F63] dark:text-[#9F9184] font-mono mt-0.5">
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
                                <div className="font-semibold text-xs sm:text-sm text-[#2B241E] dark:text-[#EFE9E2]">
                                  {meal.calories} kcal
                                </div>
                                <div className="text-xs text-[#D9822B]">
                                  {meal.sugarGrams}g sugar
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditMeal(meal)}
                                  className="p-2 rounded-lg text-[#8F8275] hover:text-[#5B7A58] hover:bg-[#5B7A58]/10 transition-colors cursor-pointer"
                                  title="Edit meal item"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMealToDelete({ date: selectedDate, meal })}
                                  className="p-2 rounded-lg text-[#8F8275] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                  title="Remove meal item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
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
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] p-5 sm:p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="font-serif text-base font-bold text-[#2B241E] dark:text-[#EFE9E2]">
                {t.nutritionCalendar}
              </h3>
              <p className="text-xs text-[#7B6F63] dark:text-[#9F9184] mt-0.5">
                {t.nutritionCalendarSub}
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
            <div className="mt-4 pt-3.5 border-t border-[#E4DCDB] dark:border-[#352F2B] text-xs space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5B7A58]" />
                <span className="text-[#6F645A] dark:text-[#A89C90]">{t.onTargetLegend}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9822B]" />
                <span className="text-[#6F645A] dark:text-[#A89C90]">{t.exceededLegend}</span>
              </div>
            </div>
          </div>

          {/* Daily Advice Card */}
          <div className="rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#F7F2EB] dark:bg-[#221C18] p-5 text-xs sm:text-sm text-[#594E44] dark:text-[#C5B8AA] space-y-2">
            <div className="font-serif font-bold text-sm text-[#2B241E] dark:text-[#EFE9E2]">
              {t.sugarTipTitle}
            </div>
            <p className="leading-relaxed text-xs sm:text-sm">
              {t.sugarTipDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Meal Entry Modal */}
      <MealModal
        key={editingMeal ? editingMeal.meal.id : `new-meal-${modalDefaultMealType}`}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingMeal(null);
        }}
        onSave={handleSaveMeal}
        defaultMealType={modalDefaultMealType}
        initialMeal={editingMeal ? editingMeal.meal : null}
      />

      {/* Delete Meal Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(mealToDelete)}
        onClose={() => setMealToDelete(null)}
        onConfirm={() => {
          if (mealToDelete) {
            onDeleteMeal(mealToDelete.date, mealToDelete.meal.id);
            setMealToDelete(null);
          }
        }}
        title={language === 'id' ? 'Hapus Entri Makanan?' : 'Delete Meal Entry?'}
        itemName={mealToDelete?.meal.name}
        description={
          language === 'id'
            ? 'Entri makanan ini akan dihapus dari catatan harian nutrisi Anda.'
            : 'This meal entry will be removed from your daily nutrition log.'
        }
        confirmText={language === 'id' ? 'Hapus Makanan' : 'Delete Meal'}
        cancelText={language === 'id' ? 'Batal' : 'Cancel'}
      />
    </div>
  );
};
