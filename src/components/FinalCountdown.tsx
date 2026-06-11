import { useCountdown } from '../hooks/useCountdown';

const FINAL_DATE = '2026-07-19T22:00:00Z'; // World Cup 2026 Final

export function FinalCountdown() {
  const timeRemaining = useCountdown(FINAL_DATE);

  if (timeRemaining.isPast) {
    return (
      <div className="border border-dark-border rounded-xl p-4 bg-dark-surface">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Countdown to Final
        </h3>
        <div className="text-center py-2">
          <span className="text-3xl">🏆</span>
          <div className="text-sm text-gray-400 mt-1">Tournament Complete</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-dark-border rounded-xl p-4 bg-dark-surface">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        Countdown to Final
      </h3>
      <div className="flex items-baseline justify-center gap-2">
        <div className="text-center">
          <div className="text-3xl font-bold tabular-nums text-primary">{timeRemaining.days}</div>
          <div className="text-xs text-gray-500">days</div>
        </div>
        <span className="text-2xl text-gray-600">:</span>
        <div className="text-center">
          <div className="text-3xl font-bold tabular-nums text-primary">{timeRemaining.hours}</div>
          <div className="text-xs text-gray-500">hrs</div>
        </div>
        <span className="text-2xl text-gray-600">:</span>
        <div className="text-center">
          <div className="text-3xl font-bold tabular-nums text-primary">{timeRemaining.minutes}</div>
          <div className="text-xs text-gray-500">min</div>
        </div>
      </div>
    </div>
  );
}
