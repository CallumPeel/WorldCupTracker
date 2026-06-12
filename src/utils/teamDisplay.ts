import type { Team } from '../types';

export type TeamDisplayVariant = 'compact' | 'hero' | 'full';

const ACTUAL_TEAM_SHORT_NAMES: Record<string, string> = {
  BIH: 'Bosnia & Herz.',
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

function getPlaceholderDisplayName(team: Team, variant: TeamDisplayVariant): string | undefined {
  const groupSlot = parseGroupQualificationSlot(team.code) ?? parseGroupQualificationSlot(team.name);
  if (groupSlot) {
    if (variant === 'full') return formatGroupQualificationLabel(groupSlot.groups, groupSlot.position, 'full');
    return formatGroupQualificationLabel(groupSlot.groups, groupSlot.position, 'short');
  }

  const matchSlot = parseMatchQualificationSlot(team.code) ?? parseMatchQualificationSlot(team.name);
  if (matchSlot) {
    return variant === 'full' ? `Winner Match ${matchSlot.matchNumber}` : `W Match ${matchSlot.matchNumber}`;
  }

  return undefined;
}

function getReadablePlaceholderName(team: Team): string | undefined {
  return getPlaceholderDisplayName(team, 'full');
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

function parseMatchQualificationSlot(value: string): { matchNumber: number } | undefined {
  const match = value.trim().match(/^WINNER_MATCH_(\d+)$|^Winner Match (\d+)$/i);
  if (!match) return undefined;

  return { matchNumber: Number(match[1] ?? match[2]) };
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