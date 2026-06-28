import type { Fixture, MatchScore, Team } from '../types';
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

export interface ResolverContext {
  groupQualifiers: Map<string, Team[]>;
  matchQualifiers: Map<string, Team[]>;
  usedThirdPlaceGroups: Set<string>;
}

export function resolveFixtures(fixtures: Fixture[], scores: MatchScore[]): Fixture[] {
  const context = createResolverContext(fixtures, scores);

  return fixtures.map((fixture) => resolveFixtureTeams(fixture, context));
}

export function createResolverContext(fixtures: Fixture[], scores: MatchScore[]): ResolverContext {
  return {
    groupQualifiers: getGroupQualifiers(fixtures, scores),
    matchQualifiers: new Map<string, Team[]>(),
    usedThirdPlaceGroups: new Set<string>(),
  };
}

export function resolveFixtureTeams(fixture: Fixture, context: ResolverContext): Fixture {
  if (fixture.stage === 'GROUP_STAGE') return fixture;

  const resolvedHome = resolveFixtureTeam(fixture.homeTeam, context);
  const resolvedAway = resolveFixtureTeam(fixture.awayTeam, context);

  return {
    ...fixture,
    homeTeam: resolvedHome.team ?? fixture.homeTeam,
    awayTeam: resolvedAway.team ?? fixture.awayTeam,
  };
}

export function resolveFixtureTeam(fixtureTeam: Team, context: ResolverContext): ResolvedSlot {
  const groupSlot = parseBestGroupQualificationSlot(fixtureTeam);
  if (groupSlot) {
    const team = resolveGroupSlotTeam(groupSlot, context);

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

function getGroupQualifiers(fixtures: Fixture[], scores: MatchScore[]): Map<string, Team[]> {
  const groupTables = calculateGroupStandings(fixtures, scores);
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

function resolveGroupSlotTeam(slot: GroupQualificationSlot, context: ResolverContext): Team | undefined {
  if (slot.position !== 3) {
    return context.groupQualifiers.get(slot.groups[0])?.[slot.position - 1];
  }

  const thirdPlaceCandidates = slot.groups
    .map((group) => ({ group, team: context.groupQualifiers.get(group)?.[2] }))
    .filter((candidate): candidate is { group: string; team: Team } => Boolean(candidate.team));

  const unusedCandidate = thirdPlaceCandidates.find((candidate) => !context.usedThirdPlaceGroups.has(candidate.group));
  const selectedCandidate = unusedCandidate ?? thirdPlaceCandidates[0];

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
