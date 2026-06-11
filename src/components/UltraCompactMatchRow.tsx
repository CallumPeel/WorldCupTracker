import type { Fixture } from '../types';
import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown } from '../utils/timezone';
import { CountryFlag } from './CountryFlag';

interface UltraCompactMatchRowProps {
  fixture: Fixture;
  onClick?: () => void;
}

export function UltraCompactMatchRow({ fixture, onClick }: UltraCompactMatchRowProps) {
  const timeRemaining = useCountdown(fixture.date);

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 hover:bg-dark-elevated rounded-lg transition-colors border border-dark-border/50"
    >
      <div className="flex items-center justify-between gap-2 text-sm">
        {/* Teams */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <CountryFlag countryCode={fixture.homeTeam.code} size="sm" className="flex-shrink-0" />
          <span className="font-semibold truncate">{fixture.homeTeam.code}</span>
          <span className="text-gray-500">vs</span>
          <span className="font-semibold truncate">{fixture.awayTeam.code}</span>
          <CountryFlag countryCode={fixture.awayTeam.code} size="sm" className="flex-shrink-0" />
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!timeRemaining.isPast && (
            <span className="text-primary font-bold tabular-nums text-xs">
              {formatCountdown(timeRemaining)}
            </span>
          )}
          
          {/* Group badge */}
          {fixture.group && (
            <span className="px-1.5 py-0.5 bg-dark-elevated rounded text-xs font-semibold text-gray-400">
              {fixture.group}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
