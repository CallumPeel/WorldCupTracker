import { format, formatDistanceToNow } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import type { TimeRemaining } from '../types';

const PERTH_TIMEZONE = 'Australia/Perth';

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
 * Converts a UTC date string to Perth time
 */
export function toPerthTime(dateString: string): Date {
  const date = new Date(dateString);
  return toZonedTime(date, PERTH_TIMEZONE);
}

/**
 * Formats a date string in Perth timezone
 */
export function formatPerthTime(dateString: string, formatString: string = 'PPp'): string {
  const perthTime = toPerthTime(dateString);
  return format(perthTime, formatString);
}

/**
 * Gets the Perth calendar date key for grouping fixtures by displayed date.
 */
export function getPerthDateKey(dateString: string): string {
  return formatPerthTime(dateString, 'yyyy-MM-dd');
}

export function formatFullPerthDate(date: Date | string): string {
  const perthTime = typeof date === 'string' ? toPerthTime(date) : date;
  const weekday = format(perthTime, 'EEEE');
  const month = format(perthTime, 'MMMM');
  const day = perthTime.getDate();

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
 * Checks if a match is happening today in Perth time
 */
export function isToday(dateString: string): boolean {
  const perthTime = toPerthTime(dateString);
  const now = toZonedTime(new Date(), PERTH_TIMEZONE);
  
  return (
    perthTime.getDate() === now.getDate() &&
    perthTime.getMonth() === now.getMonth() &&
    perthTime.getFullYear() === now.getFullYear()
  );
}

/**
 * Checks if a match is happening tomorrow in Perth time
 */
export function isTomorrow(dateString: string): boolean {
  const perthTime = toPerthTime(dateString);
  const tomorrow = toZonedTime(new Date(), PERTH_TIMEZONE);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return (
    perthTime.getDate() === tomorrow.getDate() &&
    perthTime.getMonth() === tomorrow.getMonth() &&
    perthTime.getFullYear() === tomorrow.getFullYear()
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
  return formatPerthTime(dateString, 'EEEE, MMMM d');
}

/**
 * Gets just the time in Perth timezone
 */
export function getPerthTimeOnly(dateString: string): string {
  return formatPerthTime(dateString, 'h:mm a');
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
