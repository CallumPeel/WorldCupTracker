import type { Fixture, MatchStage, ApiFixture } from '../types';

/**
 * Sanitizes API fixture data by removing ALL spoiler information
 * This is the CRITICAL anti-spoiler protection layer
 */
export function sanitizeApiFixture(apiData: ApiFixture): Fixture {
  // Extract only safe, non-spoiler data
  const stage = parseStage(apiData.league.round);
  const group = parseGroup(apiData.league.round);

  return {
    id: apiData.fixture.id,
    homeTeam: {
      id: apiData.teams.home.id,
      name: apiData.teams.home.name,
      code: apiData.teams.home.code || apiData.teams.home.name.substring(0, 3).toUpperCase(),
      flag: apiData.teams.home.logo || '🏴',
      group,
    },
    awayTeam: {
      id: apiData.teams.away.id,
      name: apiData.teams.away.name,
      code: apiData.teams.away.code || apiData.teams.away.name.substring(0, 3).toUpperCase(),
      flag: apiData.teams.away.logo || '🏴',
      group,
    },
    date: apiData.fixture.date,
    venue: {
      id: apiData.fixture.venue.id,
      name: apiData.fixture.venue.name,
      city: apiData.fixture.venue.city,
      country: '', // Will be filled from venue data
    },
    stage,
    group,
    matchNumber: apiData.fixture.id,
  };
}

/**
 * Parses stage from round string
 */
function parseStage(round: string): MatchStage {
  const roundLower = round.toLowerCase();
  
  if (roundLower.includes('group')) return 'GROUP_STAGE';
  if (roundLower.includes('round of 32')) return 'ROUND_OF_32';
  if (roundLower.includes('round of 16')) return 'ROUND_OF_16';
  if (roundLower.includes('quarter')) return 'QUARTER_FINAL';
  if (roundLower.includes('semi')) return 'SEMI_FINAL';
  if (roundLower.includes('third')) return 'THIRD_PLACE';
  if (roundLower.includes('final')) return 'FINAL';
  
  return 'GROUP_STAGE';
}

/**
 * Extracts group letter from round string
 */
function parseGroup(round: string): string | undefined {
  const match = round.match(/Group ([A-L])/i);
  return match ? match[1].toUpperCase() : undefined;
}

/**
 * Fetches fixtures from API (with sanitization)
 * For now, this uses local data. In production, it would call an API
 */
export async function fetchFixtures(): Promise<Fixture[]> {
  try {
    // In production, this would be an API call:
    // const response = await fetch('https://api-football.com/v3/fixtures?league=1&season=2026');
    // const data = await response.json();
    // return data.response.map(sanitizeApiFixture);
    
    // For now, load from local JSON
    const response = await fetch('/fixtures.json');
    const data = await response.json();
    return data.fixtures || [];
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    return [];
  }
}

/**
 * Saves fixtures to localStorage for offline access
 */
export function saveFixturesToCache(fixtures: Fixture[]): void {
  try {
    localStorage.setItem('cached_fixtures', JSON.stringify(fixtures));
    localStorage.setItem('fixtures_cached_at', new Date().toISOString());
  } catch (error) {
    console.error('Error caching fixtures:', error);
  }
}

/**
 * Loads fixtures from cache
 */
export function loadFixturesFromCache(): Fixture[] | null {
  try {
    const cached = localStorage.getItem('cached_fixtures');
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error loading cached fixtures:', error);
    return null;
  }
}

/**
 * Gets the last fixture update timestamp
 */
export function getLastFixtureUpdate(): string | null {
  return localStorage.getItem('fixtures_cached_at');
}

/**
 * Updates fixtures while preserving user data
 * This is the "Update Fixtures" button functionality
 */
export async function updateFixtures(): Promise<Fixture[]> {
  const newFixtures = await fetchFixtures();
  saveFixturesToCache(newFixtures);
  return newFixtures;
}
