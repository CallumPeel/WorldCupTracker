import { useMemo } from 'react';
import { useFixtures } from '../hooks/useFixtures';
import { useUserData } from '../hooks/useUserData';
import { generateKnockoutBracket, getTournamentWinner } from '../utils/bracketGenerator';
import { motion } from 'framer-motion';

export function Knockout() {
  const { fixtures, loading } = useFixtures();
  const { scores } = useUserData();

  const knockoutRounds = useMemo(() => {
    return generateKnockoutBracket(fixtures, scores);
  }, [fixtures, scores]);

  const winner = useMemo(() => {
    return getTournamentWinner(knockoutRounds);
  }, [knockoutRounds]);

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
      <div className="sticky top-0 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border z-30 safe-top">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">Knockout Bracket</h1>
          <p className="text-gray-400 text-sm mt-1">
            Generated from your entered scores
          </p>
        </div>
      </div>

      {/* Tournament Winner */}
      {winner && (
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card text-center bg-gradient-to-br from-yellow-500/10 to-primary/10 border-2 border-yellow-500/30"
          >
            <div className="text-6xl mb-4">🏆</div>
            <div className="text-2xl font-bold mb-2">Tournament Winner</div>
            <div className="flex items-center justify-center gap-3">
              <span className="text-5xl">{winner.flag}</span>
              <div>
                <div className="text-3xl font-bold">{winner.name}</div>
                <div className="text-gray-400">{winner.code}</div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Knockout Rounds */}
      <div className="container mx-auto px-4 py-6">
        {knockoutRounds.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              Knockout bracket will appear here once you enter group stage results
            </div>
            <div className="text-sm text-gray-500">
              Complete the group stage matches to see the knockout bracket
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {knockoutRounds.map((round) => (
              <div key={round.stage} className="card">
                <h3 className="text-xl font-bold mb-4">
                  {round.stage.replace(/_/g, ' ')}
                </h3>
                <div className="space-y-3">
                  {round.matches.map((match, index) => (
                    <div
                      key={index}
                      className="bg-dark-elevated rounded-xl p-4 border border-dark-border"
                    >
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                        {/* Home Team */}
                        <div className="flex items-center gap-3">
                          {match.homeTeam ? (
                            <>
                              <span className="text-3xl">{match.homeTeam.flag}</span>
                              <div className="flex-1">
                                <div className="font-semibold">{match.homeTeam.name}</div>
                                <div className="text-xs text-gray-500">{match.homeTeam.code}</div>
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-500 italic">TBD</div>
                          )}
                        </div>

                        {/* Score */}
                        {match.score ? (
                          <div className="flex items-center gap-2 px-4">
                            <span className="text-2xl font-bold tabular-nums">{match.score.homeScore}</span>
                            <span className="text-gray-500">-</span>
                            <span className="text-2xl font-bold tabular-nums">{match.score.awayScore}</span>
                          </div>
                        ) : (
                          <div className="text-gray-500 px-4">VS</div>
                        )}

                        {/* Away Team */}
                        <div className="flex items-center gap-3 flex-row-reverse">
                          {match.awayTeam ? (
                            <>
                              <span className="text-3xl">{match.awayTeam.flag}</span>
                              <div className="flex-1 text-right">
                                <div className="font-semibold">{match.awayTeam.name}</div>
                                <div className="text-xs text-gray-500">{match.awayTeam.code}</div>
                              </div>
                            </>
                          ) : (
                            <div className="text-gray-500 italic">TBD</div>
                          )}
                        </div>
                      </div>

                      {/* Winner Badge */}
                      {match.winner && (
                        <div className="mt-3 pt-3 border-t border-dark-border flex items-center justify-center gap-2 text-primary">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="font-semibold">{match.winner.name} advances</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
