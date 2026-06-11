import type { Fixture, MatchScore } from '../types';
import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown, formatFullPerthDate, getPerthTimeOnly } from '../utils/timezone';
import { CountryFlag } from './CountryFlag';

const favoriteTeamAccents: Record<
  string,
  { border: string; glow: string; gradient: string; pill: string; confetti: string[] }
> = {
  ENG: {
    border: '#ff3b5f',
    glow: 'rgba(255, 59, 95, 0.5)',
    gradient: 'linear-gradient(135deg, rgba(255, 59, 95, 0.18), rgba(255, 255, 255, 0.08), rgba(10, 132, 255, 0.08))',
    pill: 'England match',
    confetti: ['#ff3b5f', '#ffffff', '#7dd3fc'],
  },
  AUS: {
    border: '#facc15',
    glow: 'rgba(250, 204, 21, 0.45)',
    gradient: 'linear-gradient(135deg, rgba(250, 204, 21, 0.18), rgba(34, 197, 94, 0.14), rgba(28, 28, 30, 0.85))',
    pill: 'Australia match',
    confetti: ['#facc15', '#22c55e', '#ffffff'],
  },
  MIXED: {
    border: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.5)',
    gradient: 'linear-gradient(135deg, rgba(255, 59, 95, 0.16), rgba(250, 204, 21, 0.16), rgba(34, 197, 94, 0.12))',
    pill: 'My teams!',
    confetti: ['#ff3b5f', '#facc15', '#22c55e', '#ffffff'],
  },
};

const favoriteTeamCodes = new Set(['ENG', 'AUS']);

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
  const favoriteCodes = [fixture.homeTeam.code, fixture.awayTeam.code].filter((code) =>
    favoriteTeamCodes.has(code)
  );
  const favoriteAccent =
    favoriteCodes.length > 1
      ? favoriteTeamAccents.MIXED
      : favoriteCodes[0]
        ? favoriteTeamAccents[favoriteCodes[0]]
        : undefined;

  return (
    <div 
      className={`relative overflow-hidden rounded-lg dense-card bg-dark-surface transition-all ${
        favoriteAccent ? 'border-2' : 'border border-dark-border'
      } ${
        isPast && !hasScore ? 'opacity-60' : ''
      }`}
      style={
        favoriteAccent
          ? {
              borderColor: favoriteAccent.border,
              background: favoriteAccent.gradient,
              boxShadow: `0 0 0 1px ${favoriteAccent.glow}, 0 0 18px ${favoriteAccent.glow}`,
            }
          : undefined
      }
    >
      {favoriteAccent && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span
            className="absolute right-3 top-2 h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: favoriteAccent.confetti[0], color: favoriteAccent.confetti[0] }}
          />
          <span
            className="absolute right-8 top-5 h-1 w-3 rotate-12 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: favoriteAccent.confetti[1], color: favoriteAccent.confetti[1] }}
          />
          <span
            className="absolute bottom-3 left-4 h-2 w-2 rounded-sm rotate-45 shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: favoriteAccent.confetti[2], color: favoriteAccent.confetti[2] }}
          />
          <span
            className="absolute bottom-5 right-14 text-xs leading-none drop-shadow-[0_0_6px_currentColor]"
            style={{ color: favoriteAccent.confetti[3] ?? favoriteAccent.border }}
          >
            ✦
          </span>
        </div>
      )}

      {/* Teams & Score */}
      <div className="relative grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3 mb-2">
        {/* Home Team */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <CountryFlag countryCode={fixture.homeTeam.code} size="md" className="flex-shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm sm:text-base truncate">{fixture.homeTeam.name}</span>
            <span className="text-xs text-gray-500">{fixture.homeTeam.code}</span>
          </div>
        </div>

        {/* Score or Time */}
        <div className="flex-shrink-0 px-1 sm:px-2">
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
              <div className="hidden sm:block text-[10px] font-semibold text-gray-500 whitespace-nowrap">
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
            <span className="font-bold text-sm sm:text-base truncate">{fixture.awayTeam.name}</span>
            <span className="text-xs text-gray-500">{fixture.awayTeam.code}</span>
          </div>
        </div>
      </div>

      {/* Metadata & Actions */}
      <div className="relative flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-gray-500 min-w-0">
          {favoriteAccent && (
            <span
              className="px-1.5 py-0.5 rounded font-bold text-white shadow-[0_0_10px_currentColor]"
              style={{ backgroundColor: `${favoriteAccent.border}33`, color: favoriteAccent.border }}
            >
              ✦ {favoriteAccent.pill}
            </span>
          )}
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
          <span className="truncate">{fixture.venue.city}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
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
