import type { KnockoutMatch } from '../types';
import { CountryFlag } from './CountryFlag';
import { getTeamColors } from '../utils/teamColors';

interface BracketMatchProps {
  match: KnockoutMatch;
  onClick?: () => void;
}

export function BracketMatch({ match, onClick }: BracketMatchProps) {
  const hasTeams = match.homeTeam && match.awayTeam;
  const hasScore = !!match.score;
  const homeColors = match.homeTeam ? getTeamColors(match.homeTeam.code) : undefined;
  const awayColors = match.awayTeam ? getTeamColors(match.awayTeam.code) : undefined;

  return (
    <button
      onClick={onClick}
      disabled={!hasTeams}
      className={`w-48 border rounded-lg p-2 transition-all text-left ${
        hasTeams
          ? 'border-dark-border bg-dark-surface hover:border-primary/50 cursor-pointer'
          : 'border-dark-border/30 bg-dark-bg/50 cursor-not-allowed'
      }`}
    >
      {/* Home Team */}
      <div className={`flex items-center justify-between gap-2 py-1.5 px-2 rounded ${
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
          <span className="text-xs text-gray-600 italic">TBD</span>
        )}
      </div>

      {/* Away Team */}
      <div className={`flex items-center justify-between gap-2 py-1.5 px-2 rounded mt-1 ${
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
          <span className="text-xs text-gray-600 italic">TBD</span>
        )}
      </div>
    </button>
  );
}
