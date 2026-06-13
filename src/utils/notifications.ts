/**
 * Notifications utility for match reminders
 * Uses the Web Notifications API where supported (with graceful fallbacks)
 */

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | null {
  if (!isNotificationSupported()) return null;
  return Notification.permission;
}

export async function showMatchReminder(
  homeTeam: string,
  awayTeam: string,
  minutesUntil: number
): Promise<void> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    console.warn('Cannot show notification: permission not granted');
    return;
  }

  try {
    const notification = new Notification('Match Starting Soon! ⚽', {
      body: `${homeTeam} vs ${awayTeam} starts in ${minutesUntil} minutes`,
      icon: '/football-ball.ico',
      badge: '/football-ball.ico',
      tag: `match-reminder-${homeTeam}-${awayTeam}`,
      requireInteraction: false,
      silent: false,
    });

    // Auto-close after 10 seconds
    setTimeout(() => notification.close(), 10000);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Schedules reminders for upcoming matches
 * This would ideally run in a service worker for background notifications
 */
export function scheduleMatchReminders() {
  // For now, this is a placeholder
  // In a production app, you'd use:
  // - Service Worker with Background Sync
  // - Periodic Background Sync API
  // - Or a server-side solution with push notifications
  
  console.log('Reminder scheduling would happen here');
  
  // For the client-side version, reminders can be checked on app load
  // and when the user navigates between pages
}
