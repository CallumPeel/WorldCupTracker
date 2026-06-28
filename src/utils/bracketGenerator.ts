import type { Fixture, MatchScore, KnockoutRound, KnockoutMatch, Team } from '../types';
import { isGroupProvisional } from './groupCalculator';
import { createResolverContext, resolveFixtureTeam, type ResolvedSlot } from './fixtureResolution';

/**
 * Generates knockout bracket from group winners and user-entered scores
 */
export function generateKnockoutBracket(
  fixtures: Fixture[],
  scores: MatchScore[]
): KnockoutRound[] {
  const rounds: KnockoutRound[] = [];

  // Round of 32
  const round32Fixtures = fixtures.filter((f) => f.stage === 'ROUND_OF_32');
  if (round32Fixtures.length > 0) {
    rounds.push(createKnockoutRound('ROUND_OF_32', round32Fixtures, scores, new Map(), fixtures));
  }

  // Round of 16
  const round16Fixtures = fixtures.filter((f) => f.stage === 'ROUND_OF_16');
  if (round16Fixtures.length > 0) {
    const round16Winners = rounds.length > 0 ? getKnockoutWinners(rounds[0]) : new Map();
    rounds.push(createKnockoutRound('ROUND_OF_16', round16Fixtures, scores, round16Winners, fixtures));
  }

  // Quarter Finals
  const qfFixtures = fixtures.filter((f) => f.stage === 'QUARTER_FINAL');
  if (qfFixtures.length > 0) {
    const qfQualifiers = getKnockoutWinners(rounds[rounds.length - 1]);
    rounds.push(createKnockoutRound('QUARTER_FINAL', qfFixtures, scores, qfQualifiers, fixtures));
  }

  // Semi Finals
  const sfFixtures = fixtures.filter((f) => f.stage === 'SEMI_FINAL');
  if (sfFixtures.length > 0) {
    const sfQualifiers = getKnockoutWinners(rounds[rounds.length - 1]);
    rounds.push(createKnockoutRound('SEMI_FINAL', sfFixtures, scores, sfQualifiers, fixtures));
  }

  // Third Place
  const thirdPlaceFixtures = fixtures.filter((f) => f.stage === 'THIRD_PLACE');
  if (thirdPlaceFixtures.length > 0) {
    const losers = getKnockoutLosers(rounds[rounds.length - 1]);
    rounds.push(createKnockoutRound('THIRD_PLACE', thirdPlaceFixtures, scores, losers, fixtures));
  }

  // Final
  const finalFixtures = fixtures.filter((f) => f.stage === 'FINAL');
  if (finalFixtures.length > 0) {
    const finalists = getKnockoutWinners(rounds.find(r => r.stage === 'SEMI_FINAL')!);
    rounds.push(createKnockoutRound('FINAL', finalFixtures, scores, finalists, fixtures));
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
  qualifiers: Map<string, Team[]>,
  allFixtures: Fixture[]
): KnockoutRound {
  const resolverContext = createResolverContext(allFixtures, scores);
  resolverContext.matchQualifiers = qualifiers;

  const matches: KnockoutMatch[] = fixtures.map((fixture) => {
    const score = scores.find((s) => s.fixtureId === fixture.id);
    const resolvedHome = resolveFixtureTeam(fixture.homeTeam, resolverContext);
    const resolvedAway = resolveFixtureTeam(fixture.awayTeam, resolverContext);
    const resolvedFixture = {
      ...fixture,
      homeTeam: resolvedHome.team ?? fixture.homeTeam,
      awayTeam: resolvedAway.team ?? fixture.awayTeam,
    };
    const winner = score ? determineWinner(resolvedFixture, score) : undefined;

    // Check if this match contains teams from provisional groups
    const isProvisional = isMatchProvisional(
      resolvedHome,
      resolvedAway,
      allFixtures,
      scores
    );

    return {
      fixtureId: fixture.id,
      homeTeam: resolvedHome.team,
      awayTeam: resolvedAway.team,
      homeLabel: resolvedHome.label,
      awayLabel: resolvedAway.label,
      winner,
      score,
      isProvisional,
    };
  });

  return {
    stage,
    matches,
  };
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
 * Determines if a match is provisional based on whether its teams come from incomplete groups
 */
function isMatchProvisional(
  homeSlot: ResolvedSlot,
  awaySlot: ResolvedSlot,
  fixtures: Fixture[],
  scores: MatchScore[]
): boolean {
  // Check if either slot has source groups that are provisional
  const groupsToCheck = [
    ...(homeSlot.sourceGroups || []),
    ...(awaySlot.sourceGroups || []),
  ];

  if (groupsToCheck.length === 0) {
    // If no source groups, check if teams are assigned
    // A match without teams is not "provisional" - it's just TBD
    return false;
  }

  // Check if any source group is provisional
  return groupsToCheck.some((group) => isGroupProvisional(group, fixtures, scores));
}

/**
 * Gets the tournament winner (if final is complete)
 */
export function getTournamentWinner(rounds: KnockoutRound[]): Team | undefined {
  const final = rounds.find((r) => r.stage === 'FINAL');
  if (!final || final.matches.length === 0) return undefined;

  return final.matches[0].winner;
}
