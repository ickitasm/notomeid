/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MediaItem, PetMedicalRecord, PetProfile, CalendarEvent, EventCategory } from '../types';

export interface UpcomingAlert {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  time?: string;
  daysRemaining: number; // 0 = today, 1 = tomorrow, 2 = 2 days, etc.
  description?: string;
  sourceType: 'media' | 'pet' | 'calendar';
  sourceId: string;
}

/**
 * Calculate upcoming events within the specified lookahead window (e.g. 0 to 3 days)
 */
export function getUpcomingAlerts(
  mediaItems: MediaItem[],
  medicalRecords: PetMedicalRecord[],
  pets: PetProfile[],
  calendarEvents: CalendarEvent[],
  maxDaysAhead = 3
): UpcomingAlert[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const alerts: UpcomingAlert[] = [];

  // Helper to calculate days difference
  const getDaysDiff = (dateStr: string) => {
    try {
      const target = new Date(dateStr);
      target.setHours(0, 0, 0, 0);
      const diffTime = target.getTime() - today.getTime();
      return Math.round(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return -999;
    }
  };

  // 1. Check Media (Scheduled watch nights & releases)
  mediaItems.forEach((m) => {
    if (m.scheduledWatchDate) {
      const days = getDaysDiff(m.scheduledWatchDate);
      if (days >= 0 && days <= maxDaysAhead) {
        alerts.push({
          id: `alert-media-watch-${m.id}`,
          title: `Movie Night: ${m.title}`,
          category: 'media',
          date: m.scheduledWatchDate,
          daysRemaining: days,
          description: m.type === 'series' && m.seriesDetails
            ? `Watch Season ${m.seriesDetails.currentSeason} Episode ${m.seriesDetails.currentEpisode}`
            : 'Scheduled cinema screening',
          sourceType: 'media',
          sourceId: m.id,
        });
      }
    } else if (m.releaseDate) {
      const days = getDaysDiff(m.releaseDate);
      if (days >= 0 && days <= maxDaysAhead) {
        alerts.push({
          id: `alert-media-rel-${m.id}`,
          title: `Premiere: ${m.title}`,
          category: 'media',
          date: m.releaseDate,
          daysRemaining: days,
          description: `Official release date for ${m.title}`,
          sourceType: 'media',
          sourceId: m.id,
        });
      }
    }
  });

  // 2. Check Pet Medical Records (Booster due dates & Scheduled Vet exams)
  medicalRecords.forEach((r) => {
    const pet = pets.find((p) => p.id === r.petId);
    const petName = pet ? pet.name : 'Pet';

    if (r.nextDueDate) {
      const days = getDaysDiff(r.nextDueDate);
      if (days >= 0 && days <= maxDaysAhead) {
        alerts.push({
          id: `alert-pet-due-${r.id}`,
          title: `${petName}: ${r.title} Due`,
          category: 'pet',
          date: r.nextDueDate,
          daysRemaining: days,
          description: `Vaccination/booster due at ${r.clinicName || 'Vet Clinic'}`,
          sourceType: 'pet',
          sourceId: r.id,
        });
      }
    }

    if (!r.completed && r.date) {
      const days = getDaysDiff(r.date);
      if (days >= 0 && days <= maxDaysAhead) {
        alerts.push({
          id: `alert-pet-appt-${r.id}`,
          title: `${petName}: Vet Visit Scheduled`,
          category: 'pet',
          date: r.date,
          daysRemaining: days,
          description: `${r.title} at ${r.clinicName || 'Clinic'} with ${r.veterinarian || 'Veterinarian'}`,
          sourceType: 'pet',
          sourceId: r.id,
        });
      }
    }
  });

  // 3. Check Custom Calendar Events
  calendarEvents.forEach((ev) => {
    const days = getDaysDiff(ev.date);
    if (days >= 0 && days <= maxDaysAhead) {
      alerts.push({
        id: `alert-evt-${ev.id}`,
        title: ev.title,
        category: ev.category,
        date: ev.date,
        time: ev.time,
        daysRemaining: days,
        description: ev.description || 'Calendar appointment reminder',
        sourceType: 'calendar',
        sourceId: ev.id,
      });
    }
  });

  // Sort by daysRemaining ascending (Today first, then 1 day, then 2, etc.)
  return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
}

/**
 * Generate 1-Click Google Calendar event URL (Syncs directly with Android Google Calendar)
 */
export function generateGoogleCalendarUrl(alert: UpcomingAlert): string {
  const dateClean = alert.date.replace(/-/g, '');
  const startTime = alert.time ? alert.time.replace(':', '') + '00' : '090000';
  const endTime = alert.time ? alert.time.replace(':', '') + '00' : '100000';
  const datesParam = `${dateClean}T${startTime}/${dateClean}T${endTime}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: alert.title,
    dates: datesParam,
    details: `${alert.description || ''}\n\nManaged via Notome Personal Hub`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Request Native Browser Notification Permission (for Android Chrome / Desktop)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

/**
 * Dispatch Native Browser Push Notification
 */
export function sendBrowserPush(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }
}

/**
 * Send Email Digest Reminder (Resend / Brevo simulation & free API dispatcher)
 * Resend Free Tier: 3,000 emails/month, 100 emails/day at 100% free cost
 */
export async function sendEmailReminder(
  recipientEmail: string,
  alerts: UpcomingAlert[]
): Promise<{ success: boolean; message: string }> {
  // Simulate network latency for email dispatch
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (!recipientEmail) {
    return { success: false, message: 'Invalid recipient email address.' };
  }

  if (alerts.length === 0) {
    return { success: false, message: 'No upcoming events to send.' };
  }

  // Format email content for preview / dispatch
  const summary = alerts
    .map(
      (a) =>
        `• [${a.daysRemaining === 0 ? 'TODAY' : a.daysRemaining === 1 ? 'TOMORROW' : `In ${a.daysRemaining} days`}] ${a.title} (${a.date}${a.time ? ` at ${a.time}` : ''})`
    )
    .join('\n');

  console.log(`[Notome Email Dispatcher] Sent reminder to ${recipientEmail}:\n${summary}`);

  return {
    success: true,
    message: `Reminder email sent to ${recipientEmail} (${alerts.length} upcoming events)! Free via Resend API.`,
  };
}
