import type { Fixture, MatchScore, KnockoutRound, KnockoutMatch, Team } from '../types';
import { getGroupWinners, calculateGroupStandings } from './groupCalculator';

/**
 * Generates knockout bracket from group winners and user-entered scores
 */
export function generateKnockoutBracket(
  fixtures: Fixture[],
  scores: MatchScore[]
): KnockoutRound[] {
  const rounds: KnockoutRound[] = [];

  // Calculate group standings to determine qualifiers
  const groupTables = calculateGroupStandings(fixtures, scores);
  const groupWinners = getGroupWinners(groupTables, 3); // Top 3 from each group for Round of 32 slots

  // Round of 32
  const round32Fixtures = fixtures.filter((f) => f.stage === 'ROUND_OF_32');
  if (round32Fixtures.length > 0) {
    rounds.push(createKnockoutRound('ROUND_OF_32', round32Fixtures, scores, groupWinners));
  }

  // Round of 16
  const round16Fixtures = fixtures.filter((f) => f.stage === 'ROUND_OF_16');
  if (round16Fixtures.length > 0) {
    const round16Winners = rounds.length > 0 ? getKnockoutWinners(rounds[0]) : new Map();
    rounds.push(createKnockoutRound('ROUND_OF_16', round16Fixtures, scores, round16Winners));
  }

  // Quarter Finals
  const qfFixtures = fixtures.filter((f) => f.stage === 'QUARTER_FINAL');
  if (qfFixtures.length > 0) {
    const qfQualifiers = getKnockoutWinners(rounds[rounds.length - 1]);
    rounds.push(createKnockoutRound('QUARTER_FINAL', qfFixtures, scores, qfQualifiers));
  }

  // Semi Finals
  const sfFixtures = fixtures.filter((f) => f.stage === 'SEMI_FINAL');
  if (sfFixtures.length > 0) {
    const sfQualifiers = getKnockoutWinners(rounds[rounds.length - 1]);
    rounds.push(createKnockoutRound('SEMI_FINAL', sfFixtures, scores, sfQualifiers));
  }

  // Third Place
  const thirdPlaceFixtures = fixtures.filter((f) => f.stage === 'THIRD_PLACE');
  if (thirdPlaceFixtures.length > 0) {
    const losers = getKnockoutLosers(rounds[rounds.length - 1]);
    rounds.push(createKnockoutRound('THIRD_PLACE', thirdPlaceFixtures, scores, losers));
  }

  // Final
  const finalFixtures = fixtures.filter((f) => f.stage === 'FINAL');
  if (finalFixtures.length > 0) {
    const finalists = getKnockoutWinners(rounds.find(r => r.stage === 'SEMI_FINAL')!);
    rounds.push(createKnockoutRound('FINAL', finalFixtures, scores, finalists));
  }

  return rounds;
}

/**
 * Creates a knockout round with matches
 */
function createKnockoutRound(
  stage: any,
  fixtures: Fixture[],
  scores: MatchScore[],
  qualifiers: Map<string, Team[]>
): KnockoutRound {
  const matches: KnockoutMatch[] = fixtures.map((fixture) => {
    const score = scores.find((s) => s.fixtureId === fixture.id);
    const resolvedHome = resolveFixtureTeam(fixture.homeTeam, qualifiers);
    const resolvedAway = resolveFixtureTeam(fixture.awayTeam, qualifiers);
    const resolvedFixture = {
      ...fixture,
      homeTeam: resolvedHome.team ?? fixture.homeTeam,
      awayTeam: resolvedAway.team ?? fixture.awayTeam,
    };
    const winner = score ? determineWinner(resolvedFixture, score) : undefined;

    return {
      fixtureId: fixture.id,
      homeTeam: resolvedHome.team,
      awayTeam: resolvedAway.team,
      homeLabel: resolvedHome.label,
      awayLabel: resolvedAway.label,
      winner,
      score,
    };
  });

  return {
    stage,
    matches,
  };
}

interface ResolvedSlot {
  team?: Team;
  label?: string;
}

/**
 * Resolves placeholder teams from fixture data into either a real qualifier or a friendly label.
 * This prevents internal fixture identifiers such as RUNNER_UP_GROUP_A from appearing in the UI.
 */
function resolveFixtureTeam(
  fixtureTeam: Team,
  qualifiers: Map<string, Team[]>
): ResolvedSlot {
  const groupSlot = parseGroupQualificationSlot(fixtureTeam.code) ?? parseGroupQualificationSlot(fixtureTeam.name);
  if (groupSlot) {
    const team = resolveGroupSlotTeam(groupSlot, qualifiers);

    return {
      team,
      label: formatGroupQualificationLabel(groupSlot.groups, groupSlot.position),
    };
  }

  const matchSlot = parseMatchQualificationSlot(fixtureTeam.code) ?? parseMatchQualificationSlot(fixtureTeam.name);
  if (matchSlot) {
    const team = qualifiers.get(`MATCH_${matchSlot.matchNumber}`)?.[0];

    return {
      team,
      label: `Winner Match ${matchSlot.matchNumber}`,
    };
  }

  return { team: fixtureTeam };
}

interface GroupQualificationSlot {
  groups: string[];
  position: number;
}

function parseGroupQualificationSlot(value: string): GroupQualificationSlot | undefined {
  const normalized = value.trim();
  const internalMatch = normalized.match(/^(WINNER|RUNNER_UP|THIRD_PLACE)_GROUP_([A-L])_?$/i);
  if (internalMatch) {
    return {
      groups: [internalMatch[2].toUpperCase()],
      position: internalMatch[1].toUpperCase() === 'WINNER' ? 1 : internalMatch[1].toUpperCase() === 'RUNNER_UP' ? 2 : 3,
    };
  }

  const readableMatch = normalized.match(/^(Winner|Runner[- ]up|3rd|Third[- ]Place) Group ([A-L](?:\/[A-L])*)$/i);
  if (!readableMatch) return undefined;

  const qualifier = readableMatch[1].toLowerCase();
  return {
    groups: readableMatch[2].toUpperCase().split('/'),
    position: qualifier === 'winner' ? 1 : qualifier.includes('runner') ? 2 : 3,
  };
}

function resolveGroupSlotTeam(
  slot: GroupQualificationSlot,
  qualifiers: Map<string, Team[]>
): Team | undefined {
  if (slot.position !== 3 || slot.groups.length === 1) {
    return qualifiers.get(slot.groups[0])?.[slot.position - 1];
  }

  return slot.groups
    .map((group) => qualifiers.get(group)?.[2])
    .find((team): team is Team => Boolean(team));
}

function parseMatchQualificationSlot(value: string): { matchNumber: number } | undefined {
  const match = value.trim().match(/^WINNER_MATCH_(\d+)$|^Winner Match (\d+)$/i);
  if (!match) return undefined;

  return { matchNumber: Number(match[1] ?? match[2]) };
}

function formatGroupQualificationLabel(groups: string[], position: number): string {
  const groupLabel = groups.join('/');

  if (position === 1) return `Winner Group ${groupLabel} (${groupLabel}1)`;
  if (position === 2) return `Runner-up Group ${groupLabel} (${groupLabel}2)`;
  return `3rd Group ${groupLabel}`;
}

/**
 * Determines the winner of a knockout match
 * Note: This is a simplified version - real World Cup uses extra time and penalties
 */
function determineWinner(fixture: Fixture, score: MatchScore): Team | undefined {
  if (score.homeScore > score.awayScore) {
    return fixture.homeTeam;
  } else if (score.awayScore > score.homeScore) {
    return fixture.awayTeam;
  }
  // For draws, we'd need penalty shootout data
  // For now, return undefined (user needs to indicate winner somehow)
  return undefined;
}

/**
 * Gets winners from a knockout round
 */
function getKnockoutWinners(round: KnockoutRound): Map<string, Team[]> {
  const winners = new Map<string, Team[]>();
  const winnersList: Team[] = [];

  round.matches.forEach((match) => {
    if (match.winner) {
      winnersList.push(match.winner);
      if (match.fixtureId) {
        winners.set(`MATCH_${match.fixtureId}`, [match.winner]);
      }
    }
  });

  if (winnersList.length > 0) {
    winners.set(round.stage, winnersList);
  }

  return winners;
}

/**
 * Gets losers from a knockout round (for third place playoff)
 */
function getKnockoutLosers(round: KnockoutRound): Map<string, Team[]> {
  const losers = new Map<string, Team[]>();
  const losersList: Team[] = [];

  round.matches.forEach((match) => {
    if (match.winner && match.homeTeam && match.awayTeam) {
      const loser = match.winner.id === match.homeTeam.id ? match.awayTeam : match.homeTeam;
      losersList.push(loser);
    }
  });

  if (losersList.length > 0) {
    losers.set(round.stage, losersList);
  }

  return losers;
}

/**
 * Checks if a knockout stage is complete (all matches have winners)
 */
export function isKnockoutStageComplete(round: KnockoutRound): boolean {
  return round.matches.every((match) => match.winner !== undefined);
}

/**
 * Gets the tournament winner (if final is complete)
 */
export function getTournamentWinner(rounds: KnockoutRound[]): Team | undefined {
  const final = rounds.find((r) => r.stage === 'FINAL');
  if (!final || final.matches.length === 0) return undefined;

  return final.matches[0].winner;
}
