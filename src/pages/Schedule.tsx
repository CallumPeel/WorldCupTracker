import { useState, useMemo } from 'react';
import { DateHeader } from '../components/DateHeader';
import { ScheduleMatchCard } from '../components/ScheduleMatchCard';
import { ScoreEntry } from '../components/ScoreEntry';
import { useFixtures } from '../hooks/useFixtures';
import { useUserData } from '../hooks/useUserData';
import { getPerthDateKey } from '../utils/timezone';
import type { Fixture } from '../types';

export function Schedule() {
  const { fixtures, loading, error } = useFixtures();
  const userData = useUserData();
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  // Group fixtures by date
  const groupedByDate = useMemo(() => {
    const groups = new Map<string, Fixture[]>();
    
    fixtures.forEach((fixture) => {
      // Use Perth calendar date as key (YYYY-MM-DD) to match displayed match dates.
      const dateKey = getPerthDateKey(fixture.date);
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(fixture);
    });

    // Convert to array and sort by date, then sort matches within each group
    return Array.from(groups.entries())
      .map(([dateKey, matches]) => ({
        dateKey,
        date: new Date(dateKey),
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

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border z-30 safe-top">
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
          groupedByDate.map((group) => {
            const groupDate = new Date(group.date);
            groupDate.setHours(0, 0, 0, 0);
            
            const isToday = groupDate.getTime() === today.getTime();
            const isTomorrow = groupDate.getTime() === tomorrow.getTime();

            return (
              <section key={group.dateKey} className="py-3 sm:py-4">
                <DateHeader
                  date={group.date}
                  isToday={isToday}
                  isTomorrow={isTomorrow}
                  matchCount={group.matches.length}
                />
                
                <div className="schedule-day-grid mt-3">
                  {group.matches.map((fixture) => (
                    <ScheduleMatchCard
                      key={fixture.id}
                      fixture={fixture}
                      score={userData.getScoreForFixture(fixture.id)}
                      watched={userData.isWatched(fixture.id)}
                      onScoreClick={() => setSelectedFixture(fixture)}
                      onWatchClick={() => userData.toggleWatchStatus(fixture.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })
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
