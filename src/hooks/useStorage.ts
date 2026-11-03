/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  MediaItem,
  DailyNutritionLog,
  PetProfile,
  PetMedicalRecord,
  PetMedication,
  CalendarEvent,
  UserPreferences,
  MealItem,
  NoteItem,
  DreamLog,
} from '../types';
import {
  initialPreferences,
  initialMediaItems,
  initialNutritionLogs,
  initialPets,
  initialMedicalRecords,
  initialMedications,
  initialEvents,
  initialNotes,
  initialDreamLogs,
} from '../data/seedData';

const STORAGE_KEYS = {
  PREFS: 'chronolife_prefs_v1',
  MEDIA: 'chronolife_media_v1',
  NUTRITION: 'chronolife_nutrition_v1',
  PETS: 'chronolife_pets_v1',
  MEDICAL: 'chronolife_medical_v1',
  MEDS: 'chronolife_meds_v1',
  EVENTS: 'chronolife_events_v1',
  NOTES: 'chronolife_notes_v1',
  DREAMS: 'chronolife_dreams_v1',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Failed to parse stored key: ${key}`, e);
    return fallback;
  }
}

function saveStored<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to persist key: ${key}`, e);
  }
}

export function useStorage() {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() =>
    loadStored(STORAGE_KEYS.PREFS, initialPreferences)
  );

  const [mediaItems, setMediaItemsState] = useState<MediaItem[]>(() =>
    loadStored(STORAGE_KEYS.MEDIA, initialMediaItems)
  );

  const [nutritionLogs, setNutritionLogsState] = useState<DailyNutritionLog[]>(() =>
    loadStored(STORAGE_KEYS.NUTRITION, initialNutritionLogs)
  );

  const [pets, setPetsState] = useState<PetProfile[]>(() =>
    loadStored(STORAGE_KEYS.PETS, initialPets)
  );

  const [medicalRecords, setMedicalRecordsState] = useState<PetMedicalRecord[]>(() =>
    loadStored(STORAGE_KEYS.MEDICAL, initialMedicalRecords)
  );

  const [medications, setMedicationsState] = useState<PetMedication[]>(() =>
    loadStored(STORAGE_KEYS.MEDS, initialMedications)
  );

  const [calendarEvents, setCalendarEventsState] = useState<CalendarEvent[]>(() =>
    loadStored(STORAGE_KEYS.EVENTS, initialEvents)
  );

  const [notes, setNotesState] = useState<NoteItem[]>(() =>
    loadStored(STORAGE_KEYS.NOTES, initialNotes)
  );

  const [dreamLogs, setDreamLogsState] = useState<DreamLog[]>(() =>
    loadStored(STORAGE_KEYS.DREAMS, initialDreamLogs)
  );

  // Sync theme with HTML class
  useEffect(() => {
    if (preferences.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStored(STORAGE_KEYS.PREFS, preferences);
  }, [preferences]);

  // Persist handlers
  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferencesState((prev) => {
      const next = { ...prev, ...updates };
      saveStored(STORAGE_KEYS.PREFS, next);
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setPreferencesState((prev) => {
      const nextTheme: 'light' | 'dark' = prev.theme === 'dark' ? 'light' : 'dark';
      const next: UserPreferences = { ...prev, theme: nextTheme };
      saveStored(STORAGE_KEYS.PREFS, next);
      return next;
    });
  }, []);

  // --- MEDIA OPERATIONS ---
  const saveMediaItems = useCallback((items: MediaItem[]) => {
    setMediaItemsState(items);
    saveStored(STORAGE_KEYS.MEDIA, items);
  }, []);

  const addMediaItem = useCallback((item: Omit<MediaItem, 'id' | 'updatedAt'>) => {
    const newItem: MediaItem = {
      ...item,
      id: `media-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    saveMediaItems([newItem, ...mediaItems]);
    return newItem;
  }, [mediaItems, saveMediaItems]);

  const updateMediaItem = useCallback((id: string, updates: Partial<MediaItem>) => {
    const updated = mediaItems.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    saveMediaItems(updated);
  }, [mediaItems, saveMediaItems]);

  const deleteMediaItem = useCallback((id: string) => {
    saveMediaItems(mediaItems.filter((item) => item.id !== id));
  }, [mediaItems, saveMediaItems]);

  const incrementEpisode = useCallback((id: string) => {
    const updated = mediaItems.map((item) => {
      if (item.id !== id || item.type !== 'series' || !item.seriesDetails) return item;
      const details = item.seriesDetails;
      const nextEp = details.currentEpisode + 1;
      const isFinished = nextEp >= details.totalEpisodes;
      return {
        ...item,
        status: isFinished ? ('completed' as const) : item.status,
        seriesDetails: {
          ...details,
          currentEpisode: Math.min(nextEp, details.totalEpisodes),
        },
        updatedAt: new Date().toISOString(),
      };
    });
    saveMediaItems(updated);
  }, [mediaItems, saveMediaItems]);

  // --- NUTRITION OPERATIONS ---
  const saveNutritionLogs = useCallback((logs: DailyNutritionLog[]) => {
    setNutritionLogsState(logs);
    saveStored(STORAGE_KEYS.NUTRITION, logs);
  }, []);

  const getLogForDate = useCallback(
    (dateStr: string): DailyNutritionLog => {
      const existing = nutritionLogs.find((l) => l.date === dateStr);
      if (existing) return existing;
      // return default structure for the date
      return {
        date: dateStr,
        caloriesConsumed: 0,
        calorieGoal: preferences.defaultCalorieGoal,
        sugarGrams: 0,
        sugarLimitGrams: preferences.defaultSugarLimit,
        waterMl: 0,
        meals: [],
      };
    },
    [nutritionLogs, preferences.defaultCalorieGoal, preferences.defaultSugarLimit]
  );

  const addMealToDate = useCallback(
    (dateStr: string, meal: Omit<MealItem, 'id'>) => {
      const newMeal: MealItem = {
        ...meal,
        id: `meal-${Date.now()}`,
      };

      const existing = nutritionLogs.find((l) => l.date === dateStr);
      let updatedLogs: DailyNutritionLog[];

      if (existing) {
        const nextMeals = [...existing.meals, newMeal];
        const nextCalories = nextMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
        const nextSugar = nextMeals.reduce((sum, m) => sum + (m.sugarGrams || 0), 0);
        updatedLogs = nutritionLogs.map((l) =>
          l.date === dateStr
            ? {
                ...l,
                meals: nextMeals,
                caloriesConsumed: nextCalories,
                sugarGrams: nextSugar,
              }
            : l
        );
      } else {
        const newLog: DailyNutritionLog = {
          date: dateStr,
          caloriesConsumed: newMeal.calories || 0,
          calorieGoal: preferences.defaultCalorieGoal,
          sugarGrams: newMeal.sugarGrams || 0,
          sugarLimitGrams: preferences.defaultSugarLimit,
          waterMl: 0,
          meals: [newMeal],
        };
        updatedLogs = [newLog, ...nutritionLogs];
      }
      saveNutritionLogs(updatedLogs);
    },
    [nutritionLogs, preferences.defaultCalorieGoal, preferences.defaultSugarLimit, saveNutritionLogs]
  );

  const deleteMealFromDate = useCallback(
    (dateStr: string, mealId: string) => {
      const updatedLogs = nutritionLogs.map((log) => {
        if (log.date !== dateStr) return log;
        const nextMeals = log.meals.filter((m) => m.id !== mealId);
        const nextCalories = nextMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
        const nextSugar = nextMeals.reduce((sum, m) => sum + (m.sugarGrams || 0), 0);
        return {
          ...log,
          meals: nextMeals,
          caloriesConsumed: nextCalories,
          sugarGrams: nextSugar,
        };
      });
      saveNutritionLogs(updatedLogs);
    },
    [nutritionLogs, saveNutritionLogs]
  );

  const updateWeightForDate = useCallback(
    (dateStr: string, weightKg: number) => {
      const existing = nutritionLogs.find((l) => l.date === dateStr);
      let updatedLogs: DailyNutritionLog[];
      if (existing) {
        updatedLogs = nutritionLogs.map((l) => (l.date === dateStr ? { ...l, weightKg } : l));
      } else {
        const newLog: DailyNutritionLog = {
          date: dateStr,
          caloriesConsumed: 0,
          calorieGoal: preferences.defaultCalorieGoal,
          sugarGrams: 0,
          sugarLimitGrams: preferences.defaultSugarLimit,
          weightKg,
          waterMl: 0,
          meals: [],
        };
        updatedLogs = [newLog, ...nutritionLogs];
      }
      saveNutritionLogs(updatedLogs);
    },
    [nutritionLogs, preferences.defaultCalorieGoal, preferences.defaultSugarLimit, saveNutritionLogs]
  );

  const updateWaterForDate = useCallback(
    (dateStr: string, amountDeltaMl: number) => {
      const existing = nutritionLogs.find((l) => l.date === dateStr);
      let updatedLogs: DailyNutritionLog[];
      if (existing) {
        updatedLogs = nutritionLogs.map((l) =>
          l.date === dateStr ? { ...l, waterMl: Math.max(0, (l.waterMl || 0) + amountDeltaMl) } : l
        );
      } else {
        const newLog: DailyNutritionLog = {
          date: dateStr,
          caloriesConsumed: 0,
          calorieGoal: preferences.defaultCalorieGoal,
          sugarGrams: 0,
          sugarLimitGrams: preferences.defaultSugarLimit,
          waterMl: Math.max(0, amountDeltaMl),
          meals: [],
        };
        updatedLogs = [newLog, ...nutritionLogs];
      }
      saveNutritionLogs(updatedLogs);
    },
    [nutritionLogs, preferences.defaultCalorieGoal, preferences.defaultSugarLimit, saveNutritionLogs]
  );

  // --- PET OPERATIONS ---
  const savePets = useCallback((items: PetProfile[]) => {
    setPetsState(items);
    saveStored(STORAGE_KEYS.PETS, items);
  }, []);

  const addPet = useCallback((pet: Omit<PetProfile, 'id'>) => {
    const newPet: PetProfile = {
      ...pet,
      id: `pet-${Date.now()}`,
    };
    savePets([...pets, newPet]);
    return newPet;
  }, [pets, savePets]);

  const updatePet = useCallback((id: string, updates: Partial<PetProfile>) => {
    savePets(pets.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, [pets, savePets]);

  const deletePet = useCallback((id: string) => {
    savePets(pets.filter((p) => p.id !== id));
    // clean up related records
    setMedicalRecordsState((prev) => {
      const next = prev.filter((r) => r.petId !== id);
      saveStored(STORAGE_KEYS.MEDICAL, next);
      return next;
    });
    setMedicationsState((prev) => {
      const next = prev.filter((m) => m.petId !== id);
      saveStored(STORAGE_KEYS.MEDS, next);
      return next;
    });
  }, [pets, savePets]);

  // --- MEDICAL RECORDS ---
  const saveMedicalRecords = useCallback((records: PetMedicalRecord[]) => {
    setMedicalRecordsState(records);
    saveStored(STORAGE_KEYS.MEDICAL, records);
  }, []);

  const addMedicalRecord = useCallback((record: Omit<PetMedicalRecord, 'id'>) => {
    const newRecord: PetMedicalRecord = {
      ...record,
      id: `med-${Date.now()}`,
    };
    saveMedicalRecords([newRecord, ...medicalRecords]);
    return newRecord;
  }, [medicalRecords, saveMedicalRecords]);

  const updateMedicalRecord = useCallback((id: string, updates: Partial<PetMedicalRecord>) => {
    saveMedicalRecords(medicalRecords.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, [medicalRecords, saveMedicalRecords]);

  const deleteMedicalRecord = useCallback((id: string) => {
    saveMedicalRecords(medicalRecords.filter((r) => r.id !== id));
  }, [medicalRecords, saveMedicalRecords]);

  // --- MEDICATIONS ---
  const saveMedications = useCallback((meds: PetMedication[]) => {
    setMedicationsState(meds);
    saveStored(STORAGE_KEYS.MEDS, meds);
  }, []);

  const addMedication = useCallback((med: Omit<PetMedication, 'id'>) => {
    const newMed: PetMedication = {
      ...med,
      id: `rx-${Date.now()}`,
    };
    saveMedications([newMed, ...medications]);
    return newMed;
  }, [medications, saveMedications]);

  const updateMedication = useCallback((id: string, updates: Partial<PetMedication>) => {
    saveMedications(medications.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }, [medications, saveMedications]);

  const deleteMedication = useCallback((id: string) => {
    saveMedications(medications.filter((m) => m.id !== id));
  }, [medications, saveMedications]);

  // --- CALENDAR EVENTS ---
  const saveCalendarEvents = useCallback((events: CalendarEvent[]) => {
    setCalendarEventsState(events);
    saveStored(STORAGE_KEYS.EVENTS, events);
  }, []);

  const addCalendarEvent = useCallback((event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: `evt-${Date.now()}`,
    };
    saveCalendarEvents([newEvent, ...calendarEvents]);
    return newEvent;
  }, [calendarEvents, saveCalendarEvents]);

  const deleteCalendarEvent = useCallback((id: string) => {
    saveCalendarEvents(calendarEvents.filter((e) => e.id !== id));
  }, [calendarEvents, saveCalendarEvents]);

  // --- NOTES OPERATIONS ---
  const saveNotes = useCallback((items: NoteItem[]) => {
    setNotesState(items);
    saveStored(STORAGE_KEYS.NOTES, items);
  }, []);

  const addNote = useCallback((note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: NoteItem = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    saveNotes([newNote, ...notes]);
    return newNote;
  }, [notes, saveNotes]);

  const updateNote = useCallback((id: string, updates: Partial<NoteItem>) => {
    const updated = notes.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    saveNotes(updated);
  }, [notes, saveNotes]);

  const deleteNote = useCallback((id: string) => {
    saveNotes(notes.filter((item) => item.id !== id));
  }, [notes, saveNotes]);

  const togglePinNote = useCallback((id: string) => {
    const updated = notes.map((item) =>
      item.id === id ? { ...item, isPinned: !item.isPinned, updatedAt: new Date().toISOString() } : item
    );
    saveNotes(updated);
  }, [notes, saveNotes]);

  // --- DREAM CATCHER OPERATIONS ---
  const saveDreamLogs = useCallback((logs: DreamLog[]) => {
    setDreamLogsState(logs);
    saveStored(STORAGE_KEYS.DREAMS, logs);
  }, []);

  const addDreamLog = useCallback((log: Omit<DreamLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newLog: DreamLog = {
      ...log,
      id: `dream-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    saveDreamLogs([newLog, ...dreamLogs]);
    return newLog;
  }, [dreamLogs, saveDreamLogs]);

  const updateDreamLog = useCallback((id: string, updates: Partial<DreamLog>) => {
    const updated = dreamLogs.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
    );
    saveDreamLogs(updated);
  }, [dreamLogs, saveDreamLogs]);

  const deleteDreamLog = useCallback((id: string) => {
    saveDreamLogs(dreamLogs.filter((item) => item.id !== id));
  }, [dreamLogs, saveDreamLogs]);

  // --- BACKUP & RESTORE ---
  const exportAllData = useCallback(() => {
    const bundle = {
      version: '1.1',
      exportedAt: new Date().toISOString(),
      preferences,
      mediaItems,
      nutritionLogs,
      pets,
      medicalRecords,
      medications,
      calendarEvents,
      notes,
      dreamLogs,
    };
    const jsonStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notome_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [preferences, mediaItems, nutritionLogs, pets, medicalRecords, medications, calendarEvents, notes, dreamLogs]);

  const importAllData = useCallback((jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.preferences) setPreferencesState(data.preferences);
      if (Array.isArray(data.mediaItems)) setMediaItemsState(data.mediaItems);
      if (Array.isArray(data.nutritionLogs)) setNutritionLogsState(data.nutritionLogs);
      if (Array.isArray(data.pets)) setPetsState(data.pets);
      if (Array.isArray(data.medicalRecords)) setMedicalRecordsState(data.medicalRecords);
      if (Array.isArray(data.medications)) setMedicationsState(data.medications);
      if (Array.isArray(data.calendarEvents)) setCalendarEventsState(data.calendarEvents);
      if (Array.isArray(data.notes)) setNotesState(data.notes);
      if (Array.isArray(data.dreamLogs)) setDreamLogsState(data.dreamLogs);

      if (data.preferences) saveStored(STORAGE_KEYS.PREFS, data.preferences);
      if (data.mediaItems) saveStored(STORAGE_KEYS.MEDIA, data.mediaItems);
      if (data.nutritionLogs) saveStored(STORAGE_KEYS.NUTRITION, data.nutritionLogs);
      if (data.pets) saveStored(STORAGE_KEYS.PETS, data.pets);
      if (data.medicalRecords) saveStored(STORAGE_KEYS.MEDICAL, data.medicalRecords);
      if (data.medications) saveStored(STORAGE_KEYS.MEDS, data.medications);
      if (data.calendarEvents) saveStored(STORAGE_KEYS.EVENTS, data.calendarEvents);
      if (data.notes) saveStored(STORAGE_KEYS.NOTES, data.notes);
      if (data.dreamLogs) saveStored(STORAGE_KEYS.DREAMS, data.dreamLogs);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }, []);

  const resetToSeed = useCallback(() => {
    setPreferencesState(initialPreferences);
    setMediaItemsState(initialMediaItems);
    setNutritionLogsState(initialNutritionLogs);
    setPetsState(initialPets);
    setMedicalRecordsState(initialMedicalRecords);
    setMedicationsState(initialMedications);
    setCalendarEventsState(initialEvents);
    setNotesState(initialNotes);
    setDreamLogsState(initialDreamLogs);

    saveStored(STORAGE_KEYS.PREFS, initialPreferences);
    saveStored(STORAGE_KEYS.MEDIA, initialMediaItems);
    saveStored(STORAGE_KEYS.NUTRITION, initialNutritionLogs);
    saveStored(STORAGE_KEYS.PETS, initialPets);
    saveStored(STORAGE_KEYS.MEDICAL, initialMedicalRecords);
    saveStored(STORAGE_KEYS.MEDS, initialMedications);
    saveStored(STORAGE_KEYS.EVENTS, initialEvents);
    saveStored(STORAGE_KEYS.NOTES, initialNotes);
    saveStored(STORAGE_KEYS.DREAMS, initialDreamLogs);
  }, []);

  return {
    preferences,
    updatePreferences,
    toggleTheme,
    // Media
    mediaItems,
    addMediaItem,
    updateMediaItem,
    deleteMediaItem,
    incrementEpisode,
    // Nutrition
    nutritionLogs,
    getLogForDate,
    addMealToDate,
    deleteMealFromDate,
    updateWeightForDate,
    updateWaterForDate,
    // Pets
    pets,
    addPet,
    updatePet,
    deletePet,
    // Medical
    medicalRecords,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    // Medications
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    // Events
    calendarEvents,
    addCalendarEvent,
    deleteCalendarEvent,
    // Notes
    notes,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
    // Dream Catcher
    dreamLogs,
    addDreamLog,
    updateDreamLog,
    deleteDreamLog,
    // Backup
    exportAllData,
    importAllData,
    resetToSeed,
  };
}
