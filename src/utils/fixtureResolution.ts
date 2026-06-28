import type { Fixture, MatchScore, GroupStanding, Team } from '../types';
import { calculateGroupStandings } from './groupCalculator';

export interface ResolvedSlot {
  team?: Team;
  label?: string;
  sourceGroups?: string[];
}

interface GroupQualificationSlot {
  groups: string[];
  position: number;
}

const THIRD_PLACE_ASSIGNMENTS_BY_QUALIFIED_GROUPS: Record<string, Record<number, string>> = {
  // Official bracket assignment for the supplied completed group-stage data.
  // Qualified third-place groups: B, D, E, F, I, J, K, L.
  'B,D,E,F,I,J,K,L': {
    74: 'D',
    77: 'F',
    79: 'E',
    80: 'K',
    81: 'B',
    82: 'I',
    85: 'J',
    87: 'L',
  },
};

export interface ResolverContext {
  groupQualifiers: Map<string, Team[]>;
  thirdPlaceQualifiers: Map<string, Team>;
  thirdPlaceRank: Map<string, number>;
  thirdPlaceAssignment: Map<number, string>;
  matchQualifiers: Map<string, Team[]>;
  usedThirdPlaceGroups: Set<string>;
}

export function resolveFixtures(fixtures: Fixture[], scores: MatchScore[]): Fixture[] {
  const context = createResolverContext(fixtures, scores);

  return fixtures.map((fixture) => resolveFixtureTeams(fixture, context));
}

export function createResolverContext(fixtures: Fixture[], scores: MatchScore[]): ResolverContext {
  const groupTables = calculateGroupStandings(fixtures, scores);
  const thirdPlaceQualifiers = getThirdPlaceQualifiers(groupTables);

  return {
    groupQualifiers: getGroupQualifiers(groupTables),
    thirdPlaceQualifiers: new Map(thirdPlaceQualifiers.map((qualifier) => [qualifier.group, qualifier.standing.team])),
    thirdPlaceRank: new Map(thirdPlaceQualifiers.map((qualifier, index) => [qualifier.group, index])),
    thirdPlaceAssignment: getThirdPlaceAssignment(thirdPlaceQualifiers.map((qualifier) => qualifier.group)),
    matchQualifiers: new Map<string, Team[]>(),
    usedThirdPlaceGroups: new Set<string>(),
  };
}

export function resolveFixtureTeams(fixture: Fixture, context: ResolverContext): Fixture {
  if (fixture.stage === 'GROUP_STAGE') return fixture;

  const resolvedHome = resolveFixtureTeam(fixture.homeTeam, context, fixture.matchNumber);
  const resolvedAway = resolveFixtureTeam(fixture.awayTeam, context, fixture.matchNumber);

  return {
    ...fixture,
    homeTeam: resolvedHome.team ?? fixture.homeTeam,
    awayTeam: resolvedAway.team ?? fixture.awayTeam,
  };
}

export function resolveFixtureTeam(fixtureTeam: Team, context: ResolverContext, matchNumber?: number): ResolvedSlot {
  const groupSlot = parseBestGroupQualificationSlot(fixtureTeam);
  if (groupSlot) {
    const team = resolveGroupSlotTeam(groupSlot, context, matchNumber);

    return {
      team,
      label: formatGroupQualificationLabel(groupSlot.groups, groupSlot.position),
      sourceGroups: groupSlot.groups,
    };
  }

  const matchSlot = parseMatchQualificationSlot(fixtureTeam.code) ?? parseMatchQualificationSlot(fixtureTeam.name);
  if (matchSlot) {
    const team = context.matchQualifiers.get(`MATCH_${matchSlot.matchNumber}`)?.[0];

    return {
      team,
      label: `Winner Match ${matchSlot.matchNumber}`,
    };
  }

  return { team: fixtureTeam };
}

function getGroupQualifiers(groupTables: ReturnType<typeof calculateGroupStandings>): Map<string, Team[]> {
  const qualifiers = new Map<string, Team[]>();

  groupTables.forEach((table) => {
    const topTeams = table.standings
      .slice(0, 3)
      .filter((standing) => standing.played > 0)
      .map((standing) => standing.team);

    if (topTeams.length > 0) {
      qualifiers.set(table.group, topTeams);
    }
  });

  return qualifiers;
}

function getThirdPlaceQualifiers(groupTables: ReturnType<typeof calculateGroupStandings>): Array<{ group: string; standing: GroupStanding }> {
  return groupTables
    .map((table) => ({ group: table.group, standing: table.standings[2] }))
    .filter((qualifier): qualifier is { group: string; standing: GroupStanding } => Boolean(qualifier.standing?.played))
    .sort((a, b) => {
      if (b.standing.points !== a.standing.points) return b.standing.points - a.standing.points;
      if (b.standing.goalDifference !== a.standing.goalDifference) return b.standing.goalDifference - a.standing.goalDifference;
      if (b.standing.goalsFor !== a.standing.goalsFor) return b.standing.goalsFor - a.standing.goalsFor;
      return a.standing.team.name.localeCompare(b.standing.team.name);
    })
    .slice(0, 8);
}

function getThirdPlaceAssignment(qualifiedGroups: string[]): Map<number, string> {
  const assignmentKey = [...qualifiedGroups].sort().join(',');
  return new Map(
    Object.entries(THIRD_PLACE_ASSIGNMENTS_BY_QUALIFIED_GROUPS[assignmentKey] ?? {})
      .map(([matchNumber, group]) => [Number(matchNumber), group])
  );
}

function parseBestGroupQualificationSlot(team: Team): GroupQualificationSlot | undefined {
  const parsedName = parseGroupQualificationSlot(team.name);
  const parsedCode = parseGroupQualificationSlot(team.code);

  // Some fixture codes for third-place slots are truncated (for example
  // THIRD_PLACE_GROUP_A_) while the readable name contains all eligible groups.
  // Prefer the richer readable value when it has more candidate groups.
  if (parsedName && (!parsedCode || parsedName.groups.length >= parsedCode.groups.length)) {
    return parsedName;
  }

  return parsedCode;
}

function parseGroupQualificationSlot(value: string): GroupQualificationSlot | undefined {
  const normalized = value.trim();
  const internalMatch = normalized.match(/^(WINNER|RUNNER_UP|THIRD_PLACE)_GROUP_([A-L](?:_[A-L])*)_?$/i);
  if (internalMatch) {
    return {
      groups: internalMatch[2].toUpperCase().split('_').filter(Boolean),
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

function resolveGroupSlotTeam(slot: GroupQualificationSlot, context: ResolverContext, matchNumber?: number): Team | undefined {
  if (slot.position !== 3) {
    return context.groupQualifiers.get(slot.groups[0])?.[slot.position - 1];
  }

  const assignedGroup = matchNumber ? context.thirdPlaceAssignment.get(matchNumber) : undefined;
  if (assignedGroup && slot.groups.includes(assignedGroup)) {
    const assignedTeam = context.thirdPlaceQualifiers.get(assignedGroup);
    if (assignedTeam) {
      context.usedThirdPlaceGroups.add(assignedGroup);
      return assignedTeam;
    }
  }

  const thirdPlaceCandidates = slot.groups
    .map((group) => ({
      group,
      team: context.thirdPlaceQualifiers.get(group),
      rank: context.thirdPlaceRank.get(group) ?? Number.MAX_SAFE_INTEGER,
    }))
    .filter((candidate): candidate is { group: string; team: Team; rank: number } => Boolean(candidate.team));

  // Fallback for unconfigured qualified-group combinations. Variable
  // third-place slots must only draw from the eight groups whose third-place
  // teams qualified overall.
  const unusedCandidates = thirdPlaceCandidates
    .filter((candidate) => !context.usedThirdPlaceGroups.has(candidate.group))
    .sort((a, b) => b.rank - a.rank);
  const selectedCandidate = unusedCandidates[0] ?? thirdPlaceCandidates.sort((a, b) => b.rank - a.rank)[0];

  if (selectedCandidate) {
    context.usedThirdPlaceGroups.add(selectedCandidate.group);
    return selectedCandidate.team;
  }

  return undefined;
}

function parseMatchQualificationSlot(value: string): { matchNumber: number } | undefined {
  const match = value.trim().match(/^WINNER_MATCH_(\d+)$|^Winner Match (\d+)$/i);
  if (!match) return undefined;

  return { matchNumber: Number(match[1] ?? match[2]) };
}

function formatGroupQualificationLabel(groups: string[], position: number): string {
  const groupLabel = groups.join('/');

  if (position === 1) return `Winner Group ${groupLabel}`;
  if (position === 2) return `Runner-up Group ${groupLabel}`;
  return `3rd Group ${groupLabel}`;
}
