import { motion } from 'framer-motion';
import type { Fixture, MatchScore } from '../types';
import { CountdownTimer } from './CountdownTimer';
import { getFriendlyDateLabel, getPerthTimeOnly } from '../utils/timezone';
import { CountryFlag } from './CountryFlag';
import { getTeamColors, getGroupColor } from '../utils/teamColors';

interface MatchCardProps {
  fixture: Fixture;
  score?: MatchScore;
  watched?: boolean;
  hasReminder?: boolean;
  onScoreClick: () => void;
  onWatchClick: () => void;
  onReminderClick: () => void;
}

export function MatchCard({
  fixture,
  score,
  watched,
  hasReminder,
  onScoreClick,
  onWatchClick,
  onReminderClick,
}: MatchCardProps) {
  const hasScore = !!score;
  const homeColors = getTeamColors(fixture.homeTeam.code);
  const awayColors = getTeamColors(fixture.awayTeam.code);
  const groupColor = fixture.group ? getGroupColor(fixture.group) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card hover:bg-dark-elevated transition-colors duration-200 relative overflow-hidden"
      style={{
        borderLeft: groupColor ? `3px solid ${groupColor}` : undefined,
      }}
    >
      {/* Date & Time Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-dark-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {getFriendlyDateLabel(fixture.date)}
          </span>
          <span className="text-sm text-gray-500">•</span>
          <span className="text-sm font-medium text-white">
            {getPerthTimeOnly(fixture.date)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Stage Badge */}
          {fixture.stage === 'GROUP_STAGE' && fixture.group && (
            <span 
              className="px-2 py-1 text-xs font-semibold rounded-lg text-white"
              style={{ backgroundColor: groupColor }}
            >
              Group {fixture.group}
            </span>
          )}
          {fixture.stage !== 'GROUP_STAGE' && (
            <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg">
              {fixture.stage.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Home Team */}
        <div className="flex-1 flex items-center gap-3">
          <div 
            className="p-1 rounded-lg"
            style={{ backgroundColor: `${homeColors.primary}20` }}
          >
            <CountryFlag countryCode={fixture.homeTeam.code} size="lg" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-lg">{fixture.homeTeam.name}</div>
            <div className="text-xs" style={{ color: homeColors.primary }}>{fixture.homeTeam.code}</div>
          </div>
        </div>

        {/* Score or Countdown */}
        <div className="flex flex-col items-center min-w-[100px]">
          {hasScore ? (
            <button
              onClick={onScoreClick}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-dark-elevated hover:bg-dark-border transition-colors"
            >
              <span className="text-3xl font-bold">{score.homeScore}</span>
              <span className="text-gray-500">-</span>
              <span className="text-3xl font-bold">{score.awayScore}</span>
            </button>
          ) : (
            <button
              onClick={onScoreClick}
              className="px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary font-semibold transition-colors"
            >
              Add Score
            </button>
          )}
          {!hasScore && (
            <div className="mt-2">
              <CountdownTimer date={fixture.date} compact />
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex items-center gap-3 flex-row-reverse">
          <div 
            className="p-1 rounded-lg"
            style={{ backgroundColor: `${awayColors.primary}20` }}
          >
            <CountryFlag countryCode={fixture.awayTeam.code} size="lg" />
          </div>
          <div className="flex-1 text-right">
            <div className="font-semibold text-lg">{fixture.awayTeam.name}</div>
            <div className="text-xs" style={{ color: awayColors.primary }}>{fixture.awayTeam.code}</div>
          </div>
        </div>
      </div>

      {/* Venue */}
      <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{fixture.venue.name}, {fixture.venue.city}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onWatchClick}
          className={`flex-1 tap-target rounded-xl font-semibold transition-all duration-200 ${
            watched
              ? 'bg-primary text-white'
              : 'bg-dark-elevated text-gray-400 hover:bg-dark-border'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill={watched ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{watched ? 'Watched' : 'Mark Watched'}</span>
          </div>
        </button>

        <button
          onClick={onReminderClick}
          className={`tap-target px-4 rounded-xl font-semibold transition-all duration-200 ${
            hasReminder
              ? 'bg-primary text-white'
              : 'bg-dark-elevated text-gray-400 hover:bg-dark-border'
          }`}
        >
          <svg className="w-5 h-5" fill={hasReminder ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
