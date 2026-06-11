import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Fixture, MatchScore } from '../types';

interface ScoreEntryProps {
  fixture: Fixture;
  existingScore?: MatchScore;
  onSave: (score: MatchScore) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export function ScoreEntry({
  fixture,
  existingScore,
  onSave,
  onDelete,
  onClose,
}: ScoreEntryProps) {
  const [homeScore, setHomeScore] = useState(existingScore?.homeScore?.toString() || '');
  const [awayScore, setAwayScore] = useState(existingScore?.awayScore?.toString() || '');

  const handleSave = () => {
    const home = parseInt(homeScore) || 0;
    const away = parseInt(awayScore) || 0;

    if (home < 0 || away < 0) {
      alert('Scores must be 0 or greater');
      return;
    }

    onSave({
      fixtureId: fixture.id,
      homeScore: home,
      awayScore: away,
      enteredAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this score?')) {
      onDelete?.();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-dark-surface rounded-3xl p-6 w-full max-w-2xl border border-dark-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {existingScore ? 'Edit Score' : 'Enter Score'}
            </h2>
            <button
              onClick={onClose}
              className="tap-target rounded-full hover:bg-dark-elevated transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Teams */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-8">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl">{fixture.homeTeam.flag}</span>
              <div className="text-center">
                <div className="font-semibold text-lg">{fixture.homeTeam.name}</div>
                <div className="text-xs text-gray-500">{fixture.homeTeam.code}</div>
              </div>
              <input
                type="number"
                min="0"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                placeholder="0"
                className="w-24 h-24 text-5xl font-bold text-center bg-dark-elevated border-2 border-dark-border focus:border-primary rounded-2xl outline-none transition-colors tabular-nums"
                autoFocus
              />
            </div>

            {/* VS */}
            <div className="text-3xl font-bold text-gray-500">VS</div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-5xl">{fixture.awayTeam.flag}</span>
              <div className="text-center">
                <div className="font-semibold text-lg">{fixture.awayTeam.name}</div>
                <div className="text-xs text-gray-500">{fixture.awayTeam.code}</div>
              </div>
              <input
                type="number"
                min="0"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                placeholder="0"
                className="w-24 h-24 text-5xl font-bold text-center bg-dark-elevated border-2 border-dark-border focus:border-primary rounded-2xl outline-none transition-colors tabular-nums"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {existingScore && onDelete && (
              <button
                onClick={handleDelete}
                className="btn-secondary text-red-500 hover:bg-red-500/10"
              >
                Delete
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 btn-primary"
            >
              Save Score
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
