/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useStorage } from './hooks/useStorage';
import { useAuth } from './hooks/useAuth';
import { Navigation, ActiveTab } from './components/Navigation';
import { MediaView } from './components/MediaTracker/MediaView';
import { NutritionView } from './components/NutritionTracker/NutritionView';
import { PetView } from './components/PetTracker/PetView';
import { MasterCalendarView } from './components/MasterCalendar/MasterCalendarView';
import { NotesView } from './components/Notes/NotesView';
import { DreamCatcherView } from './components/DreamCatcher/DreamCatcherView';
import { SettingsModal } from './components/SettingsModal';
import { AuthView } from './components/Auth/AuthView';
import { AccessDeniedView } from './components/Auth/AccessDeniedView';
import { AdminPanelModal } from './components/Admin/AdminPanelModal';
import { getUpcomingAlerts } from './lib/notifications';
import { translations, Language } from './lib/translations';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('media');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const storage = useStorage();
  const auth = useAuth();

  const currentLanguage: Language = storage.preferences.language || 'id';

  // Auto-dismiss notice after 7 seconds
  useEffect(() => {
    if (auth.notice) {
      const timer = setTimeout(() => {
        auth.clearNotice();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [auth.notice, auth.clearNotice]);

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

  // If user is not authenticated, render pure Google Invite-Only Login Screen
  if (!auth.user) {
    return (
      <AuthView
        onSignInWithGoogle={auth.signInWithGoogle}
        isSupabaseConfigured={auth.isSupabaseConfigured}
        theme={storage.preferences.theme}
        onToggleTheme={storage.toggleTheme}
        language={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        error={auth.error}
        notice={auth.notice}
        onClearNotice={auth.clearNotice}
      />
    );
  }

  // If checking whitelist status
  if (auth.checkingWhitelist) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] text-[#2D2823] dark:bg-[#161311] dark:text-[#EAE3DA]">
        <div className="w-10 h-10 rounded-xl bg-[#C85A32] flex items-center justify-center text-white font-serif font-bold text-lg mb-3 shadow-md animate-pulse">
          N
        </div>
        <p className="text-xs font-mono text-[#8F8275]">
          {currentLanguage === 'id' ? 'Memeriksa otorisasi akses whitelist...' : 'Checking whitelist authorization...'}
        </p>
      </div>
    );
  }

  // If user is logged in, but not authorized (not primary admin and not whitelisted)
  if (auth.isWhitelisted === false && !auth.isPrimaryAdmin) {
    return (
      <AccessDeniedView
        user={auth.user}
        onSignOut={auth.signOut}
        language={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        theme={storage.preferences.theme}
        onToggleTheme={storage.toggleTheme}
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
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        isPrimaryAdmin={auth.isPrimaryAdmin}
        language={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        user={auth.user}
        onSignOut={auth.signOut}
        alerts={upcomingAlerts}
      />

      {/* Main Content Area - with mobile bottom padding to clear thumb navigation bar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-28 sm:pb-32 md:pb-8">
        {/* Verification / Auth Alert Banner */}
        {auth.notice && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-3 shadow-xs transition-all ${
              auth.notice.type === 'success'
                ? 'bg-[#5B7A58]/15 border-[#5B7A58]/35 text-[#2D2823] dark:text-[#EAE3DA]'
                : auth.notice.type === 'error'
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {auth.notice.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-[#5B7A58] shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-medium leading-relaxed">
                {auth.notice.message}
              </span>
            </div>
            <button
              type="button"
              onClick={auth.clearNotice}
              className="p-1 rounded-md text-[#8F8275] hover:text-[#2D2823] dark:hover:text-[#EAE3DA] cursor-pointer"
              title="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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

        {activeTab === 'notes' && (
          <NotesView
            notes={storage.notes}
            onAddNote={storage.addNote}
            onUpdateNote={storage.updateNote}
            onDeleteNote={storage.deleteNote}
            onTogglePin={storage.togglePinNote}
            language={currentLanguage}
          />
        )}

        {activeTab === 'dreams' && (
          <DreamCatcherView
            dreams={storage.dreamLogs}
            onAddDream={storage.addDreamLog}
            onUpdateDream={storage.updateDreamLog}
            onDeleteDream={storage.deleteDreamLog}
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
                ? 'Santuari Pribadi Hiburan, Nutrisi, Hewan, Catatan & Mimpi'
                : 'Personal Hub for Cinema, Nutrition, Pets, Notes & Dreams'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
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
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className="hover:text-[#2D2823] dark:hover:text-[#EAE3DA] transition-colors cursor-pointer"
            >
              {tNav.notes}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dreams')}
              className="hover:text-[#2D2823] dark:hover:text-[#EAE3DA] transition-colors cursor-pointer"
            >
              {tNav.dreams}
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
        onClearAllData={storage.clearAllData}
        language={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* Primary Admin Management Panel */}
      {auth.isPrimaryAdmin && (
        <AdminPanelModal
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          invitedUsers={auth.invitedUsers}
          onAddUser={auth.addInvitedUser}
          onUpdateStatus={auth.updateInvitedUserStatus}
          onDeleteUser={auth.deleteInvitedUser}
          language={currentLanguage}
        />
      )}
    </div>
  );
}
