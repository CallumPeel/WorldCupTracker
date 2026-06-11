import type { GroupTable } from '../types';
import { CountryFlag } from './CountryFlag';
import { getTeamColors, getGroupColor } from '../utils/teamColors';

const favoriteTeamAccents: Record<
  string,
  { border: string; glow: string; gradient: string; pill: string; confetti: string[] }
> = {
  ENG: {
    border: '#ff3b5f',
    glow: 'rgba(255, 59, 95, 0.45)',
    gradient: 'linear-gradient(90deg, rgba(255, 59, 95, 0.18), rgba(255, 255, 255, 0.07), transparent)',
    pill: 'England',
    confetti: ['#ff3b5f', '#ffffff', '#7dd3fc'],
  },
  AUS: {
    border: '#facc15',
    glow: 'rgba(250, 204, 21, 0.45)',
    gradient: 'linear-gradient(90deg, rgba(250, 204, 21, 0.2), rgba(34, 197, 94, 0.12), transparent)',
    pill: 'Australia',
    confetti: ['#facc15', '#22c55e', '#ffffff'],
  },
};

interface CompactGroupCardProps {
  table: GroupTable;
}

export function CompactGroupCard({ table }: CompactGroupCardProps) {
  const hasData = table.standings.some(s => s.played > 0);
  const groupColor = getGroupColor(table.group);

  return (
    <div 
      className="border rounded-lg dense-card bg-dark-surface"
      style={{
        borderLeftColor: groupColor,
        borderLeftWidth: '3px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-dark-border/50">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold">Group {table.group}</h3>
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: groupColor }}
          />
        </div>
        {hasData && (
          <span className="text-xs text-gray-500">
            {table.standings.filter(s => s.played > 0).length}/4
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="space-y-1.5">
        {table.standings.map((standing, index) => {
          const isQualified = index < 2 && standing.played > 0;
          const teamColors = getTeamColors(standing.team.code);
          const favoriteAccent = favoriteTeamAccents[standing.team.code];
          
          return (
            <div
              key={standing.team.id}
               className={`relative overflow-hidden flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${
                isQualified ? 'bg-primary/5' : ''
              } ${standing.played === 0 ? 'opacity-50' : ''}`}
              style={{
                borderColor: favoriteAccent ? favoriteAccent.border : undefined,
                borderLeftColor: favoriteAccent ? favoriteAccent.border : isQualified ? groupColor : 'transparent',
                borderLeftWidth: favoriteAccent ? '3px' : '2px',
                borderRightWidth: favoriteAccent ? '1px' : undefined,
                borderTopWidth: favoriteAccent ? '1px' : undefined,
                borderBottomWidth: favoriteAccent ? '1px' : undefined,
                background: favoriteAccent ? favoriteAccent.gradient : undefined,
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
                className="relative w-5 text-center font-bold text-sm"
                style={{ color: favoriteAccent ? favoriteAccent.border : isQualified ? groupColor : 'rgb(107, 114, 128)' }}
              >
                {index + 1}
              </div>

              {/* Flag & Name */}
              <div className="relative flex items-center gap-2 flex-1 min-w-0">
                <div 
                  className={`p-0.5 rounded flex-shrink-0 ${favoriteAccent ? 'shadow-[0_0_10px_currentColor]' : ''}`}
                  style={{
                    backgroundColor: favoriteAccent ? `${favoriteAccent.border}24` : `${teamColors.primary}15`,
                    color: favoriteAccent?.border,
                  }}
                >
                  <CountryFlag countryCode={standing.team.code} size="sm" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm truncate">{standing.team.name}</span>
                  <span className="text-xs font-semibold" style={{ color: favoriteAccent ? favoriteAccent.border : teamColors.primary }}>{standing.team.code}</span>
                </div>
                {favoriteAccent && (
                  <span
                    className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shadow-[0_0_8px_currentColor]"
                    style={{ backgroundColor: `${favoriteAccent.border}2e`, color: favoriteAccent.border }}
                  >
                    ✦ {favoriteAccent.pill}
                  </span>
                )}
              </div>

              {/* Stats - Only show if played > 0 */}
              {standing.played > 0 && (
                <div className="relative flex items-center gap-3 text-xs tabular-nums">
                  <span className="text-gray-500">{standing.played}P</span>
                  <span className="text-gray-400">{standing.won}W</span>
                  <span 
                    className="font-bold"
                    style={{ color: favoriteAccent ? favoriteAccent.border : isQualified ? groupColor : 'inherit' }}
                  >
                    {standing.points}pts
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {!hasData && (
        <div className="text-center py-3 text-xs text-gray-500">
          No matches played yet
        </div>
      )}

      {/* Qualification note */}
      {hasData && (
        <div className="mt-3 pt-2 border-t border-dark-border/50 text-xs text-gray-500 flex items-center gap-1.5">
          <div 
            className="w-2 h-2 rounded-sm"
            style={{ backgroundColor: groupColor }}
          ></div>
          <span>Top 2 qualify</span>
        </div>
      )}
    </div>
  );
}
