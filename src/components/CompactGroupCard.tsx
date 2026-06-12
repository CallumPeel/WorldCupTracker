import type { GroupTable } from '../types';
import { CountryFlag } from './CountryFlag';
import { getTeamColors, getGroupColor } from '../utils/teamColors';
import { getFavoriteTeamAccent } from '../utils/favoriteTeams';
import { getTeamDisplayName } from '../utils/teamDisplay';

interface CompactGroupCardProps {
  table: GroupTable;
  favoriteTeamCodes?: string[];
}

export function CompactGroupCard({ table, favoriteTeamCodes = [] }: CompactGroupCardProps) {
  const hasData = table.standings.some(s => s.played > 0);
  const groupColor = getGroupColor(table.group);
  const favoriteCodeSet = new Set(favoriteTeamCodes);
  const statColumns = ['P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'PTS'] as const;

  return (
    <div 
      className="border rounded-2xl dense-card bg-dark-surface/95 overflow-hidden"
      style={{
        borderLeftColor: groupColor,
        borderLeftWidth: '4px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-dark-border/50">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-black uppercase tracking-[0.18em]" style={{ color: groupColor }}>
            Group {table.group}
          </h3>
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: groupColor }}
          />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
          Top 2 qualify
        </span>
      </div>

      {/* Standings table */}
      <div className="-mx-1 px-1">
        <div className="w-full min-w-0">
          <div className="group-standings-grid px-1.5 pb-2 text-[10px] font-black uppercase tracking-wide text-gray-500 sm:text-[11px]">
            <span className="text-center">#</span>
            <span>Team</span>
            {statColumns.map((column) => (
              <span key={column} className="text-center">
                {column}
              </span>
            ))}
          </div>

          <div className="space-y-1">
        {table.standings.map((standing, index) => {
          const isQualified = index < 2;
          const isThird = index === 2;
          const teamColors = getTeamColors(standing.team.code);
          const favoriteAccent = favoriteCodeSet.has(standing.team.code)
            ? getFavoriteTeamAccent(standing.team.code, standing.team.name)
            : undefined;
          const rowBackground = favoriteAccent
            ? favoriteAccent.gradient
            : isQualified
              ? `linear-gradient(90deg, ${groupColor}22, rgba(255,255,255,0.035))`
              : isThird
                ? 'linear-gradient(90deg, rgba(255, 159, 10, 0.14), rgba(255,255,255,0.02))'
                : undefined;
          
          return (
            <div
              key={standing.team.id}
              className="group-standings-grid relative overflow-hidden rounded-lg px-1.5 py-2 text-xs transition-colors border border-transparent sm:text-sm"
              style={{
                borderColor: favoriteAccent ? favoriteAccent.border : undefined,
                borderLeftColor: favoriteAccent ? favoriteAccent.border : isQualified ? groupColor : 'transparent',
                borderLeftWidth: favoriteAccent ? '3px' : isQualified ? '3px' : '1px',
                background: rowBackground,
                boxShadow: favoriteAccent
                  ? `0 0 0 1px ${favoriteAccent.glow}, inset 0 0 14px ${favoriteAccent.glow}`
                  : undefined,
              }}
            >
              {favoriteAccent && (
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                  <span
                    className="absolute right-2 top-1 h-1.5 w-1.5 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: favoriteAccent.confetti[0], color: favoriteAccent.confetti[0] }}
                  />
                  <span
                    className="absolute right-7 bottom-1 h-1 w-2.5 -rotate-12 rounded-full shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: favoriteAccent.confetti[1], color: favoriteAccent.confetti[1] }}
                  />
                  <span
                    className="absolute left-1 top-1 text-[9px] leading-none drop-shadow-[0_0_6px_currentColor]"
                    style={{ color: favoriteAccent.confetti[2] }}
                  >
                    ✦
                  </span>
                </div>
              )}

              {/* Position */}
              <div 
                className="relative text-center font-black text-sm sm:text-base"
                style={{ color: favoriteAccent ? favoriteAccent.border : isQualified ? groupColor : isThird ? '#ff9f0a' : 'rgb(156, 163, 175)' }}
              >
                {index + 1}
              </div>

              {/* Flag & Name */}
              <div className="relative flex items-center gap-1.5 min-w-0 sm:gap-2">
                <div 
                  className={`p-0.5 rounded flex-shrink-0 ${favoriteAccent ? 'shadow-[0_0_10px_currentColor]' : ''}`}
                  style={{
                    backgroundColor: favoriteAccent ? `${favoriteAccent.border}24` : `${teamColors.primary}15`,
                    color: favoriteAccent?.border,
                  }}
                >
                  <CountryFlag countryCode={standing.team.code} size="sm" />
                </div>
                <span className="font-bold uppercase tracking-wide leading-tight" title={getTeamDisplayName(standing.team, 'full')}>
                  {standing.team.code}
                </span>
              </div>

              <StatCell value={standing.played} />
              <StatCell value={standing.won} />
              <StatCell value={standing.drawn} />
              <StatCell value={standing.lost} />
              <StatCell value={standing.goalsFor} />
              <StatCell value={standing.goalsAgainst} />
              <StatCell value={standing.goalDifference} signed />
              <StatCell
                value={standing.points}
                strong
                color={favoriteAccent ? favoriteAccent.border : isQualified ? groupColor : undefined}
              />
            </div>
          );
        })}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="mt-3 text-center py-2 text-xs text-gray-500 border-t border-dark-border/50">
          Standings will update as you enter scores
        </div>
      )}
    </div>
  );
}

interface StatCellProps {
  value: number;
  signed?: boolean;
  strong?: boolean;
  color?: string;
}

function StatCell({ value, signed = false, strong = false, color }: StatCellProps) {
  const displayValue = signed && value > 0 ? `+${value}` : value;

  return (
    <span
      className={`relative text-center tabular-nums ${strong ? 'font-black text-gray-50' : 'font-medium text-gray-300'}`}
      style={{ color }}
    >
      {displayValue}
    </span>
  );
}
