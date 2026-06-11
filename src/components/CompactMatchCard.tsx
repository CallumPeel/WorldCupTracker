import { motion } from 'framer-motion';
import type { Fixture, MatchScore } from '../types';
import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown, getPerthTimeOnly } from '../utils/timezone';

interface CompactMatchCardProps {
  fixture: Fixture;
  score?: MatchScore;
  watched?: boolean;
  hasReminder?: boolean;
  onScoreClick: () => void;
  onWatchClick: () => void;
  onReminderClick: () => void;
}

export function CompactMatchCard({
  fixture,
  score,
  watched,
  hasReminder,
  onScoreClick,
  onWatchClick,
  onReminderClick,
}: CompactMatchCardProps) {
  const timeRemaining = useCountdown(fixture.date);
  const hasScore = !!score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-2xl bg-dark-surface border border-dark-border p-4 hover:border-primary/30 transition-all"
    >
      {/* Main Row: Teams & Score/Countdown */}
      <div className="flex items-center justify-between gap-3 mb-3">
        {/* Home Team */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-3xl flex-shrink-0">{fixture.homeTeam.flag}</span>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-base truncate">{fixture.homeTeam.name}</span>
            <span className="text-xs text-gray-500">{fixture.homeTeam.code}</span>
          </div>
        </div>

        {/* Score or Countdown */}
        <div className="flex-shrink-0">
          {hasScore ? (
            <button
              onClick={onScoreClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-elevated hover:bg-dark-border transition-colors"
            >
              <span className="text-xl font-bold">{score.homeScore}</span>
              <span className="text-gray-500 text-sm">-</span>
              <span className="text-xl font-bold">{score.awayScore}</span>
            </button>
          ) : !timeRemaining.isPast ? (
            <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-primary font-bold text-sm tabular-nums">
                {formatCountdown(timeRemaining)}
              </span>
            </div>
          ) : (
            <button
              onClick={onScoreClick}
              className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-sm font-semibold transition-colors"
            >
              Score
            </button>
          )}
        </div>

        {/* Away Team */}
        <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
          <span className="text-3xl flex-shrink-0">{fixture.awayTeam.flag}</span>
          <div className="flex flex-col items-end min-w-0">
            <span className="font-bold text-base truncate">{fixture.awayTeam.name}</span>
            <span className="text-xs text-gray-500">{fixture.awayTeam.code}</span>
          </div>
        </div>
      </div>

      {/* Metadata Row */}
      <div className="flex items-center justify-between gap-2 mb-3 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Group/Stage */}
          {fixture.stage === 'GROUP_STAGE' && fixture.group && (
            <span className="px-2 py-1 bg-dark-elevated rounded-md font-semibold">
              Group {fixture.group}
            </span>
          )}
          {fixture.stage !== 'GROUP_STAGE' && (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-md font-semibold">
              {fixture.stage.replace('_', ' ')}
            </span>
          )}
          
          {/* Time */}
          <span className="text-gray-400 font-medium">
            {getPerthTimeOnly(fixture.date)}
          </span>

          {/* Venue */}
          <span className="text-gray-500 truncate">
            {fixture.venue.city}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onWatchClick}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            watched
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-dark-elevated text-gray-400 hover:bg-dark-border'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill={watched ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{watched ? 'Watched' : 'Watch'}</span>
          </div>
        </button>

        <button
          onClick={onReminderClick}
          className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            hasReminder
              ? 'bg-primary/20 text-primary border border-primary/30'
              : 'bg-dark-elevated text-gray-400 hover:bg-dark-border'
          }`}
        >
          <svg className="w-4 h-4" fill={hasReminder ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {!hasScore && (
          <button
            onClick={onScoreClick}
            className="py-2 px-3 rounded-lg text-xs font-semibold bg-dark-elevated text-gray-400 hover:bg-dark-border transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}
