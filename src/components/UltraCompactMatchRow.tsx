import type { Fixture } from '../types';
import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown } from '../utils/timezone';
import { CountryFlag } from './CountryFlag';
import { getFavoriteTeamAccent, getMixedFavoriteTeamAccent } from '../utils/favoriteTeams';
import { getTeamDisplayName } from '../utils/teamDisplay';

interface UltraCompactMatchRowProps {
  fixture: Fixture;
  favoriteTeamCodes?: string[];
  onClick?: () => void;
}

export function UltraCompactMatchRow({ fixture, favoriteTeamCodes = [], onClick }: UltraCompactMatchRowProps) {
  const timeRemaining = useCountdown(fixture.date);
  
  const favoriteCodeSet = new Set(favoriteTeamCodes);
  const favoriteTeams = [fixture.homeTeam, fixture.awayTeam].filter((team) => favoriteCodeSet.has(team.code));
  const favoriteAccent =
    favoriteTeams.length > 1
      ? getMixedFavoriteTeamAccent()
      : favoriteTeams[0]
        ? getFavoriteTeamAccent(favoriteTeams[0].code, favoriteTeams[0].name)
        : undefined;
  const homeName = getTeamDisplayName(fixture.homeTeam, 'compact');
  const awayName = getTeamDisplayName(fixture.awayTeam, 'compact');

  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left px-3 py-2 hover:bg-dark-elevated rounded-lg transition-all overflow-hidden ${
        favoriteAccent ? 'border-2' : 'border border-dark-border/50'
      }`}
      style={
        favoriteAccent
          ? {
              borderColor: favoriteAccent.border,
              background: favoriteAccent.gradient,
              boxShadow: `0 0 0 1px ${favoriteAccent.glow}, 0 0 12px ${favoriteAccent.glow}`,
            }
          : undefined
      }
    >
      {favoriteAccent && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span
            className="absolute right-2 top-1.5 h-1 w-1 rounded-full shadow-[0_0_6px_currentColor]"
            style={{ backgroundColor: favoriteAccent.confetti[0], color: favoriteAccent.confetti[0] }}
          />
          <span
            className="absolute right-6 bottom-1.5 h-0.5 w-2 rotate-12 rounded-full shadow-[0_0_6px_currentColor]"
            style={{ backgroundColor: favoriteAccent.confetti[1], color: favoriteAccent.confetti[1] }}
          />
          <span
            className="absolute left-2 top-1.5 text-[8px] leading-none drop-shadow-[0_0_4px_currentColor]"
            style={{ color: favoriteAccent.confetti[2] }}
          >
            ✦
          </span>
        </div>
      )}
      <div className="relative flex items-center justify-between gap-2 text-sm">
        {/* Teams */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <CountryFlag countryCode={fixture.homeTeam.code} size="sm" className="flex-shrink-0" />
          <span className="font-semibold truncate">{homeName}</span>
          <span className="text-gray-500">vs</span>
          <span className="font-semibold truncate">{awayName}</span>
          <CountryFlag countryCode={fixture.awayTeam.code} size="sm" className="flex-shrink-0" />
        </div>

        {/* Countdown & Badges */}
        <div className="relative flex items-center gap-2 flex-shrink-0">
          {favoriteAccent && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: `${favoriteAccent.border}33`, color: favoriteAccent.border }}
            >
              ✦
            </span>
          )}
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
