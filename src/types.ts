/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type MediaType = 'movie' | 'series';
export type MediaStatus = 'watchlist' | 'watching' | 'completed' | 'dropped';

export interface SeriesDetails {
  totalSeasons: number;
  totalEpisodes: number;
  currentSeason: number;
  currentEpisode: number;
}

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  status: MediaStatus;
  releaseDate?: string; // YYYY-MM-DD
  rating: number; // 1 to 10
  posterUrl?: string;
  genres: string[];
  notes?: string;
  seriesDetails?: SeriesDetails;
  scheduledWatchDate?: string; // YYYY-MM-DD
  updatedAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealItem {
  id: string;
  mealType: MealType;
  name: string;
  calories: number;
  sugarGrams: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  time: string; // HH:mm
}

export interface DailyNutritionLog {
  date: string; // YYYY-MM-DD
  caloriesConsumed: number;
  calorieGoal: number;
  sugarGrams: number;
  sugarLimitGrams: number;
  weightKg?: number;
  waterMl: number;
  notes?: string;
  meals: MealItem[];
}

export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
export type PetGender = 'male' | 'female';

export interface PetProfile {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  birthDate: string; // YYYY-MM-DD
  gender: PetGender;
  weightKg: number;
  microchipId?: string;
  avatarUrl?: string;
  allergies: string[];
  dietaryNotes?: string;
  vetClinicName?: string;
  emergencyContact?: string;
}

export type MedicalRecordType = 'vaccine' | 'checkup' | 'medication' | 'surgery' | 'deworming' | 'grooming' | 'lab';

export interface PetMedicalRecord {
  id: string;
  petId: string;
  type: MedicalRecordType;
  title: string;
  date: string; // YYYY-MM-DD
  nextDueDate?: string; // YYYY-MM-DD
  clinicName?: string;
  veterinarian?: string;
  cost?: number;
  notes?: string;
  completed: boolean;
}

export interface PetMedication {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  notes?: string;
}

export type EventCategory = 'media' | 'nutrition' | 'pet' | 'personal';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  category: EventCategory;
  description?: string;
  relatedId?: string; // Id of media, pet record, etc.
  isCompleted?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'cinema' | 'romantic';

export interface UserPreferences {
  theme: ThemeMode;
  language: 'id' | 'en';
  defaultCalorieGoal: number;
  defaultSugarLimit: number; // in grams
  weightUnit: 'kg' | 'lbs';
}

export interface InvitedUser {
  id: string;
  email: string;
  fullName?: string;
  notes?: string;
  role: 'primary_admin' | 'member';
  status: 'active' | 'revoked';
  invitedBy?: string;
  createdAt: string;
  lastLoginAt?: string;
}

// --- UPDATE LOG TYPES ---
export type UpdateLogCategory = 'fitur_baru' | 'perbaikan' | 'peningkatan' | 'rencana';

export interface UpdateLog {
  id: string;
  title: string;
  version: string;
  date: string; // YYYY-MM-DD
  category: UpdateLogCategory;
  description: string;
  likesCount: number;
  likedBy: string[]; // user email or identifier
  createdBy?: string;
  authorName?: string;
  createdAt: string;
  updatedAt?: string;
}

// --- NOTE MODULE TYPES ---
export interface FootnoteItem {
  id: string;
  index: number;
  label: string;
  content: string;
}

export type NoteCategory = 'idea' | 'project' | 'personal' | 'research' | 'archive';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  isPinned: boolean;
  color?: string;
  footnotes: FootnoteItem[];
  createdAt: string;
  updatedAt: string;
}

// --- DREAM CATCHER MODULE TYPES ---
export type DreamEmotion = 'happy' | 'neutral' | 'sad' | 'anxious';

export interface DreamLog {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  wakeTime?: string; // HH:mm
  tags: string[];
  emotion: DreamEmotion;
  clarityScore: number; // 1 to 5
  lucidityScore: number; // 1 to 5 (or 20% to 100%)
  isRecurring: boolean;
  isNightmare: boolean;
  interpretationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

