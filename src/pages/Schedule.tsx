import { useState, useMemo } from 'react';
import { CompactMatchCard } from '../components/CompactMatchCard';
import { ScoreEntry } from '../components/ScoreEntry';
import { useFixtures } from '../hooks/useFixtures';
import { useUserData } from '../hooks/useUserData';
import type { Fixture } from '../types';

export function Schedule() {
  const { fixtures, loading, error } = useFixtures();
  const userData = useUserData();
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'watched'>('all');

  const filteredFixtures = useMemo(() => {
    let filtered = [...fixtures];

    if (filter === 'upcoming') {
      filtered = filtered.filter((f) => {
        const hasScore = userData.getScoreForFixture(f.id);
        return !hasScore;
      });
    } else if (filter === 'watched') {
      filtered = filtered.filter((f) => userData.isWatched(f.id));
    }

    // Sort by date
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [fixtures, filter, userData]);

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

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border z-30 safe-top">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold mb-4">Schedule</h1>
          
          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-dark-elevated text-gray-400 hover:bg-dark-border'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filter === 'upcoming'
                  ? 'bg-primary text-white'
                  : 'bg-dark-elevated text-gray-400 hover:bg-dark-border'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('watched')}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filter === 'watched'
                  ? 'bg-primary text-white'
                  : 'bg-dark-elevated text-gray-400 hover:bg-dark-border'
              }`}
            >
              Watched
            </button>
          </div>
        </div>
      </div>

      {/* Fixtures */}
      <div className="container mx-auto px-4 py-6">
        <div className="fixture-grid space-y-3">
          {filteredFixtures.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-gray-400 text-lg">No matches found</div>
            </div>
          ) : (
            filteredFixtures.map((fixture) => (
              <CompactMatchCard
                key={fixture.id}
                fixture={fixture}
                score={userData.getScoreForFixture(fixture.id)}
                watched={userData.isWatched(fixture.id)}
                hasReminder={userData.hasReminder(fixture.id)}
                onScoreClick={() => setSelectedFixture(fixture)}
                onWatchClick={() => userData.toggleWatchStatus(fixture.id)}
                onReminderClick={() => userData.toggleReminder(fixture.id)}
              />
            ))
          )}
        </div>
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
