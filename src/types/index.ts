// Core data types for the World Cup Tracker

export interface Team {
  id: number;
  name: string;
  code: string; // FIFA code (e.g., "BRA", "ARG")
  flag: string; // URL or emoji (kept for backward compatibility)
  group?: string; // Group letter (A-L for 2026)
  colors?: {
    primary: string; // Hex color
    secondary: string; // Hex color
  };
}

export interface Venue {
  id: number;
  name: string;
  city: string;
  country: string;
}

export type MatchStage = 
  | 'GROUP_STAGE'
  | 'ROUND_OF_32'
  | 'ROUND_OF_16'
  | 'QUARTER_FINAL'
  | 'SEMI_FINAL'
  | 'THIRD_PLACE'
  | 'FINAL';

export interface Fixture {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  date: string; // ISO 8601 format
  venue: Venue;
  stage: MatchStage;
  group?: string; // Only for group stage matches
  matchNumber: number;
}

// User-entered data (stored locally)
export interface MatchScore {
  fixtureId: number;
  homeScore: number;
  awayScore: number;
  enteredAt: string; // ISO timestamp
}

export interface MatchWatchStatus {
  fixtureId: number;
  watched: boolean;
  watchedAt?: string; // ISO timestamp
}

export interface MatchReminder {
  fixtureId: number;
  enabled: boolean;
  minutesBefore: number; // e.g., 30 = 30 minutes before kickoff
  notificationSent?: boolean;
}

// Computed data
export interface GroupStanding {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface GroupTable {
  group: string;
  standings: GroupStanding[];
}

// Knockout bracket structures
export interface KnockoutMatch {
  fixtureId?: number;
  homeTeam?: Team;
  awayTeam?: Team;
  homeLabel?: string;
  awayLabel?: string;
  winner?: Team;
  score?: MatchScore;
  isProvisional?: boolean; // True if teams are based on incomplete group data
}

export interface KnockoutRound {
  stage: MatchStage;
  matches: KnockoutMatch[];
}

// User preferences
export interface UserSettings {
  darkMode: boolean;
  notifications: boolean;
  defaultReminderMinutes: number;
  favoriteTeamCodes: string[];
  lastFixtureUpdate?: string; // ISO timestamp
}

// API response types (sanitized)
export interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    venue: {
      id: number;
      name: string;
      city: string;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
      code?: string;
      logo?: string;
    };
    away: {
      id: number;
      name: string;
      code?: string;
      logo?: string;
    };
  };
  league: {
    round: string;
  };
  // Note: We explicitly ignore any score/result fields from the API
}

// Export/Import data structure
export interface UserData {
  scores: MatchScore[];
  watchStatus: MatchWatchStatus[];
  reminders: MatchReminder[];
  settings: UserSettings;
  exportedAt: string;
  version: string;
}

// Countdown display
export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}
