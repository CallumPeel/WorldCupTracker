import type { GroupTable } from '../types';
import { CountryFlag } from './CountryFlag';
import { getTeamColors, getGroupColor } from '../utils/teamColors';

interface CompactGroupCardProps {
  table: GroupTable;
}

export function CompactGroupCard({ table }: CompactGroupCardProps) {
  const hasData = table.standings.some(s => s.played > 0);
  const groupColor = getGroupColor(table.group);

  return (
    <div 
      className="border rounded-lg p-3 bg-dark-surface"
      style={{
        borderLeftColor: groupColor,
        borderLeftWidth: '3px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-dark-border/50">
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
      <div className="space-y-2">
        {table.standings.map((standing, index) => {
          const isQualified = index < 2 && standing.played > 0;
          const teamColors = getTeamColors(standing.team.code);
          
          return (
            <div
              key={standing.team.id}
              className={`flex items-center gap-2 p-2 rounded transition-colors ${
                isQualified ? 'bg-primary/5' : ''
              } ${standing.played === 0 ? 'opacity-50' : ''}`}
              style={{
                borderLeftColor: isQualified ? groupColor : 'transparent',
                borderLeftWidth: '2px',
              }}
            >
              {/* Position */}
              <div 
                className="w-5 text-center font-bold text-sm"
                style={{ color: isQualified ? groupColor : 'rgb(107, 114, 128)' }}
              >
                {index + 1}
              </div>

              {/* Flag & Name */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div 
                  className="p-0.5 rounded flex-shrink-0"
                  style={{ backgroundColor: `${teamColors.primary}15` }}
                >
                  <CountryFlag countryCode={standing.team.code} size="sm" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm truncate">{standing.team.name}</span>
                  <span className="text-xs font-semibold" style={{ color: teamColors.primary }}>{standing.team.code}</span>
                </div>
              </div>

              {/* Stats - Only show if played > 0 */}
              {standing.played > 0 && (
                <div className="flex items-center gap-3 text-xs tabular-nums">
                  <span className="text-gray-500">{standing.played}P</span>
                  <span className="text-gray-400">{standing.won}W</span>
                  <span 
                    className="font-bold"
                    style={{ color: isQualified ? groupColor : 'inherit' }}
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
        <div className="text-center py-4 text-xs text-gray-500">
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
