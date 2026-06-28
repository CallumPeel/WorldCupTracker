import type { MatchScore } from '../types';

interface GroupStageResultMatch {
  fixtureId: number;
  stage: string;
  status: string;
  score?: {
    home: number;
    away: number;
  };
}

interface GroupStageResultsPayload {
  matches?: GroupStageResultMatch[];
}

const GROUP_STAGE_RESULTS_URL = '/group-stage-results-2026.json';

export async function fetchGroupStageResultScores(): Promise<MatchScore[]> {
  const response = await fetch(GROUP_STAGE_RESULTS_URL, { cache: 'no-cache' });

  if (!response.ok) {
    throw new Error('Failed to load group stage results');
  }

  const payload = (await response.json()) as GroupStageResultsPayload;
  const enteredAt = new Date().toISOString();

  return (payload.matches ?? [])
    .filter((match) => match.stage === 'GROUP_STAGE' && match.status === 'FINISHED' && match.score)
    .map((match) => ({
      fixtureId: match.fixtureId,
      homeScore: match.score!.home,
      awayScore: match.score!.away,
      enteredAt,
    }));
}
