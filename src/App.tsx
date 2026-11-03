/**
 * @license
 * SPDX-License-Identifier: Apache-2.0 done
 */

import React, { useState, useMemo } from 'react';
import { useStorage } from './hooks/useStorage';
import { useAuth } from './hooks/useAuth';
import { Navigation, ActiveTab } from './components/Navigation';
import { MediaView } from './components/MediaTracker/MediaView';
import { NutritionView } from './components/NutritionTracker/NutritionView';
import { PetView } from './components/PetTracker/PetView';
import { MasterCalendarView } from './components/MasterCalendar/MasterCalendarView';
import { SettingsModal } from './components/SettingsModal';
import { AuthView } from './components/Auth/AuthView';
import { getUpcomingAlerts } from './lib/notifications';
import { translations, Language } from './lib/translations';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('media');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const storage = useStorage();
  const auth = useAuth();

  const currentLanguage: Language = storage.preferences.language || 'id';

  // Compute upcoming alerts within 0-3 days window across all pillars
  const upcomingAlerts = useMemo(() => {
    return getUpcomingAlerts(
      storage.mediaItems,
      storage.medicalRecords,
      storage.pets,
      storage.calendarEvents,
      3
    );
  }, [storage.mediaItems, storage.medicalRecords, storage.pets, storage.calendarEvents]);

  const handleSelectLanguage = (lang: Language) => {
    storage.updatePreferences({ language: lang });
  };

  // If user is not authenticated, render Login & Account Creation Screen
  if (!auth.user) {
    return (
      <AuthView
        onSignInWithGoogle={auth.signInWithGoogle}
        onSignInWithEmail={auth.signInWithEmail}
        onSignUpWithEmail={auth.signUpWithEmail}
        isSupabaseConfigured={auth.isSupabaseConfigured}
        theme={storage.preferences.theme}
        onToggleTheme={storage.toggleTheme}
        language={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        error={auth.error}
      />
    );
  }

  const tNav = translations[currentLanguage].nav;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2D2823] dark:bg-[#161311] dark:text-[#EAE3DA] transition-colors duration-200">
      {/* 3-Zone Top Bar Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={storage.preferences.theme}
        onToggleTheme={storage.toggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        language={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        user={auth.user}
        onSignOut={auth.signOut}
        alerts={upcomingAlerts}
      />

      {/* Main Content Area - with mobile bottom padding to clear thumb navigation bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 md:pb-8">
        {activeTab === 'media' && (
          <MediaView
            mediaItems={storage.mediaItems}
            onAddItem={storage.addMediaItem}
            onUpdateItem={storage.updateMediaItem}
            onDeleteItem={storage.deleteMediaItem}
            onIncrementEpisode={storage.incrementEpisode}
            language={currentLanguage}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionView
            logs={storage.nutritionLogs}
            getLogForDate={storage.getLogForDate}
            onAddMeal={storage.addMealToDate}
            onDeleteMeal={storage.deleteMealFromDate}
            onUpdateWeight={storage.updateWeightForDate}
            onUpdateWater={storage.updateWaterForDate}
            calorieGoal={storage.preferences.defaultCalorieGoal}
            sugarLimit={storage.preferences.defaultSugarLimit}
            language={currentLanguage}
          />
        )}

        {activeTab === 'pets' && (
          <PetView
            pets={storage.pets}
            medicalRecords={storage.medicalRecords}
            medications={storage.medications}
            onAddPet={storage.addPet}
            onUpdatePet={storage.updatePet}
            onDeletePet={storage.deletePet}
            onAddMedicalRecord={storage.addMedicalRecord}
            onUpdateMedicalRecord={storage.updateMedicalRecord}
            onDeleteMedicalRecord={storage.deleteMedicalRecord}
            onAddMedication={storage.addMedication}
            onUpdateMedication={storage.updateMedication}
            onDeleteMedication={storage.deleteMedication}
            language={currentLanguage}
          />
        )}

        {activeTab === 'calendar' && (
          <MasterCalendarView
            customEvents={storage.calendarEvents}
            mediaItems={storage.mediaItems}
            nutritionLogs={storage.nutritionLogs}
            medicalRecords={storage.medicalRecords}
            pets={storage.pets}
            onAddEvent={storage.addCalendarEvent}
            onDeleteEvent={storage.deleteCalendarEvent}
            language={currentLanguage}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E5DDD2] dark:border-[#2D2722] py-6 mt-12 text-xs text-[#8F8275] dark:text-[#7A7067] mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-semibold text-[#2D2823] dark:text-[#EAE3DA]">
              Notome
            </span>
            <span>·</span>
            <span>
              {currentLanguage === 'id'
                ? 'Pusat Pribadi Hiburan, Nutrisi & Kesehatan Hewan'
                : 'Personal Entertainment, Nutrition & Pet Health Hub'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('media')}
              className="hover:text-[#2D2823] dark:hover:text-[#EAE3DA] transition-colors cursor-pointer"
            >
              {tNav.media}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('nutrition')}
              className="hover:text-[#2D2823] dark:hover:text-[#EAE3DA] transition-colors cursor-pointer"
            >
              {tNav.nutrition}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pets')}
              className="hover:text-[#2D2823] dark:hover:text-[#EAE3DA] transition-colors cursor-pointer"
            >
              {tNav.pets}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className="hover:text-[#2D2823] dark:hover:text-[#EAE3DA] transition-colors cursor-pointer"
            >
              {tNav.calendar}
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={storage.preferences}
        onUpdatePreferences={storage.updatePreferences}
        onExportData={storage.exportAllData}
        onImportData={storage.importAllData}
        onResetSeed={storage.resetToSeed}
        language={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
      />
    </div>
  );
}
