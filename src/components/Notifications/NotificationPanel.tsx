/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Mail,
  Calendar as CalendarIcon,
  Check,
  X,
  ExternalLink,
  Clock,
  Sparkles,
  Smartphone,
  AlertCircle,
  Film,
  HeartPulse,
} from 'lucide-react';
import {
  UpcomingAlert,
  generateGoogleCalendarUrl,
  sendEmailReminder,
  requestNotificationPermission,
  sendBrowserPush,
} from '../../lib/notifications';
import { Language } from '../../lib/translations';

interface NotificationPanelProps {
  alerts: UpcomingAlert[];
  userEmail?: string;
  language?: Language;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  alerts,
  userEmail = 'mike777rafael@gmail.com',
  language = 'id',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [browserPushEnabled, setBrowserPushEnabled] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const panelRef = useRef<HTMLDivElement>(null);
  const isId = language === 'id';

  // Filter out dismissed alerts
  const activeAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));
  const unreadCount = activeAlerts.length;

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const handleSendAllEmail = async () => {
    if (activeAlerts.length === 0) return;
    setIsSendingEmail(true);
    setStatusMessage(null);
    const result = await sendEmailReminder(userEmail, activeAlerts);
    setIsSendingEmail(false);
    setStatusMessage(
      isId
        ? `Ringkasan ${activeAlerts.length} jadwal terkirim ke ${userEmail}!`
        : result.message
    );
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSendSingleEmail = async (alert: UpcomingAlert) => {
    setIsSendingEmail(true);
    const result = await sendEmailReminder(userEmail, [alert]);
    setIsSendingEmail(false);
    setStatusMessage(
      isId
        ? `Pengingat "${alert.title}" terkirim ke ${userEmail}!`
        : result.message
    );
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleEnableBrowserPush = async () => {
    const granted = await requestNotificationPermission();
    setBrowserPushEnabled(granted);
    if (granted) {
      sendBrowserPush(
        isId ? 'Notifikasi Notome Aktif' : 'Notome Alerts Enabled',
        isId
          ? 'Anda akan menerima pengingat jadwal film, anabul, dan agenda kalender.'
          : 'You will receive alerts for upcoming movie watch dates and pet vet care.'
      );
      setStatusMessage(isId ? 'Notifikasi peramban/HP diaktifkan!' : 'Phone / Browser notifications enabled!');
      setTimeout(() => setStatusMessage(null), 3500);
    } else {
      setStatusMessage(
        isId
          ? 'Izin notifikasi belum diberikan di setelan peramban Anda.'
          : 'Permission was not granted in browser settings.'
      );
      setTimeout(() => setStatusMessage(null), 3500);
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'media':
        return {
          label: isId ? 'Film & Serial' : 'Cinema & Series',
          color: '#C85A32',
          bg: 'bg-[#C85A32]/10',
          icon: Film,
        };
      case 'pet':
        return {
          label: isId ? 'Kesehatan Hewan' : 'Pet Care',
          color: '#A86438',
          bg: 'bg-[#A86438]/10',
          icon: HeartPulse,
        };
      default:
        return {
          label: isId ? 'Kalender Utama' : 'Master Calendar',
          color: '#C4933F',
          bg: 'bg-[#C4933F]/10',
          icon: CalendarIcon,
        };
    }
  };

  return (
    <div ref={panelRef} className="relative">
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isId ? 'Lihat notifikasi kalender' : 'View notifications and upcoming alerts'}
        className="relative min-w-[38px] min-h-[38px] px-2 flex items-center justify-center rounded-xl border border-[#E0D7CB] dark:border-[#38312B] bg-[#FFFDF9] dark:bg-[#1C1815] text-[#594E44] dark:text-[#C5B8AA] hover:text-[#2B241E] dark:hover:text-[#EFE9E2] hover:bg-[#EFE8DD] dark:hover:bg-[#28221D] active:scale-95 transition-all touch-manipulation cursor-pointer"
        title={isId ? `Notifikasi Kalender (${unreadCount} acara minggu ini)` : `Upcoming Calendar Alerts (${unreadCount} this week)`}
      >
        <Bell className="w-4 h-4 text-[#C85A32]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-[#C85A32] text-white text-[10px] font-bold font-mono flex items-center justify-center shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[92vw] rounded-2xl border border-[#E4DCDB] dark:border-[#352F2B] bg-[#FFFDF9] dark:bg-[#1C1815] shadow-2xl z-50 text-xs overflow-hidden max-h-[85vh] flex flex-col origin-top-right">
          {/* Header */}
          <div className="p-3.5 border-b border-[#EAE2D8] dark:border-[#2E2823] flex items-center justify-between bg-[#F7F2EB]/90 dark:bg-[#221C18]/90 backdrop-blur-xs">
            <div>
              <div className="font-serif font-bold text-sm text-[#2B241E] dark:text-[#EFE9E2] flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-[#C85A32]" />
                <span>{isId ? 'Notifikasi Kalender' : 'Calendar Notifications'}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#C85A32]/15 text-[#C85A32] font-semibold">
                  {unreadCount} {isId ? 'acara' : 'active'}
                </span>
              </div>
              <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] mt-0.5">
                {isId ? 'Jadwal terintegrasi minggu ini (7 hari ke depan)' : 'Integrated schedule for the next 7 days'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-[#EFE8DD] dark:hover:bg-[#2A2420] text-[#7B6F63] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status notification toast */}
          {statusMessage && (
            <div className="p-2.5 mx-3 mt-2.5 rounded-lg bg-[#5B7A58]/15 border border-[#5B7A58]/30 text-[#5B7A58] text-[11px] font-medium flex items-center gap-2">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Quick Action Bar */}
          <div className="p-2.5 bg-white/50 dark:bg-[#161311]/50 border-b border-[#EAE2D8] dark:border-[#2E2823] flex items-center gap-2">
            <button
              type="button"
              onClick={handleSendAllEmail}
              disabled={isSendingEmail || activeAlerts.length === 0}
              className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#C85A32] text-white font-medium text-[11px] hover:bg-[#B34B25] disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5 shadow-xs touch-manipulation cursor-pointer"
              title={isId ? 'Kirim ringkasan seluruh jadwal ke Gmail Anda' : 'Send email digest to your Gmail'}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>
                {isSendingEmail
                  ? (isId ? 'Mengirim...' : 'Sending...')
                  : (isId ? 'Kirim ke Email' : 'Email Me All')}
              </span>
            </button>

            {!browserPushEnabled ? (
              <button
                type="button"
                onClick={handleEnableBrowserPush}
                className="py-1.5 px-2.5 rounded-lg border border-[#E0D7CB] dark:border-[#38312B] hover:bg-[#F3ECE4] dark:hover:bg-[#25201C] text-[11px] font-medium text-[#594E44] dark:text-[#C5B8AA] flex items-center gap-1 transition-colors touch-manipulation cursor-pointer"
                title={isId ? 'Aktifkan notifikasi browser di HP/komputer' : 'Enable Phone Push Notifications'}
              >
                <Smartphone className="w-3.5 h-3.5 text-[#8C6D4F]" />
                <span>{isId ? 'Notif Web HP' : 'Phone Push'}</span>
              </button>
            ) : (
              <span className="text-[10px] text-[#5B7A58] font-medium flex items-center gap-1 px-1">
                <Check className="w-3 h-3" /> {isId ? 'Notif Aktif' : 'Push on'}
              </span>
            )}
          </div>

          {/* Alerts List */}
          <div className="overflow-y-auto divide-y divide-[#EAE2D8] dark:divide-[#2E2823] p-1 flex-1">
            {activeAlerts.length === 0 ? (
              <div className="py-8 text-center text-[#8F8275] space-y-1">
                <Sparkles className="w-6 h-6 mx-auto text-[#C4933F] mb-1" />
                <div className="font-serif font-medium text-xs">
                  {isId ? 'Semua Terkendali!' : 'All clear for now!'}
                </div>
                <div className="text-[11px]">
                  {isId
                    ? 'Tidak ada jadwal kalender dalam 7 hari ke depan.'
                    : 'No events scheduled in the next 7 days.'}
                </div>
              </div>
            ) : (
              activeAlerts.map((alert) => {
                const theme = getCategoryTheme(alert.category);
                const Icon = theme.icon;
                const isToday = alert.daysRemaining === 0;
                const isTomorrow = alert.daysRemaining === 1;

                return (
                  <div
                    key={alert.id}
                    className="p-3 hover:bg-[#F9F5EF] dark:hover:bg-[#25201C] transition-colors rounded-xl space-y-1.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-wide ${
                            isToday
                              ? 'bg-[#C85A32] text-white'
                              : isTomorrow
                              ? 'bg-[#D9822B] text-white'
                              : 'bg-[#EFE8DD] dark:bg-[#28221D] text-[#7B6F63]'
                          }`}
                        >
                          {isToday
                            ? (isId ? 'Hari Ini' : 'Today')
                            : isTomorrow
                            ? (isId ? 'Besok' : 'Tomorrow')
                            : isId
                            ? `${alert.daysRemaining} hari lagi`
                            : `In ${alert.daysRemaining} days`}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${theme.bg}`}
                          style={{ color: theme.color }}
                        >
                          {theme.label}
                        </span>
                        <span className="text-[10px] text-[#8F8275] font-mono">
                          · {alert.date} {alert.time ? `(${alert.time})` : ''}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDismiss(alert.id)}
                        className="text-[#8F8275] hover:text-[#2B241E] p-0.5 cursor-pointer"
                        title={isId ? 'Abaikan notifikasi' : 'Dismiss alert'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="font-serif font-bold text-xs text-[#2B241E] dark:text-[#EFE9E2] flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: theme.color }} />
                      <span className="truncate">{alert.title}</span>
                    </div>

                    {alert.description && (
                      <p className="text-[11px] text-[#7B6F63] dark:text-[#9F9184] line-clamp-1 leading-relaxed">
                        {alert.description}
                      </p>
                    )}

                    {/* Action buttons per notification item */}
                    <div className="pt-1 flex items-center gap-2 text-[10px]">
                      {/* 1-Click Sync to Google Calendar on Android */}
                      <a
                        href={generateGoogleCalendarUrl(alert)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#1C1815] text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#F3ECE4] font-medium transition-colors"
                        title={isId ? 'Sinkronkan dengan Google Calendar HP' : 'Sync with Google Calendar'}
                      >
                        <CalendarIcon className="w-3 h-3 text-[#C4933F]" />
                        <span>Google Calendar</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>

                      {/* Individual Email reminder button */}
                      <button
                        type="button"
                        onClick={() => handleSendSingleEmail(alert)}
                        disabled={isSendingEmail}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-[#E0D7CB] dark:border-[#38312B] bg-white dark:bg-[#1C1815] text-[#594E44] dark:text-[#C5B8AA] hover:bg-[#F3ECE4] font-medium transition-colors cursor-pointer"
                        title={isId ? 'Kirim pengingat acara ini ke email' : 'Email this alert to Gmail'}
                      >
                        <Mail className="w-3 h-3 text-[#C85A32]" />
                        <span>{isId ? 'Kirim Email' : 'Email Me'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Notice */}
          <div className="p-2.5 bg-[#FAF7F2] dark:bg-[#161311] border-t border-[#EAE2D8] dark:border-[#2E2823] text-[10px] text-[#8F8275] text-center">
            {isId
              ? 'Terintegrasi otomatis dari Kalender Utama, Film & Serial, dan Kesehatan Anabul.'
              : 'Integrated automatically from Master Calendar, Cinema & Series, and Pet Care.'}
          </div>
        </div>
      )}
    </div>
  );
};
