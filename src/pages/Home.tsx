import { useState, useMemo } from 'react';
import { ScoreEntry } from '../components/ScoreEntry';
import { UltraCompactMatchRow } from '../components/UltraCompactMatchRow';
import { TournamentStats } from '../components/TournamentStats';
import { FinalCountdown } from '../components/FinalCountdown';
import { CountryFlag } from '../components/CountryFlag';
import { useFixtures } from '../hooks/useFixtures';
import { useUserData } from '../hooks/useUserData';
import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown, getPerthTimeOnly } from '../utils/timezone';
import type { Fixture } from '../types';

export function Home() {
  const { fixtures, loading, error } = useFixtures();
  const userData = useUserData();
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  const { nextMatch, upcomingFive } = useMemo(() => {
    const now = new Date();
    
    // Find next upcoming unwatched match
    const upcomingUnwatched = fixtures
      .filter(f => {
        const fixtureDate = new Date(f.date);
        const hasScore = userData.getScoreForFixture(f.id);
        return fixtureDate > now && !hasScore;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const nextMatch = upcomingUnwatched[0] || null;
    const upcomingFive = upcomingUnwatched.slice(0, 5);
    
    return { nextMatch, upcomingFive };
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
      <div className="sticky top-0 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border z-30 safe-top">
        <div className="page-shell py-3">
          <h1 className="text-2xl font-bold">Home</h1>
        </div>
      </div>

      <div className="page-shell page-stack">
        <div className="home-dashboard-grid">
          {/* Next Match Section */}
          {nextMatch && <NextMatchCard fixture={nextMatch} onClick={() => setSelectedFixture(nextMatch)} />}

          {/* Next 5 Matches */}
          {upcomingFive.length > 0 && (
            <section className="min-w-0 h-full flex flex-col">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                Next {upcomingFive.length} Matches
              </h2>
              <div className="space-y-1.5 flex-1">
                {upcomingFive.map((fixture) => (
                  <UltraCompactMatchRow
                    key={fixture.id}
                    fixture={fixture}
                    onClick={() => setSelectedFixture(fixture)}
                  />
                ))}
              </div>
            </section>
          )}

          <TournamentStats fixtures={fixtures} scores={userData.scores} />
          <FinalCountdown />
        </div>

        {/* Empty state */}
        {!nextMatch && fixtures.length > 0 && (
          <div className="text-center py-12 border border-dark-border rounded-xl">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">All matches watched!</h3>
            <p className="text-gray-400">Check the Schedule to review fixtures</p>
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

// Compact next match card
function NextMatchCard({ fixture, onClick }: { fixture: Fixture; onClick: () => void }) {
  const timeRemaining = useCountdown(fixture.date);

  return (
    <div 
      onClick={onClick}
      className="border border-primary/30 rounded-xl dense-card bg-dark-surface cursor-pointer hover:border-primary/50 transition-colors"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Next Match
        </span>
        {fixture.group && (
          <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-dark-elevated rounded-md border border-dark-border">
            Group {fixture.group}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4 mb-3">
        <div className="flex items-center gap-2 flex-1">
          <CountryFlag countryCode={fixture.homeTeam.code} size="lg" className="flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-bold text-lg sm:text-xl truncate">{fixture.homeTeam.name}</div>
            <div className="text-xs text-gray-500">{fixture.homeTeam.code}</div>
          </div>
        </div>

        <div className="text-base sm:text-xl font-bold text-gray-600">vs</div>

        <div className="flex items-center gap-2 flex-1 flex-row-reverse">
          <CountryFlag countryCode={fixture.awayTeam.code} size="lg" className="flex-shrink-0" />
          <div className="text-right min-w-0">
            <div className="font-bold text-lg sm:text-xl truncate">{fixture.awayTeam.name}</div>
            <div className="text-xs text-gray-500">{fixture.awayTeam.code}</div>
          </div>
        </div>
      </div>

      {/* Match Info */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-dark-border text-sm">
        <div className="flex items-center gap-2 text-gray-400 min-w-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-white">{getPerthTimeOnly(fixture.date)}</span>
          <span className="text-gray-500">•</span>
          <span className="truncate">{fixture.venue.city}</span>
        </div>
        
        {!timeRemaining.isPast && (
          <div className="text-primary font-bold tabular-nums">
            {formatCountdown(timeRemaining)}
          </div>
        )}
      </div>
    </div>
  );
}
