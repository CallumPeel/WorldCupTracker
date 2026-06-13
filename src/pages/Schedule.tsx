import { useState, useMemo } from 'react';
import { DateHeader } from '../components/DateHeader';
import { ScheduleMatchCard } from '../components/ScheduleMatchCard';
import { ScoreEntry } from '../components/ScoreEntry';
import { useFixtures } from '../hooks/useFixtures';
import { useUserData } from '../hooks/useUserData';
import { getLocalDateFromKey, getLocalDateKey } from '../utils/timezone';
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
  const [expandedPastDateKeys, setExpandedPastDateKeys] = useState<Set<string>>(new Set());
  const favoriteTeamCodes = userData.settings?.favoriteTeamCodes ?? [];

  // Group fixtures by date
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, Fixture[]>();
    
    fixtures.forEach((fixture) => {
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
  }, [fixtures]);

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
      <section key={group.dateKey} className="py-3 sm:py-4">
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
            className="mt-3 w-full rounded-lg border border-dark-border bg-dark-surface/80 px-4 py-3 text-left transition-all hover:border-primary/50 hover:bg-dark-elevated"
            aria-expanded={isPastDayExpanded}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-gray-300">
                {isPastDayExpanded
                  ? 'Hide old matches'
                  : `Show ${group.matches.length} old ${group.matches.length === 1 ? 'match' : 'matches'}`}
              </span>
              <span className="text-xs font-semibold text-primary">
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
          <div className="schedule-day-grid mt-3">
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
            {pastGroups.length > 0 && (
              <section className="py-3 sm:py-4">
                <button
                  type="button"
                  onClick={() => setShowPastArchive((current) => !current)}
                  className={`w-full rounded-xl border px-4 py-4 text-left transition-all hover:border-primary/50 hover:bg-dark-elevated ${
                    pastArchiveMissingScoreCount > 0 || pastArchiveUnwatchedCount > 0
                      ? 'border-amber-300/20 bg-gradient-to-br from-amber-500/[0.05] via-dark-surface to-sky-500/[0.04]'
                      : 'border-dark-border bg-dark-surface'
                  }`}
                  aria-expanded={showPastArchive}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold uppercase tracking-wide text-gray-400">Past matches</div>
                      <div className="mt-1 text-lg font-bold text-white">
                        {showPastArchive ? 'Hide match archive' : `${pastArchiveMatchCount} old matches hidden`}
                      </div>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {showPastArchive ? 'Collapse archive' : 'Open archive'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>{pastGroups.length} old {pastGroups.length === 1 ? 'day' : 'days'}</span>
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

            {currentAndFutureGroups.map(renderScheduleGroup)}
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
