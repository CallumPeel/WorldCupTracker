import type { Fixture, MatchScore, GroupTable, GroupStanding, Team } from '../types';

/**
 * Calculates group standings from fixtures and user-entered scores
 */
export function calculateGroupStandings(
  fixtures: Fixture[],
  scores: MatchScore[]
): GroupTable[] {
  const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const tables: GroupTable[] = [];

  for (const group of groups) {
    const groupFixtures = fixtures.filter(
      (f) => f.stage === 'GROUP_STAGE' && f.group === group
    );

    if (groupFixtures.length === 0) continue;

    // Get all teams in this group
    const teamsMap = new Map<number, Team>();
    groupFixtures.forEach((fixture) => {
      teamsMap.set(fixture.homeTeam.id, fixture.homeTeam);
      teamsMap.set(fixture.awayTeam.id, fixture.awayTeam);
    });

    // Initialize standings for each team
    const standingsMap = new Map<number, GroupStanding>();
    teamsMap.forEach((team) => {
      standingsMap.set(team.id, {
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    });

    // Calculate standings from scores
    groupFixtures.forEach((fixture) => {
      const score = scores.find((s) => s.fixtureId === fixture.id);
      if (!score) return; // Only include matches with user-entered scores

      const homeStanding = standingsMap.get(fixture.homeTeam.id)!;
      const awayStanding = standingsMap.get(fixture.awayTeam.id)!;

      homeStanding.played++;
      awayStanding.played++;
      homeStanding.goalsFor += score.homeScore;
      homeStanding.goalsAgainst += score.awayScore;
      awayStanding.goalsFor += score.awayScore;
      awayStanding.goalsAgainst += score.homeScore;

      if (score.homeScore > score.awayScore) {
        // Home win
        homeStanding.won++;
        homeStanding.points += 3;
        awayStanding.lost++;
      } else if (score.homeScore < score.awayScore) {
        // Away win
        awayStanding.won++;
        awayStanding.points += 3;
        homeStanding.lost++;
      } else {
        // Draw
        homeStanding.drawn++;
        awayStanding.drawn++;
        homeStanding.points++;
        awayStanding.points++;
      }
    });

    // Calculate goal difference
    standingsMap.forEach((standing) => {
      standing.goalDifference = standing.goalsFor - standing.goalsAgainst;
    });

    // Sort standings by FIFA rules
    const standings = Array.from(standingsMap.values()).sort((a, b) => {
      // 1. Points
      if (b.points !== a.points) return b.points - a.points;
      // 2. Goal difference
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      // 3. Goals scored
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      // 4. Alphabetical (team name)
      return a.team.name.localeCompare(b.team.name);
    });

    tables.push({
      group,
      standings,
    });
  }

  return tables;
}

/**
 * Gets the top N teams from each group
 */
export function getGroupWinners(
  groupTables: GroupTable[],
  positions: number = 2
): Map<string, Team[]> {
  const winners = new Map<string, Team[]>();

  groupTables.forEach((table) => {
    const topTeams = table.standings
      .slice(0, positions)
      .filter((s) => s.played > 0) // Only include teams that have played
      .map((s) => s.team);
    
    if (topTeams.length > 0) {
      winners.set(table.group, topTeams);
    }
  });

  return winners;
}

/**
 * Checks if all group stage matches have scores entered
 */
export function isGroupStageComplete(
  fixtures: Fixture[],
  scores: MatchScore[]
): boolean {
  const groupFixtures = fixtures.filter((f) => f.stage === 'GROUP_STAGE');
  return groupFixtures.every((fixture) =>
    scores.some((s) => s.fixtureId === fixture.id)
  );
}

/**
 * Gets the number of matches with scores in a group
 */
export function getGroupMatchesWithScores(
  group: string,
  fixtures: Fixture[],
  scores: MatchScore[]
): number {
  const groupFixtures = fixtures.filter(
    (f) => f.stage === 'GROUP_STAGE' && f.group === group
  );
  
  return groupFixtures.filter((fixture) =>
    scores.some((s) => s.fixtureId === fixture.id)
  ).length;
}
