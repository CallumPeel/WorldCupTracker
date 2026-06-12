import { getTeamColors } from './teamColors';

export interface FavoriteTeamAccent {
  border: string;
  glow: string;
  gradient: string;
  pill: string;
  confetti: string[];
}

function getVisibleAccentColor(code: string): string {
  const colors = getTeamColors(code);
  return colors.primary.toLowerCase() === '#ffffff' ? colors.secondary : colors.primary;
}

export function getFavoriteTeamAccent(code: string, label = 'Favourite'): FavoriteTeamAccent {
  const colors = getTeamColors(code);
  const accent = getVisibleAccentColor(code);

  return {
    border: accent,
    glow: `${accent}73`,
    gradient: `linear-gradient(135deg, ${accent}2e, ${colors.secondary}24, rgba(28, 28, 30, 0.85))`,
    pill: label,
    confetti: [accent, colors.secondary, '#ffffff'],
  };
}

export function getMixedFavoriteTeamAccent(): FavoriteTeamAccent {
  return {
    border: '#a78bfa',
    glow: 'rgba(167, 139, 250, 0.5)',
    gradient: 'linear-gradient(135deg, rgba(167, 139, 250, 0.18), rgba(250, 204, 21, 0.14), rgba(34, 197, 94, 0.12))',
    pill: 'My teams!',
    confetti: ['#a78bfa', '#facc15', '#22c55e', '#ffffff'],
  };
}
