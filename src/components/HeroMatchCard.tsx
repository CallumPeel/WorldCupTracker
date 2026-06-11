import { motion } from 'framer-motion';
import type { Fixture } from '../types';
import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown } from '../utils/timezone';
import { getPerthTimeOnly } from '../utils/timezone';
import { CountryFlag } from './CountryFlag';
import { getTeamColors, getGroupColor } from '../utils/teamColors';

interface HeroMatchCardProps {
  fixture: Fixture;
  hasReminder?: boolean;
  onReminderClick: () => void;
  onCardClick: () => void;
}

export function HeroMatchCard({
  fixture,
  hasReminder,
  onReminderClick,
  onCardClick,
}: HeroMatchCardProps) {
  const timeRemaining = useCountdown(fixture.date);
  const homeColors = getTeamColors(fixture.homeTeam.code);
  const awayColors = getTeamColors(fixture.awayTeam.code);
  const groupColor = fixture.group ? getGroupColor(fixture.group) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      onClick={onCardClick}
      className="relative overflow-hidden rounded-3xl border p-6 cursor-pointer transition-all"
      style={{
        background: groupColor 
          ? `linear-gradient(135deg, ${groupColor}15 0%, #1c1c1e 50%, ${groupColor}15 100%)`
          : 'linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 50%, #2c2c2e 100%)',
        borderColor: groupColor || '#38383a',
      }}
    >
      {/* Next Match Label */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Next Match
          </span>
        </div>
        {fixture.group && (
          <span 
            className="px-3 py-1 text-xs font-bold rounded-full text-white"
            style={{ backgroundColor: groupColor }}
          >
            Group {fixture.group}
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="flex-1 flex flex-col items-end">
          <div 
            className="p-2 rounded-xl mb-2"
            style={{ backgroundColor: `${homeColors.primary}15` }}
          >
            <CountryFlag countryCode={fixture.homeTeam.code} size="xl" />
          </div>
          <h3 className="text-2xl font-bold text-right">{fixture.homeTeam.name}</h3>
          <span className="text-sm font-semibold" style={{ color: homeColors.primary }}>{fixture.homeTeam.code}</span>
        </div>

        <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">vs</div>

        <div className="flex-1 flex flex-col items-start">
          <div 
            className="p-2 rounded-xl mb-2"
            style={{ backgroundColor: `${awayColors.primary}15` }}
          >
            <CountryFlag countryCode={fixture.awayTeam.code} size="xl" />
          </div>
          <h3 className="text-2xl font-bold">{fixture.awayTeam.name}</h3>
          <span className="text-sm font-semibold" style={{ color: awayColors.primary }}>{fixture.awayTeam.code}</span>
        </div>
      </div>

      {/* Countdown */}
      {!timeRemaining.isPast && (
        <div className="text-center mb-6">
          <div className="text-sm text-gray-400 mb-2">Starts in</div>
          <div 
            className="text-4xl font-bold tabular-nums"
            style={{ 
              background: groupColor 
                ? `linear-gradient(135deg, ${groupColor} 0%, ${homeColors.primary} 50%, ${awayColors.primary} 100%)`
                : `linear-gradient(135deg, ${homeColors.primary} 0%, #0a84ff 50%, ${awayColors.primary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {formatCountdown(timeRemaining)}
          </div>
        </div>
      )}

      {/* Match Details */}
      <div className="flex items-center justify-center gap-4 mb-6 text-gray-400">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold text-white">{getPerthTimeOnly(fixture.date)}</span>
          <span className="text-gray-500">Perth</span>
        </div>
        <span className="text-gray-600">•</span>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm">{fixture.venue.name}</span>
        </div>
      </div>

      {/* Reminder Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReminderClick();
        }}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          hasReminder
            ? 'bg-primary text-white'
            : 'bg-dark-elevated text-gray-300 hover:bg-dark-border border border-dark-border'
        }`}
      >
        {hasReminder ? '✓ Reminder Set' : 'Set Reminder'}
      </button>
    </motion.div>
  );
}
