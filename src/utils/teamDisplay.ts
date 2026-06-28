import type { Team } from '../types';

export type TeamDisplayVariant = 'compact' | 'hero' | 'full';

const ACTUAL_TEAM_SHORT_NAMES: Record<string, string> = {
  BIH: 'Bosnia',
};

const ACTUAL_TEAM_HERO_NAMES: Record<string, string> = {
  BIH: 'Bosnia',
};

export function getTeamDisplayName(team: Team, variant: TeamDisplayVariant = 'compact'): string {
  const placeholderLabel = getPlaceholderDisplayName(team, variant);
  if (placeholderLabel) return placeholderLabel;

  if (variant === 'full') return team.name;
  if (variant === 'hero') return ACTUAL_TEAM_HERO_NAMES[team.code] ?? ACTUAL_TEAM_SHORT_NAMES[team.code] ?? team.name;

  return ACTUAL_TEAM_SHORT_NAMES[team.code] ?? team.name;
}

export function getTeamFullName(team: Team): string {
  return getReadablePlaceholderName(team) ?? team.name;
}

export function getTeamSecondaryLabel(team: Team): string | undefined {
  if (isPlaceholderTeam(team)) return 'TBD';

  return team.code;
}

function getPlaceholderDisplayName(team: Team, variant: TeamDisplayVariant): string | undefined {
  const groupSlot = parseGroupQualificationSlot(team.code) ?? parseGroupQualificationSlot(team.name);
  if (groupSlot) {
    if (variant === 'full') return formatGroupQualificationLabel(groupSlot.groups, groupSlot.position, 'full');
    return formatGroupQualificationLabel(groupSlot.groups, groupSlot.position, 'short');
  }

  const matchSlot = parseMatchQualificationSlot(team.code) ?? parseMatchQualificationSlot(team.name);
  if (matchSlot) {
    const prefix = matchSlot.outcome === 'winner' ? 'Winner' : 'Loser';
    const compactPrefix = matchSlot.outcome === 'winner' ? 'W' : 'L';

    return variant === 'full'
      ? `${prefix} Match ${matchSlot.matchNumber}`
      : `${compactPrefix} Match ${matchSlot.matchNumber}`;
  }

  return undefined;
}

function getReadablePlaceholderName(team: Team): string | undefined {
  return getPlaceholderDisplayName(team, 'full');
}

function isPlaceholderTeam(team: Team): boolean {
  return Boolean(
    parseGroupQualificationSlot(team.code) ||
    parseGroupQualificationSlot(team.name) ||
    parseMatchQualificationSlot(team.code) ||
    parseMatchQualificationSlot(team.name)
  );
}

interface GroupQualificationSlot {
  groups: string[];
  position: number;
}

function parseGroupQualificationSlot(value: string): GroupQualificationSlot | undefined {
  const normalized = value.trim();
  const internalMatch = normalized.match(/^(WINNER|RUNNER_UP|THIRD_PLACE)_GROUP_([A-L](?:_[A-L])*)_?$/i);
  if (internalMatch) {
    return {
      groups: internalMatch[2].toUpperCase().split('_'),
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

function parseMatchQualificationSlot(value: string): { outcome: 'winner' | 'loser'; matchNumber: number } | undefined {
  const match = value.trim().match(/^(WINNER|LOSER)_MATCH_(\d+)$|^(Winner|Loser) Match (\d+)$/i);
  if (!match) return undefined;

  const outcome = (match[1] ?? match[3]).toLowerCase() === 'winner' ? 'winner' : 'loser';

  return { outcome, matchNumber: Number(match[2] ?? match[4]) };
}

function formatGroupQualificationLabel(
  groups: string[],
  position: number,
  style: 'short' | 'full'
): string {
  const groupLabel = groups.join('/');

  if (style === 'full') {
    if (position === 1) return `Winner Group ${groupLabel}`;
    if (position === 2) return `Runner-up Group ${groupLabel}`;
    return `Third-place Group ${groupLabel}`;
  }

  if (position === 1) return `Winner ${groupLabel}`;
  if (position === 2) return `Runner-up ${groupLabel}`;
  return `3rd ${groupLabel}`;
}