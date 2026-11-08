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
import { UpdateLogsModal } from './components/UpdateLogs/UpdateLogsModal';
import { useUpdateLogs } from './hooks/useUpdateLogs';
import { getUpcomingAlerts } from './lib/notifications';
import { translations, Language } from './lib/translations';
import { ChristmasSnowEffect } from './components/ChristmasSnowEffect';
import { useMaintenance } from './hooks/useMaintenance';
import { MaintenanceView } from './components/Maintenance/MaintenanceView';
import { BrandLogo } from './components/Brand/BrandLogo';
import { useDeviceDetection } from './hooks/useDeviceDetection';
import { DesktopBlockedView } from './components/Common/DesktopBlockedView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('media');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isUpdateLogsOpen, setIsUpdateLogsOpen] = useState(false);

  const storage = useStorage();
  const auth = useAuth();
  const updateLogs = useUpdateLogs();
  const maintenance = useMaintenance();
  const device = useDeviceDetection();

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

  // Desktop Restriction Gate: Access closed on desktop PC/Laptop
  // People can only access via iPhone, Android, or Tablet devices
  if (device.isDesktop && !device.hasAdminOverride && !auth.isPrimaryAdmin) {
    return (
      <DesktopBlockedView
        language={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        theme={storage.preferences.theme}
        onToggleTheme={storage.toggleTheme}
        onAdminOverride={() => device.setAdminOverride(true)}
      />
    );
  }

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
        <div className="mb-4">
          <BrandLogo size="lg" animatePulse />
        </div>
        <p className="text-xs font-mono text-[#8F8275]">
          {currentLanguage === 'id' ? 'Memeriksa otorisasi akses whitelist...' : 'Checking whitelist authorization...'}
        </p>
      </div>
    );
  }

  // If system maintenance mode is active AND user is NOT primary admin, hold on Maintenance screen
  if (maintenance.isMaintenance && !auth.isPrimaryAdmin) {
    return (
      <MaintenanceView
        user={auth.user}
        reason={maintenance.reason}
        activatedAt={maintenance.activatedAt}
        onSignOut={auth.signOut}
        language={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        theme={storage.preferences.theme}
        onToggleTheme={storage.toggleTheme}
      />
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
      {storage.preferences.theme === 'christmas' && <ChristmasSnowEffect />}
      {/* Primary Admin Active Maintenance Indicator Banner */}
      {maintenance.isMaintenance && auth.isPrimaryAdmin && (
        <div className="bg-rose-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3 shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0" />
            <span className="truncate">
              {currentLanguage === 'id'
                ? 'Mode Pemeliharaan Aktif — Pengguna umum tertahan di layar maintenance. Anda memiliki akses penuh sebagai Primary Admin.'
                : 'Maintenance Mode Active — Members held on maintenance screen. You have full admin access.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => maintenance.setMaintenanceMode(false, '', auth.user?.email)}
            className="px-3 py-1 rounded-lg bg-white text-rose-700 text-xs font-bold hover:bg-rose-50 transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            {currentLanguage === 'id' ? 'Buka Akses Normal' : 'Resume Access'}
          </button>
        </div>
      )}
      {/* 3-Zone Top Bar Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={storage.preferences.theme}
        onToggleTheme={storage.toggleTheme}
        onSetTheme={storage.setTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenUpdateLogs={() => setIsUpdateLogsOpen(true)}
        isPrimaryAdmin={auth.isPrimaryAdmin}
        language={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
        user={auth.user}
        onSignOut={auth.signOut}
        alerts={upcomingAlerts}
      />

      {/* Main Content Area - Responsive editorial shell with generous standard desktop width */}
      <main className="flex-1 max-w-2xl sm:max-w-3xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 pb-28 sm:pb-32 md:pb-12 min-w-0">
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
            onDecrementEpisode={storage.decrementEpisode}
            language={currentLanguage}
          />
        )}

        {activeTab === 'nutrition' && (
          <NutritionView
            logs={storage.nutritionLogs}
            getLogForDate={storage.getLogForDate}
            onAddMeal={storage.addMealToDate}
            onUpdateMeal={storage.updateMealInDate}
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
            onUpdateEvent={storage.updateCalendarEvent}
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

      {/* Quiet Editorial Footer - Hidden on mobile screens to preserve native mobile app feel */}
      <footer className="hidden md:block border-t border-[#E5DDD2] dark:border-[#2D2722] py-6 mt-12 text-xs text-[#8F8275] dark:text-[#7A7067]">
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
          onRefresh={auth.fetchInvitedUsers}
          language={currentLanguage}
          isMaintenance={maintenance.isMaintenance}
          maintenanceReason={maintenance.reason}
          onToggleMaintenance={(enabled, reason) =>
            maintenance.setMaintenanceMode(enabled, reason, auth.user?.email)
          }
        />
      )}

      {/* Public Update Logs & Roadmap Modal with Interactive Likes */}
      <UpdateLogsModal
        isOpen={isUpdateLogsOpen}
        onClose={() => setIsUpdateLogsOpen(false)}
        logs={updateLogs.logs}
        isPrimaryAdmin={auth.isPrimaryAdmin}
        currentUserEmail={auth.user?.email}
        onAddLog={updateLogs.addLog}
        onUpdateLog={updateLogs.updateLog}
        onDeleteLog={updateLogs.deleteLog}
        onToggleLike={updateLogs.toggleLike}
        language={currentLanguage}
      />
    </div>
  );
}
