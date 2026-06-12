import { format, formatDistanceToNow } from 'date-fns';
import type { TimeRemaining } from '../types';

export function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';

  switch (day % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Converts an ISO date string to a Date in the user's local timezone.
 *
 * Fixture dates are stored as absolute instants, so the browser automatically
 * renders the same kickoff moment in the viewer's own local timezone.
 */
export function toLocalTime(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Formats a date string in the user's local timezone.
 */
export function formatLocalTime(dateString: string, formatString: string = 'PPp'): string {
  return format(toLocalTime(dateString), formatString);
}

/**
 * Gets the user's local calendar date key for grouping fixtures by displayed date.
 */
export function getLocalDateKey(dateString: string): string {
  return formatLocalTime(dateString, 'yyyy-MM-dd');
}

export function getLocalDateFromKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatFullLocalDate(date: Date | string): string {
  const localTime = typeof date === 'string' ? toLocalTime(date) : date;
  const weekday = format(localTime, 'EEEE');
  const month = format(localTime, 'MMMM');
  const day = localTime.getDate();

  return `${weekday} ${day}${getOrdinalSuffix(day)} ${month}`;
}

/**
 * Gets a relative time string (e.g., "in 2 days")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Calculates time remaining until a match
 */
export function getTimeRemaining(dateString: string): TimeRemaining {
  const now = new Date();
  const matchTime = new Date(dateString);
  const diff = matchTime.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    };
  }

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
    isPast: false,
  };
}

/**
 * Checks if a match is happening today in the user's local timezone.
 */
export function isToday(dateString: string): boolean {
  const localTime = toLocalTime(dateString);
  const now = new Date();
  
  return (
    localTime.getDate() === now.getDate() &&
    localTime.getMonth() === now.getMonth() &&
    localTime.getFullYear() === now.getFullYear()
  );
}

/**
 * Checks if a match is happening tomorrow in the user's local timezone.
 */
export function isTomorrow(dateString: string): boolean {
  const localTime = toLocalTime(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    localTime.getDate() === tomorrow.getDate() &&
    localTime.getMonth() === tomorrow.getMonth() &&
    localTime.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Gets a friendly date label (Today, Tomorrow, or formatted date)
 */
export function getFriendlyDateLabel(dateString: string): string {
  if (isToday(dateString)) {
    return 'Today';
  }
  if (isTomorrow(dateString)) {
    return 'Tomorrow';
  }
  return formatLocalTime(dateString, 'EEEE, MMMM d');
}

/**
 * Gets just the time in the user's local timezone.
 */
export function getLocalTimeOnly(dateString: string): string {
  return formatLocalTime(dateString, 'h:mm a');
}

/**
 * Formats countdown display
 */
export function formatCountdown(timeRemaining: TimeRemaining): string {
  if (timeRemaining.isPast) {
    return 'Match started';
  }

  if (timeRemaining.days > 0) {
    return `${timeRemaining.days}d ${timeRemaining.hours}h`;
  }

  if (timeRemaining.hours > 0) {
    return `${timeRemaining.hours}h ${timeRemaining.minutes}m`;
  }

  if (timeRemaining.minutes > 0) {
    return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`;
  }

  return `${timeRemaining.seconds}s`;
}
