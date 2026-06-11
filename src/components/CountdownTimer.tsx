import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown, getRelativeTime } from '../utils/timezone';

interface CountdownTimerProps {
  date: string;
  compact?: boolean;
}

export function CountdownTimer({ date, compact = false }: CountdownTimerProps) {
  const timeRemaining = useCountdown(date);

  if (timeRemaining.isPast) {
    return (
      <div className="text-gray-400 text-sm">
        {compact ? 'Started' : 'Match started'}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="text-primary font-semibold tabular-nums">
        {formatCountdown(timeRemaining)}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-2xl font-bold text-primary tabular-nums">
        {formatCountdown(timeRemaining)}
      </div>
      <div className="text-xs text-gray-400">
        {getRelativeTime(date)}
      </div>
    </div>
  );
}
