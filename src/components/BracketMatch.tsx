import type { KnockoutMatch } from '../types';
import { CountryFlag } from './CountryFlag';
import { getTeamColors } from '../utils/teamColors';
import { getFavoriteTeamAccent, getMixedFavoriteTeamAccent } from '../utils/favoriteTeams';

interface BracketMatchProps {
  match: KnockoutMatch;
  favoriteTeamCodes?: string[];
  onClick?: () => void;
}

export function BracketMatch({ match, favoriteTeamCodes = [], onClick }: BracketMatchProps) {
  const hasTeams = match.homeTeam && match.awayTeam;
  const hasScore = !!match.score;
  const homeColors = match.homeTeam ? getTeamColors(match.homeTeam.code) : undefined;
  const awayColors = match.awayTeam ? getTeamColors(match.awayTeam.code) : undefined;
  const homeLabel = getDisplayLabel(match.homeTeam?.code, match.homeLabel);
  const awayLabel = getDisplayLabel(match.awayTeam?.code, match.awayLabel);

  const favoriteCodeSet = new Set(favoriteTeamCodes);
  // Check both actual teams and filter out placeholder codes
  const actualTeams = [match.homeTeam, match.awayTeam].filter(
    (team): team is NonNullable<typeof team> => team !== null && team !== undefined && !isInternalPlaceholderCode(team.code)
  );
  const favoriteTeams = actualTeams.filter((team) => favoriteCodeSet.has(team.code));
  const favoriteAccent =
    favoriteTeams.length > 1
      ? getMixedFavoriteTeamAccent()
      : favoriteTeams.length === 1 && favoriteTeams[0]
        ? getFavoriteTeamAccent(favoriteTeams[0].code, favoriteTeams[0].name)
        : undefined;

  return (
    <button
      onClick={onClick}
      disabled={!hasTeams}
      className={`relative w-48 rounded-lg p-2 transition-all text-left overflow-hidden ${
        favoriteAccent ? 'border-2' : 'border'
      } ${
        hasTeams
          ? 'bg-dark-surface hover:border-primary/50 cursor-pointer'
          : 'border-dark-border/30 bg-dark-bg/50 cursor-not-allowed'
      }`}
      style={
        favoriteAccent
          ? {
              borderColor: favoriteAccent.border,
              background: favoriteAccent.gradient,
              boxShadow: `0 0 0 1px ${favoriteAccent.glow}, 0 0 14px ${favoriteAccent.glow}`,
            }
          : hasTeams
            ? { borderColor: 'rgb(56, 56, 58)' }
            : undefined
      }
    >
      {favoriteAccent && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: favoriteAccent.confetti[0], color: favoriteAccent.confetti[0] }}
          />
          <span
            className="absolute right-6 bottom-2 h-1 w-2.5 rotate-12 rounded-full shadow-[0_0_8px_currentColor]"
            style={{ backgroundColor: favoriteAccent.confetti[1], color: favoriteAccent.confetti[1] }}
          />
          <span
            className="absolute left-2 top-2 text-[9px] leading-none drop-shadow-[0_0_6px_currentColor]"
            style={{ color: favoriteAccent.confetti[2] }}
          >
            ✦
          </span>
        </div>
      )}
      {/* Home Team */}
      <div className={`relative flex items-center justify-between gap-2 py-1.5 px-2 rounded ${
        match.winner?.id === match.homeTeam?.id ? 'bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/40' : ''
      }`}>
        {match.homeTeam ? (
          <>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div 
                className="p-0.5 rounded flex-shrink-0"
                style={{ backgroundColor: homeColors ? `${homeColors.primary}20` : 'transparent' }}
              >
                <CountryFlag countryCode={match.homeTeam.code} size="sm" />
              </div>
              <span 
                className="font-semibold text-xs truncate"
                style={{ color: homeColors?.primary }}
              >
                {match.homeTeam.code}
              </span>
            </div>
            {hasScore && (
              <span className="text-sm font-bold tabular-nums">{match.score!.homeScore}</span>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-500 italic truncate">{homeLabel}</span>
        )}
      </div>

      {/* Away Team */}
      <div className={`relative flex items-center justify-between gap-2 py-1.5 px-2 rounded mt-1 ${
        match.winner?.id === match.awayTeam?.id ? 'bg-gradient-to-r from-green-500/20 to-green-500/10 border border-green-500/40' : ''
      }`}>
        {match.awayTeam ? (
          <>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <div 
                className="p-0.5 rounded flex-shrink-0"
                style={{ backgroundColor: awayColors ? `${awayColors.primary}20` : 'transparent' }}
              >
                <CountryFlag countryCode={match.awayTeam.code} size="sm" />
              </div>
              <span 
                className="font-semibold text-xs truncate"
                style={{ color: awayColors?.primary }}
              >
                {match.awayTeam.code}
              </span>
            </div>
            {hasScore && (
              <span className="text-sm font-bold tabular-nums">{match.score!.awayScore}</span>
            )}
          </>
        ) : (
          <span className="text-xs text-gray-500 italic truncate">{awayLabel}</span>
        )}
      </div>
    </button>
  );
}

function getDisplayLabel(teamCode?: string, fallbackLabel?: string): string {
  if (!teamCode || isInternalPlaceholderCode(teamCode)) {
    return fallbackLabel || 'TBD';
  }

  return teamCode;
}

function isInternalPlaceholderCode(code: string): boolean {
  return /^(WINNER|RUNNER_UP|THIRD_PLACE)_GROUP_[A-L]_?$|^WINNER_MATCH_\d+$/i.test(code);
}
