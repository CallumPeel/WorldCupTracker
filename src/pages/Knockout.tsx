import { useMemo, useState } from 'react';
import { BracketMatch } from '../components/BracketMatch';
import { ScoreEntry } from '../components/ScoreEntry';
import { CountryFlag } from '../components/CountryFlag';
import { useFixtures } from '../hooks/useFixtures';
import { useUserData } from '../hooks/useUserData';
import { generateKnockoutBracket, getTournamentWinner } from '../utils/bracketGenerator';
import type { Fixture } from '../types';

export function Knockout() {
  const { fixtures, loading } = useFixtures();
  const userData = useUserData();
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);

  const knockoutRounds = useMemo(() => {
    return generateKnockoutBracket(fixtures, userData.scores);
  }, [fixtures, userData.scores]);

  const winner = useMemo(() => {
    return getTournamentWinner(knockoutRounds);
  }, [knockoutRounds]);

  const handleMatchClick = (fixtureId?: number) => {
    if (!fixtureId) return;
    const fixture = fixtures.find(f => f.id === fixtureId);
    if (fixture) {
      setSelectedFixture(fixture);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-subtle">
          <div className="text-primary text-xl font-bold">Loading knockout...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 nav-glass border-b border-dark-border z-30 safe-top">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold">Knockout</h1>
          <p className="text-xs text-gray-500 mt-1">
            Generated from your entered scores
          </p>
        </div>
      </div>

      {/* Tournament Winner */}
      {winner && (
        <div className="container mx-auto px-4 py-4">
          <div className="border-2 border-yellow-500/30 rounded-xl p-4 bg-gradient-to-br from-yellow-500/5 to-primary/5 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-sm font-bold text-gray-400 mb-1">TOURNAMENT WINNER</div>
            <div className="flex items-center justify-center gap-2">
              <CountryFlag countryCode={winner.code} size="lg" />
              <div>
                <div className="text-xl font-bold">{winner.name}</div>
                <div className="text-xs text-gray-500">{winner.code}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Knockout Bracket */}
      <div className="container mx-auto px-4 py-4">
        {knockoutRounds.length === 0 ? (
          <div className="border border-dark-border rounded-xl py-12 text-center">
            <div className="text-gray-400 text-lg mb-2">
              Knockout bracket will appear here
            </div>
            <div className="text-sm text-gray-500">
              Complete group stage matches to see the bracket
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="inline-flex gap-8 min-w-full">
              {knockoutRounds.map((round, roundIndex) => (
                <div key={round.stage} className="flex flex-col">
                  {/* Round Header */}
                  <div className="mb-4 text-center">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                      {formatStageName(round.stage)}
                    </h3>
                    <div className="text-xs text-gray-600 mt-1">
                      {round.matches.length} {round.matches.length === 1 ? 'match' : 'matches'}
                    </div>
                  </div>

                  {/* Matches */}
                  <div className="flex flex-col justify-around flex-1 gap-4">
                    {round.matches.map((match, matchIndex) => (
                      <div key={matchIndex} className="flex items-center">
                        {/* Connecting line from previous round */}
                        {roundIndex > 0 && (
                          <div className="w-6 h-px bg-dark-border mr-2"></div>
                        )}
                        
                        <BracketMatch
                          match={match}
                          onClick={() => handleMatchClick(match.fixtureId)}
                        />

                        {/* Connecting line to next round */}
                        {roundIndex < knockoutRounds.length - 1 && (
                          <div className="w-6 h-px bg-dark-border ml-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scroll hint */}
        {knockoutRounds.length > 2 && (
          <div className="text-center mt-4 text-xs text-gray-500">
            ← Scroll horizontally to view all rounds →
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

function formatStageName(stage: string): string {
  const names: Record<string, string> = {
    'ROUND_OF_32': 'Round of 32',
    'ROUND_OF_16': 'Round of 16',
    'QUARTER_FINAL': 'Quarter Finals',
    'SEMI_FINAL': 'Semi Finals',
    'THIRD_PLACE': 'Third Place',
    'FINAL': 'Final',
  };
  return names[stage] || stage.replace(/_/g, ' ');
}
