import { useState, useMemo } from 'react';
import { DateHeader } from '../components/DateHeader';
import { ScheduleMatchCard } from '../components/ScheduleMatchCard';
import { ScoreEntry } from '../components/ScoreEntry';
import { useFixtures } from '../hooks/useFixtures';
import { useUserData } from '../hooks/useUserData';
import { fetchGroupStageResultScores } from '../utils/groupStageResults';
import { getLocalDateFromKey, getLocalDateKey } from '../utils/timezone';
import { resolveFixtures } from '../utils/fixtureResolution';
import type { Fixture } from '../types';

interface ScheduleDateGroup {
  dateKey: string;
  date: Date;
  matches: Fixture[];
}

interface ScheduleDateGroupView {
  group: ScheduleDateGroup;
  isToday: boolean;
  isTomorrow: boolean;
  isPastDay: boolean;
  isPastDayExpanded: boolean;
  missingScoreCount: number;
  unwatchedCount: number;
}

export function Schedule() {
  const { fixtures, loading, error } = useFixtures();
  const userData = useUserData();
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [showPastArchive, setShowPastArchive] = useState(false);
  const [isFillingGroupStageScores, setIsFillingGroupStageScores] = useState(false);
  const [expandedPastDateKeys, setExpandedPastDateKeys] = useState<Set<string>>(new Set());
  const favoriteTeamCodes = userData.settings?.favoriteTeamCodes ?? [];
  const resolvedFixtures = useMemo(() => resolveFixtures(fixtures, userData.scores), [fixtures, userData.scores]);

  // Group fixtures by date
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, Fixture[]>();
    
    resolvedFixtures.forEach((fixture) => {
      // Use the viewer's local calendar date as key (YYYY-MM-DD) to match displayed match dates.
      const dateKey = getLocalDateKey(fixture.date);
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(fixture);
    });

    // Convert to array and sort by date, then sort matches within each group
    return Array.from(groups.entries())
      .map(([dateKey, matches]) => ({
        dateKey,
        date: getLocalDateFromKey(dateKey),
        matches: matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [resolvedFixtures]);

  if (loading && !userData.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-subtle">
          <div className="text-primary text-xl font-bold">Loading fixtures...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card max-w-md text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error</div>
          <div className="text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const now = new Date();

  const scheduleGroups: ScheduleDateGroupView[] = groupedByDate.map((group) => {
    const groupDate = new Date(group.date);
    groupDate.setHours(0, 0, 0, 0);

    return {
      group,
      isToday: groupDate.getTime() === today.getTime(),
      isTomorrow: groupDate.getTime() === tomorrow.getTime(),
      isPastDay: group.matches.every((fixture) => new Date(fixture.date).getTime() <= now.getTime()),
      isPastDayExpanded: expandedPastDateKeys.has(group.dateKey),
      missingScoreCount: group.matches.filter((fixture) => !userData.getScoreForFixture(fixture.id)).length,
      unwatchedCount: group.matches.filter((fixture) => !userData.isWatched(fixture.id)).length,
    };
  });

  const pastGroups = scheduleGroups.filter(({ isPastDay }) => isPastDay);
  const currentAndFutureGroups = scheduleGroups.filter(({ isPastDay }) => !isPastDay);
  const pastArchiveMatchCount = pastGroups.reduce((total, { group }) => total + group.matches.length, 0);
  const pastArchiveMissingScoreCount = pastGroups.reduce(
    (total, { missingScoreCount }) => total + missingScoreCount,
    0
  );
  const pastArchiveUnwatchedCount = pastGroups.reduce((total, { unwatchedCount }) => total + unwatchedCount, 0);
  const groupStageFixtures = fixtures.filter((fixture) => fixture.stage === 'GROUP_STAGE');
  const groupStageFixtureIds = new Set(groupStageFixtures.map((fixture) => fixture.id));
  const enteredGroupStageScoreCount = userData.scores.filter((score) => groupStageFixtureIds.has(score.fixtureId)).length;
  const missingGroupStageScoreCount = Math.max(groupStageFixtures.length - enteredGroupStageScoreCount, 0);

  const handleFillGroupStageScores = async () => {
    const hasExistingGroupStageScores = enteredGroupStageScoreCount > 0;
    const confirmationMessage = hasExistingGroupStageScores
      ? 'Overwrite your group match scores?'
      : 'Fill all group match scores?';

    if (!confirm(confirmationMessage)) {
      return;
    }

    setIsFillingGroupStageScores(true);

    try {
      const scores = await fetchGroupStageResultScores();
      await userData.addScores(scores);
      alert(`Added ${scores.length} group-stage scores.`);
    } catch (error) {
      console.error('Error filling group stage scores:', error);
      alert(error instanceof Error ? error.message : 'Failed to fill group stage scores');
    } finally {
      setIsFillingGroupStageScores(false);
    }
  };

  const togglePastDate = (dateKey: string) => {
    setExpandedPastDateKeys((current) => {
      const next = new Set(current);

      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }

      return next;
    });
  };

  const renderScheduleGroup = ({
    group,
    isToday,
    isTomorrow,
    isPastDay,
    isPastDayExpanded,
    missingScoreCount,
    unwatchedCount,
  }: ScheduleDateGroupView) => {
    const shouldShowMatches = !isPastDay || isPastDayExpanded;

    return (
      <section
        key={group.dateKey}
        className={`py-3 sm:py-4 ${isPastDay ? 'rounded-xl bg-amber-500/[0.025] px-2 ring-1 ring-amber-300/10' : ''}`}
      >
        <DateHeader
          date={group.date}
          isToday={isToday}
          isTomorrow={isTomorrow}
          matchCount={group.matches.length}
        />

        {isPastDay && (
          <button
            type="button"
            onClick={() => togglePastDate(group.dateKey)}
            className="mt-3 w-full rounded-lg border border-amber-300/20 bg-gradient-to-br from-amber-500/[0.07] via-dark-surface/85 to-dark-surface/80 px-4 py-3 text-left transition-all hover:border-amber-300/35 hover:bg-dark-elevated"
            aria-expanded={isPastDayExpanded}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-amber-50/90">
                {isPastDayExpanded
                  ? 'Hide old matches'
                  : `Show ${group.matches.length} old ${group.matches.length === 1 ? 'match' : 'matches'}`}
              </span>
              <span className="text-xs font-semibold text-amber-300/90">
                {isPastDayExpanded ? 'Collapse' : 'Expand'}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
              <span>{group.matches.length} hidden</span>
              {missingScoreCount > 0 && (
                <span className="font-semibold text-amber-300/80">{missingScoreCount} need scores</span>
              )}
              {unwatchedCount > 0 && (
                <span className="font-semibold text-sky-300/80">{unwatchedCount} unwatched</span>
              )}
              {missingScoreCount === 0 && unwatchedCount === 0 && <span>All caught up</span>}
            </div>
          </button>
        )}

        {shouldShowMatches && (
          <div className={`schedule-day-grid mt-3 ${isPastDay ? 'rounded-lg bg-amber-500/[0.025] p-1.5' : ''}`}>
            {group.matches.map((fixture) => (
              <ScheduleMatchCard
                key={fixture.id}
                fixture={fixture}
                score={userData.getScoreForFixture(fixture.id)}
                watched={userData.isWatched(fixture.id)}
                favoriteTeamCodes={favoriteTeamCodes}
                onScoreClick={() => setSelectedFixture(fixture)}
                onWatchClick={() => userData.toggleWatchStatus(fixture.id)}
              />
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 nav-glass border-b border-dark-border z-30 safe-top">
        <div className="page-shell py-3">
          <h1 className="text-2xl font-bold">Schedule</h1>
        </div>
      </div>

      {/* Grouped Fixtures */}
      <div className="page-shell page-stack pt-0">
        {groupedByDate.length === 0 ? (
          <div className="py-12 text-center border border-dark-border rounded-xl mt-4">
            <div className="text-gray-400 text-lg">No matches found</div>
          </div>
        ) : (
          <>
            {currentAndFutureGroups.map(renderScheduleGroup)}

            {pastGroups.length > 0 && (
              <section className="pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowPastArchive((current) => !current)}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition-all hover:border-primary/50 hover:bg-dark-elevated ${
                    pastArchiveMissingScoreCount > 0 || pastArchiveUnwatchedCount > 0
                      ? 'border-amber-300/15 bg-gradient-to-br from-amber-500/[0.035] via-dark-surface to-sky-500/[0.025]'
                      : 'border-dark-border bg-dark-surface'
                  }`}
                  aria-expanded={showPastArchive}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Past matches</div>
                      <div className="mt-0.5 text-sm font-bold text-white sm:text-base">
                        {showPastArchive ? 'Hide match archive' : `${pastArchiveMatchCount} old matches hidden`}
                      </div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      {showPastArchive ? 'Collapse archive' : 'Open archive'}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>{pastGroups.length} past match {pastGroups.length === 1 ? 'day' : 'days'}</span>
                    {pastArchiveMissingScoreCount > 0 && (
                      <span className="font-semibold text-amber-300/80">
                        {pastArchiveMissingScoreCount} need scores
                      </span>
                    )}
                    {pastArchiveUnwatchedCount > 0 && (
                      <span className="font-semibold text-sky-300/80">
                        {pastArchiveUnwatchedCount} unwatched
                      </span>
                    )}
                    {pastArchiveMissingScoreCount === 0 && pastArchiveUnwatchedCount === 0 && <span>All caught up</span>}
                  </div>
                </button>

                {showPastArchive && <div className="mt-2">{pastGroups.map(renderScheduleGroup)}</div>}
              </section>
            )}

            {groupStageFixtures.length > 0 && missingGroupStageScoreCount > 0 && (
              <section className="mt-3 rounded-lg border border-primary/15 bg-dark-surface/70 px-3 py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-primary/80">Group stage results</div>
                    <p className="mt-0.5 text-sm text-gray-400">
                      {missingGroupStageScoreCount} of {groupStageFixtures.length} group-stage scores still need results.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleFillGroupStageScores}
                    disabled={isFillingGroupStageScores || userData.loading}
                    className="btn-primary whitespace-nowrap px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isFillingGroupStageScores ? 'Filling...' : 'Fill group scores'}
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Score Entry Modal */}
      {selectedFixture && (
        <ScoreEntry
          fixture={selectedFixture}
          existingScore={userData.getScoreForFixture(selectedFixture.id)}
          onSave={userData.addScore}
          onDelete={
            userData.getScoreForFixture(selectedFixture.id)
              ? () => userData.removeScore(selectedFixture.id)
              : undefined
          }
          onClose={() => setSelectedFixture(null)}
        />
      )}
    </div>
  );
}
