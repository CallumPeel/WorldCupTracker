import { useState, useEffect } from 'react';
import type { TimeRemaining } from '../types';
import { getTimeRemaining } from '../utils/timezone';

/**
 * Hook that provides a live countdown to a specific date
 */
export function useCountdown(dateString: string): TimeRemaining {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    getTimeRemaining(dateString)
  );

  useEffect(() => {
    // Update immediately
    setTimeRemaining(getTimeRemaining(dateString));

    // Then update every second
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(dateString));
    }, 1000);

    return () => clearInterval(interval);
  }, [dateString]);

  return timeRemaining;
}
