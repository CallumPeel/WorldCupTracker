import type { Fixture, MatchScore } from '../types';
import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown, formatFullPerthDate, getPerthTimeOnly } from '../utils/timezone';
import { CountryFlag } from './CountryFlag';

interface ScheduleMatchCardProps {
  fixture: Fixture;
  score?: MatchScore;
  watched?: boolean;
  onScoreClick: () => void;
  onWatchClick: () => void;
}

export function ScheduleMatchCard({
  fixture,
  score,
  watched,
  onScoreClick,
  onWatchClick,
}: ScheduleMatchCardProps) {
  const timeRemaining = useCountdown(fixture.date);
  const hasScore = !!score;
  const isPast = timeRemaining.isPast;

  return (
    <div 
      className={`border border-dark-border rounded-lg p-3 bg-dark-surface transition-all ${
        isPast && !hasScore ? 'opacity-60' : ''
      }`}
    >
      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-3 mb-2">
        {/* Home Team */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <CountryFlag countryCode={fixture.homeTeam.code} size="md" className="flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-bold truncate">{fixture.homeTeam.name}</span>
            <span className="text-xs text-gray-500">{fixture.homeTeam.code}</span>
          </div>
        </div>

        {/* Score or Time */}
        <div className="flex-shrink-0 px-2">
          {hasScore ? (
            <button
              onClick={onScoreClick}
              className="flex items-center gap-1.5 px-2 py-1 rounded bg-dark-elevated hover:bg-dark-border transition-colors"
            >
              <span className="text-lg font-bold tabular-nums">{score.homeScore}</span>
              <span className="text-gray-500 text-sm">-</span>
              <span className="text-lg font-bold tabular-nums">{score.awayScore}</span>
            </button>
          ) : (
            <div className="text-center">
              <div className="text-[10px] font-semibold text-gray-500 whitespace-nowrap">
                {formatFullPerthDate(fixture.date)}
              </div>
              <div className="text-sm font-semibold text-gray-400">
                {getPerthTimeOnly(fixture.date)}
              </div>
              {!isPast && (
                <div className="text-xs text-primary tabular-nums">
                  {formatCountdown(timeRemaining)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
          <CountryFlag countryCode={fixture.awayTeam.code} size="md" className="flex-shrink-0" />
          <div className="flex flex-col items-end min-w-0">
            <span className="font-bold truncate">{fixture.awayTeam.name}</span>
            <span className="text-xs text-gray-500">{fixture.awayTeam.code}</span>
          </div>
        </div>
      </div>

      {/* Metadata & Actions */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-gray-500">
          {/* Group/Stage */}
          {fixture.stage === 'GROUP_STAGE' && fixture.group && (
            <span className="px-1.5 py-0.5 bg-dark-elevated rounded font-semibold">
              Group {fixture.group}
            </span>
          )}
          {fixture.stage !== 'GROUP_STAGE' && (
            <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded font-semibold">
              {fixture.stage.replace('_', ' ')}
            </span>
          )}
          <span>{fixture.venue.city}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onWatchClick}
            className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
              watched
                ? 'bg-primary/20 text-primary'
                : 'bg-dark-elevated text-gray-400 hover:bg-dark-border'
            }`}
          >
            {watched ? '✓ Watched' : 'Mark Watched'}
          </button>
          
          {!hasScore && isPast && (
            <button
              onClick={onScoreClick}
              className="px-2 py-1 rounded text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-all"
            >
              Add Score
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
