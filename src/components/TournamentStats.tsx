import { useMemo } from 'react';
import type { Fixture, MatchScore } from '../types';

interface TournamentStatsProps {
  fixtures: Fixture[];
  scores: MatchScore[];
}

export function TournamentStats({ fixtures, scores }: TournamentStatsProps) {
  const stats = useMemo(() => {
    const totalMatches = fixtures.length;
    const playedMatches = scores.length;
    
    // Count unique teams
    const teamsSet = new Set<number>();
    fixtures.forEach(f => {
      teamsSet.add(f.homeTeam.id);
      teamsSet.add(f.awayTeam.id);
    });
    const totalTeams = teamsSet.size;

    // Determine current stage
    const groupMatches = fixtures.filter(f => f.stage === 'GROUP_STAGE');
    const groupScores = scores.filter(s => 
      groupMatches.some(f => f.id === s.fixtureId)
    );
    const groupProgress = groupMatches.length > 0 
      ? Math.round((groupScores.length / groupMatches.length) * 100)
      : 0;

    // Calculate days into tournament (from June 11, 2026)
    const tournamentStart = new Date('2026-06-11T00:00:00Z');
    const now = new Date();
    const daysSinceStart = Math.max(0, Math.floor((now.getTime() - tournamentStart.getTime()) / (1000 * 60 * 60 * 24)));
    const totalDays = 39; // June 11 - July 19, 2026

    return {
      playedMatches,
      totalMatches,
      totalTeams,
      groupProgress,
      currentDay: Math.min(daysSinceStart + 1, totalDays),
      totalDays,
    };
  }, [fixtures, scores]);

  return (
    <div className="h-full border border-dark-border rounded-xl p-4 bg-dark-surface">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
        Tournament Progress
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Matches Progress */}
        <div>
          <div className="text-2xl font-bold tabular-nums">
            {stats.playedMatches}<span className="text-gray-500">/{stats.totalMatches}</span>
          </div>
          <div className="text-xs text-gray-400">Matches Entered</div>
        </div>

        {/* Teams */}
        <div>
          <div className="text-2xl font-bold tabular-nums">{stats.totalTeams}</div>
          <div className="text-xs text-gray-400">Teams</div>
        </div>

        {/* Group Stage Progress */}
        <div>
          <div className="text-2xl font-bold tabular-nums">{stats.groupProgress}%</div>
          <div className="text-xs text-gray-400">Group Stage</div>
        </div>

        {/* Tournament Day */}
        <div>
          <div className="text-2xl font-bold tabular-nums">
            Day {stats.currentDay}<span className="text-gray-500">/{stats.totalDays}</span>
          </div>
          <div className="text-xs text-gray-400">Tournament</div>
        </div>
      </div>
    </div>
  );
}
