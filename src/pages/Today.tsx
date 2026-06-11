import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { HeroMatchCard } from '../components/HeroMatchCard';
import { CompactMatchCard } from '../components/CompactMatchCard';
import { ScoreEntry } from '../components/ScoreEntry';
import { useFixtures } from '../hooks/useFixtures';
import { useUserData } from '../hooks/useUserData';
import { isToday } from '../utils/timezone';
import type { Fixture } from '../types';

export function Today() {
  const { fixtures, loading, error } = useFixtures();
  const userData = useUserData();
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  const { todayFixtures, nextUpcoming, stats } = useMemo(() => {
    const now = new Date();
    
    // Filter fixtures happening today
    const todayFixtures = fixtures.filter(f => isToday(f.date));
    
    // Find next upcoming unwatched match
    const upcomingUnwatched = fixtures
      .filter(f => {
        const fixtureDate = new Date(f.date);
        const hasScore = userData.getScoreForFixture(f.id);
        return fixtureDate > now && !hasScore;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const nextUpcoming = upcomingUnwatched[0] || null;
    
    // Calculate stats
    const todayWithReminders = todayFixtures.filter(f => userData.hasReminder(f.id)).length;
    
    return {
      todayFixtures: todayFixtures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      nextUpcoming,
      stats: {
        todayCount: todayFixtures.length,
        withReminders: todayWithReminders,
      }
    };
  }, [fixtures, userData]);

  if (loading && !userData.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-subtle">
          <div className="text-primary text-xl font-bold">Loading...</div>
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
      <div className="sticky top-0 nav-glass border-b border-dark-border z-30 safe-top">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Today</h1>
              {stats.todayCount > 0 && (
                <p className="text-sm text-gray-400 mt-1">
                  {stats.todayCount} {stats.todayCount === 1 ? 'match' : 'matches'} today
                  {stats.withReminders > 0 && ` • ${stats.withReminders} reminder${stats.withReminders > 1 ? 's' : ''}`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Hero Card - Next Upcoming Match */}
        {nextUpcoming && (
          <div className="mb-8">
            <HeroMatchCard
              fixture={nextUpcoming}
              hasReminder={userData.hasReminder(nextUpcoming.id)}
              onReminderClick={() => userData.toggleReminder(nextUpcoming.id)}
              onCardClick={() => setSelectedFixture(nextUpcoming)}
            />
          </div>
        )}

        {/* Today's Matches */}
        {todayFixtures.length > 0 ? (
          <div>
            <h2 className="text-lg font-bold mb-4 text-gray-400 uppercase tracking-wide text-xs">
              Today's Matches
            </h2>
            <motion.div 
              className="fixture-grid space-y-3"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {todayFixtures.map((fixture) => (
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
              ))}
            </motion.div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚽</div>
            <h3 className="text-xl font-bold mb-2">No matches today</h3>
            <p className="text-gray-400">
              {nextUpcoming 
                ? 'Next match shown above' 
                : 'Check the Schedule for upcoming matches'}
            </p>
          </div>
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
