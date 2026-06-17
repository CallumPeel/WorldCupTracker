import { useMemo, useState } from 'react';
import { BracketMatch } from '../components/BracketMatch';
import { ScoreEntry } from '../components/ScoreEntry';
import { CountryFlag } from '../components/CountryFlag';
import { useFixtures } from '../hooks/useFixtures';
import { useUserData } from '../hooks/useUserData';
import { generateKnockoutBracket, getTournamentWinner } from '../utils/bracketGenerator';
import type { Fixture } from '../types';

const ZOOM_LEVELS = [0.6, 0.75, 0.9, 1, 1.15] as const;
const DEFAULT_ZOOM_INDEX = 3;

export function Knockout() {
  const { fixtures, loading } = useFixtures();
  const userData = useUserData();
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [collapsedRounds, setCollapsedRounds] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showZoomIndicator, setShowZoomIndicator] = useState(false);
  const favoriteTeamCodes = userData.settings?.favoriteTeamCodes ?? [];

  const knockoutRounds = useMemo(() => {
    return generateKnockoutBracket(fixtures, userData.scores);
  }, [fixtures, userData.scores]);

  const winner = useMemo(() => {
    return getTournamentWinner(knockoutRounds);
  }, [knockoutRounds]);

  const visibleRounds = knockoutRounds.filter(round => !collapsedRounds.has(round.stage));

  const handleMatchClick = (fixtureId?: number) => {
    if (!fixtureId) return;
    const fixture = fixtures.find(f => f.id === fixtureId);
    if (fixture) {
      setSelectedFixture(fixture);
    }
  };

  const toggleRoundCollapse = (stage: string) => {
    setCollapsedRounds((current) => {
      const next = new Set(current);
      if (next.has(stage)) {
        next.delete(stage);
      } else {
        next.add(stage);
      }
      return next;
    });
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((current) => {
      const newZoom = Math.max(0.5, Math.min(1.5, current + delta));
      return Math.round(newZoom * 100) / 100;
    });
    setShowZoomIndicator(true);
    setTimeout(() => setShowZoomIndicator(false), 1500);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      handleZoom(delta);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      (e.currentTarget as any)._lastPinchDistance = distance;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const lastDistance = (e.currentTarget as any)._lastPinchDistance;
      if (lastDistance) {
        const delta = (distance - lastDistance) / 200;
        handleZoom(delta);
      }
      (e.currentTarget as any)._lastPinchDistance = distance;
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
        <div className="container mx-auto px-4 py-2 landscape:py-1.5">
          <h1 className="text-2xl font-bold landscape:text-lg">Knockout</h1>
          <p className="text-xs text-gray-500 mt-1 landscape:hidden">
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
          <>
            {/* Zoom Indicator */}
            {showZoomIndicator && (
              <div className="fixed top-20 right-4 z-50 rounded-lg bg-dark-elevated border border-primary/30 px-4 py-2 shadow-lg animate-fade-in">
                <div className="text-sm font-bold text-primary">
                  {Math.round(zoomLevel * 100)}%
                </div>
              </div>
            )}

            <div 
              className="overflow-x-auto pb-4 custom-scrollbar"
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              style={{ touchAction: 'pan-x pan-y' }}
            >
              <div
                style={{
                  width: `${100 / zoomLevel}%`,
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top left',
                }}
              >
                <div className="inline-flex gap-8 min-w-full">
                  {knockoutRounds.map((round, roundIndex) => {
                    const isCollapsed = collapsedRounds.has(round.stage);
                    const isVisible = !isCollapsed;

                    return (
                <div key={round.stage} className={`flex flex-col transition-all ${isCollapsed ? 'w-12' : ''}`}>
                  {/* Round Header */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => toggleRoundCollapse(round.stage)}
                      className="w-full text-center hover:bg-dark-elevated rounded-lg px-2 py-1.5 transition-all group cursor-pointer border border-transparent hover:border-primary/30"
                    >
                      {isCollapsed ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-bold text-primary/60 group-hover:text-primary transition-colors">→</span>
                          <span className="text-[10px] font-bold text-gray-500 group-hover:text-gray-300 transition-colors" style={{ writingMode: 'vertical-rl' }}>
                            {formatStageName(round.stage)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider group-hover:text-gray-200 transition-colors">
                            {formatStageName(round.stage)}
                          </h3>
                          <span className="text-sm text-primary/60 group-hover:text-primary transition-colors">←</span>
                        </div>
                      )}
                    </button>
                    {isVisible && (
                      <div className="text-xs text-gray-600 mt-1 text-center">
                        {round.matches.length} {round.matches.length === 1 ? 'match' : 'matches'}
                      </div>
                    )}
                  </div>

                  {/* Matches */}
                  {isVisible && (
                    <div className="flex flex-col justify-around flex-1 gap-4">
                      {round.matches.map((match, matchIndex) => (
                        <div key={matchIndex} className="flex items-center">
                          {/* Connecting line from previous round */}
                          {roundIndex > 0 && !collapsedRounds.has(knockoutRounds[roundIndex - 1].stage) && (
                            <div className="w-6 h-px bg-dark-border mr-2"></div>
                          )}
                          
                          <BracketMatch
                            match={match}
                            favoriteTeamCodes={favoriteTeamCodes}
                            onClick={() => handleMatchClick(match.fixtureId)}
                          />

                          {/* Connecting line to next round */}
                          {roundIndex < knockoutRounds.length - 1 && (
                            <div className="w-6 h-px bg-dark-border ml-2"></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Hints */}
        {knockoutRounds.length > 0 && (
          <div className="text-center mt-4 text-xs text-gray-500">
            <div>Click round headers to collapse/expand · Pinch or Ctrl+Scroll to zoom</div>
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
