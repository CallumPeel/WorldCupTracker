import { motion } from 'framer-motion';
import type { GroupTable as GroupTableType } from '../types';
import { CountryFlag } from './CountryFlag';
import { getTeamColors, getGroupColor } from '../utils/teamColors';

interface GroupTableProps {
  table: GroupTableType;
}

export function GroupTable({ table }: GroupTableProps) {
  const groupColor = getGroupColor(table.group);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card relative overflow-hidden"
      style={{
        borderLeft: `4px solid ${groupColor}`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-bold">Group {table.group}</h3>
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: groupColor }}
          />
        </div>
        <div className="text-sm text-gray-400">
          {table.standings.filter(s => s.played > 0).length} teams
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-dark-border">
              <th className="text-left py-2 pr-2">#</th>
              <th className="text-left py-2 px-2">Team</th>
              <th className="text-center py-2 px-1">P</th>
              <th className="text-center py-2 px-1">W</th>
              <th className="text-center py-2 px-1">D</th>
              <th className="text-center py-2 px-1">L</th>
              <th className="text-center py-2 px-1">GF</th>
              <th className="text-center py-2 px-1">GA</th>
              <th className="text-center py-2 px-1">GD</th>
              <th className="text-center py-2 px-1 font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {table.standings.map((standing, index) => {
              const isQualified = index < 2 && standing.played > 0;
              const teamColors = getTeamColors(standing.team.code);
              return (
                <tr
                  key={standing.team.id}
                  className={`border-b border-dark-border/50 transition-colors ${
                    isQualified ? 'bg-primary/5' : ''
                  } ${standing.played === 0 ? 'opacity-50' : ''}`}
                  style={{
                    borderLeftColor: isQualified ? groupColor : 'transparent',
                    borderLeftWidth: '3px',
                  }}
                >
                  <td className="py-3 pr-2">
                    <span 
                      className="font-semibold"
                      style={{ color: isQualified ? groupColor : 'inherit' }}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className="p-0.5 rounded"
                        style={{ backgroundColor: `${teamColors.primary}15` }}
                      >
                        <CountryFlag countryCode={standing.team.code} size="sm" />
                      </div>
                      <div>
                        <div className="font-semibold">{standing.team.name}</div>
                        <div className="text-xs font-semibold" style={{ color: teamColors.primary }}>{standing.team.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-center py-3 px-1 tabular-nums">{standing.played}</td>
                  <td className="text-center py-3 px-1 tabular-nums">{standing.won}</td>
                  <td className="text-center py-3 px-1 tabular-nums">{standing.drawn}</td>
                  <td className="text-center py-3 px-1 tabular-nums">{standing.lost}</td>
                  <td className="text-center py-3 px-1 tabular-nums">{standing.goalsFor}</td>
                  <td className="text-center py-3 px-1 tabular-nums">{standing.goalsAgainst}</td>
                  <td className="text-center py-3 px-1 tabular-nums">
                    <span 
                      className="font-semibold"
                      style={{ 
                        color: standing.goalDifference > 0 ? '#10b981' : standing.goalDifference < 0 ? '#ef4444' : 'inherit'
                      }}
                    >
                      {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                    </span>
                  </td>
                  <td className="text-center py-3 px-1 font-bold tabular-nums">
                    {standing.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {table.standings.every(s => s.played === 0) && (
        <div className="text-center py-8 text-gray-500">
          No matches played yet. Enter scores to see standings.
        </div>
      )}

      {table.standings.some(s => s.played > 0) && (
        <div className="mt-4 pt-4 border-t border-dark-border text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: `${groupColor}80` }}
            ></div>
            <span>Qualified for knockout stage</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
