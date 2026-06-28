import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ScoreEntry } from '../components/ScoreEntry';
import { UltraCompactMatchRow } from '../components/UltraCompactMatchRow';
import { TournamentStats } from '../components/TournamentStats';
import { FinalCountdown } from '../components/FinalCountdown';
import { CountryFlag } from '../components/CountryFlag';
import { useFixtures } from '../hooks/useFixtures';
import { useUserData } from '../hooks/useUserData';
import { useCountdown } from '../hooks/useCountdown';
import { formatCountdown, formatFullLocalDate, getFriendlyDateLabel, getLocalTimeOnly } from '../utils/timezone';
import { getGroupColor, getStageColor, getTeamColors } from '../utils/teamColors';
import { getTeamDisplayName, getTeamFullName } from '../utils/teamDisplay';
import { getFavoriteTeamAccent, getMixedFavoriteTeamAccent } from '../utils/favoriteTeams';
import { resolveFixtures } from '../utils/fixtureResolution';
import { fetchGroupStageResultScores } from '../utils/groupStageResults';
import type { Fixture } from '../types';

export function Home() {
  const { fixtures, loading, error } = useFixtures();
  const userData = useUserData();
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [isFillingGroupStageScores, setIsFillingGroupStageScores] = useState(false);
  const favoriteTeamCodes = userData.settings?.favoriteTeamCodes ?? [];
  const resolvedFixtures = useMemo(() => resolveFixtures(fixtures, userData.scores), [fixtures, userData.scores]);
  const groupStageFixtures = fixtures.filter((fixture) => fixture.stage === 'GROUP_STAGE');
  const groupStageFixtureIds = new Set(groupStageFixtures.map((fixture) => fixture.id));
  const enteredGroupStageScoreCount = userData.scores.filter((score) => groupStageFixtureIds.has(score.fixtureId)).length;
  const missingGroupStageScoreCount = Math.max(groupStageFixtures.length - enteredGroupStageScoreCount, 0);
  const hasIncompleteGroupStageScores = missingGroupStageScoreCount > 0;

  const { nextMatch, upcomingFive, shouldPromptForGroupScores } = useMemo(() => {
    const now = new Date();
    const fixturesForUpcoming = hasIncompleteGroupStageScores ? fixtures : resolvedFixtures;

    const upcomingUnwatched = fixturesForUpcoming
      .filter((fixture) => {
        const fixtureDate = new Date(fixture.date);
        const hasScore = userData.getScoreForFixture(fixture.id);
        return fixtureDate > now && !hasScore;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstUpcoming = upcomingUnwatched[0] || null;
    const shouldPromptForGroupScores = Boolean(
      hasIncompleteGroupStageScores && firstUpcoming && firstUpcoming.stage !== 'GROUP_STAGE'
    );

    return {
      nextMatch: shouldPromptForGroupScores ? null : firstUpcoming,
      upcomingFive: shouldPromptForGroupScores ? [] : upcomingUnwatched.slice(0, 5),
      shouldPromptForGroupScores,
    };
  }, [fixtures, hasIncompleteGroupStageScores, resolvedFixtures, userData]);

  const handleFillGroupStageScores = async () => {
    const confirmationMessage = enteredGroupStageScoreCount > 0
      ? 'Overwrite your group match scores?'
      : 'Fill all group match scores?';

    if (!confirm(confirmationMessage)) {
      return;
    }

    setIsFillingGroupStageScores(true);

    try {
      const scores = await fetchGroupStageResultScores();
      await userData.addScores(scores);
      alert(`Added ${scores.length} group-stage scores.`);
    } catch (error) {
      console.error('Error filling group stage scores:', error);
      alert(error instanceof Error ? error.message : 'Failed to fill group stage scores');
    } finally {
      setIsFillingGroupStageScores(false);
    }
  };

  if (loading && !userData.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dashboard-backdrop">
        <div className="animate-pulse-subtle">
          <div className="text-primary text-xl font-bold">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen dashboard-backdrop">
        <div className="card max-w-md text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error</div>
          <div className="text-gray-400">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 dashboard-backdrop">
      <div className="sticky top-0 nav-glass border-b border-dark-border z-30 safe-top">
        <div className="page-shell py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.35em] text-primary/80">World Cup HQ</p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Match Dashboard</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-gray-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)]" />
            Local time
          </div>
        </div>
      </div>

      <div className="page-shell page-stack">
        <div className="home-dashboard-grid">
          {shouldPromptForGroupScores && (
            <GroupScoresPrompt
              missingScoreCount={missingGroupStageScoreCount}
              totalGroupStageCount={groupStageFixtures.length}
              enteredGroupStageScoreCount={enteredGroupStageScoreCount}
              isFilling={isFillingGroupStageScores}
              onFillScores={handleFillGroupStageScores}
            />
          )}

          {nextMatch && <NextMatchCard fixture={nextMatch} favoriteTeamCodes={favoriteTeamCodes} onClick={() => setSelectedFixture(nextMatch)} />}

          {upcomingFive.length > 0 && (
            <section className="min-w-0 h-full flex flex-col next-fixtures-panel">
              <div className="flex items-end justify-between gap-3 mb-3 px-1">
                <div>
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.28em] text-primary/80">On deck</p>
                  <h2 className="text-xl font-black tracking-tight">Coming up next</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-gray-300">
                  {upcomingFive.length} fixtures
                </span>
              </div>
              <div className="space-y-2 flex-1">
                {upcomingFive.map((fixture) => (
                  <UltraCompactMatchRow
                    key={fixture.id}
                    fixture={fixture}
                    favoriteTeamCodes={favoriteTeamCodes}
                    onClick={() => setSelectedFixture(fixture)}
                  />
                ))}
              </div>
            </section>
          )}

          <TournamentStats fixtures={fixtures} scores={userData.scores} />
          <FinalCountdown />
        </div>

        {!nextMatch && fixtures.length > 0 && (
          <div className={`text-center py-12 border border-dark-border rounded-xl bg-dark-surface/80 ${shouldPromptForGroupScores ? 'hidden' : ''}`}>
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-2">All matches watched!</h3>
            <p className="text-gray-400">Check the Schedule to review fixtures</p>
          </div>
        )}
      </div>

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

function GroupScoresPrompt({
  missingScoreCount,
  totalGroupStageCount,
  enteredGroupStageScoreCount,
  isFilling,
  onFillScores,
}: {
  missingScoreCount: number;
  totalGroupStageCount: number;
  enteredGroupStageScoreCount: number;
  isFilling: boolean;
  onFillScores: () => void;
}) {
  return (
    <section className="next-match-hero relative overflow-hidden border border-amber-300/40 bg-gradient-to-br from-amber-500/10 via-dark-surface to-primary/10">
      <div className="absolute inset-0 opacity-80 pointer-events-none">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(252,211,77,0.9)]" />
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.28em]">Action needed</span>
            </div>
            <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black uppercase tracking-wider text-black">
              Group scores incomplete
            </span>
          </div>

          <h2 className="max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Update group scores before showing the next knockout match
          </h2>
          <p className="mt-4 max-w-3xl text-base font-semibold text-gray-300 sm:text-lg">
            Knockout teams depend on the final group standings. You have entered {enteredGroupStageScoreCount}/{totalGroupStageCount} group-stage scores, with {missingScoreCount} still missing.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
          <div className="text-xs font-black uppercase tracking-[0.25em] text-gray-400">Recommended</div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onFillScores}
              disabled={isFilling}
              className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFilling ? 'Filling scores...' : 'Fill all group scores'}
            </button>
            <Link
              to="/schedule"
              className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-center text-xs sm:text-sm font-black uppercase tracking-wider text-white transition-colors hover:bg-white/15"
            >
              Add manually in Schedule
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function NextMatchCard({ fixture, favoriteTeamCodes = [], onClick }: { fixture: Fixture; favoriteTeamCodes?: string[]; onClick: () => void }) {
  const timeRemaining = useCountdown(fixture.date);
  const homeColors = getTeamColors(fixture.homeTeam.code);
  const awayColors = getTeamColors(fixture.awayTeam.code);
  const homeName = getTeamDisplayName(fixture.homeTeam, 'hero');
  const awayName = getTeamDisplayName(fixture.awayTeam, 'hero');
  const accentColor = fixture.group ? getGroupColor(fixture.group) : getStageColor(fixture.stage);
  const stageLabel = fixture.stage === 'GROUP_STAGE' && fixture.group
    ? `Group ${fixture.group}`
    : fixture.stage.replace(/_/g, ' ');
  
  const favoriteCodeSet = new Set(favoriteTeamCodes);
  const favoriteTeams = [fixture.homeTeam, fixture.awayTeam].filter((team) => favoriteCodeSet.has(team.code));
  const favoriteAccent =
    favoriteTeams.length > 1
      ? getMixedFavoriteTeamAccent()
      : favoriteTeams[0]
        ? getFavoriteTeamAccent(favoriteTeams[0].code, `${favoriteTeams[0].name} match`)
        : undefined;

  return (
    <div
      onClick={onClick}
      className={`next-match-hero group cursor-pointer relative overflow-hidden ${favoriteAccent ? 'next-match-hero-special' : ''}`}
      style={{
        '--home-color': homeColors.primary,
        '--away-color': awayColors.primary,
        '--accent-color': accentColor,
        '--favorite-accent': favoriteAccent?.border,
        '--favorite-glow': favoriteAccent?.glow,
        border: favoriteAccent ? `2px solid ${favoriteAccent.border}` : undefined,
        boxShadow: favoriteAccent ? `0 0 0 1px ${favoriteAccent.glow}, 0 0 24px ${favoriteAccent.glow}` : undefined,
      } as React.CSSProperties}
    >
      {favoriteAccent && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[5]">
          <span className="favorite-hero-shimmer" />
          <span
            className="favorite-hero-orbit favorite-hero-orbit-one"
            style={{ color: favoriteAccent.confetti[0] }}
          >
            ✦
          </span>
          <span
            className="favorite-hero-orbit favorite-hero-orbit-two"
            style={{ color: favoriteAccent.confetti[1] }}
          >
            ✧
          </span>
          <span
            className="favorite-hero-confetti absolute right-6 top-6 h-2 w-2 rounded-full shadow-[0_0_12px_currentColor]"
            style={{ backgroundColor: favoriteAccent.confetti[0], color: favoriteAccent.confetti[0] }}
          />
          <span
            className="favorite-hero-confetti favorite-hero-confetti-delay absolute right-16 top-10 h-1.5 w-4 rotate-12 rounded-full shadow-[0_0_12px_currentColor]"
            style={{ backgroundColor: favoriteAccent.confetti[1], color: favoriteAccent.confetti[1] }}
          />
          <span
            className="favorite-hero-confetti absolute bottom-6 left-8 h-3 w-3 rounded-sm rotate-45 shadow-[0_0_12px_currentColor]"
            style={{ backgroundColor: favoriteAccent.confetti[2], color: favoriteAccent.confetti[2] }}
          />
          <span
            className="favorite-hero-confetti favorite-hero-confetti-delay absolute bottom-10 right-24 text-lg leading-none drop-shadow-[0_0_8px_currentColor]"
            style={{ color: favoriteAccent.confetti[3] ?? favoriteAccent.border }}
          >
            ✦
          </span>
        </div>
      )}
      <div className="absolute inset-0 opacity-80 transition-opacity group-hover:opacity-100 pointer-events-none">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full blur-3xl" style={{ backgroundColor: `${homeColors.primary}55` }} />
        <div className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full blur-3xl" style={{ backgroundColor: `${awayColors.primary}55` }} />
        <div className="absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-full blur-3xl" style={{ backgroundColor: `${accentColor}35` }} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.28em]">Next Match</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {favoriteAccent && (
              <span
                className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-[0_0_12px_currentColor]"
                style={{ backgroundColor: `${favoriteAccent.border}33`, color: favoriteAccent.border }}
              >
                ✦ {favoriteAccent.pill}
              </span>
            )}
            <span className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider text-black" style={{ backgroundColor: accentColor }}>
              {stageLabel}
            </span>
            <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs font-bold text-gray-200">
              Match #{fixture.matchNumber}
            </span>
          </div>
        </div>

        <div className="next-match-teams">
          <TeamHeroSide align="left" code={fixture.homeTeam.code} name={homeName} fullName={getTeamFullName(fixture.homeTeam)} color={homeColors.primary} />
          <div className="vs-orb"><span>VS</span></div>
          <TeamHeroSide align="right" code={fixture.awayTeam.code} name={awayName} fullName={getTeamFullName(fixture.awayTeam)} color={awayColors.primary} />
        </div>

        <div className="hero-info-grid">
          <div className="hero-countdown-tile">
            <div className="text-xs font-black uppercase tracking-[0.25em] text-gray-400 mb-2">Starts in</div>
            <div className="text-5xl sm:text-6xl lg:text-7xl font-black tabular-nums leading-none tracking-tight">
              {!timeRemaining.isPast ? formatCountdown(timeRemaining) : 'Started'}
            </div>
          </div>

          <div className="hero-detail-tile">
            <div className="text-xs font-black uppercase tracking-[0.25em] text-gray-400 mb-2">Kick-off</div>
            <div className="text-3xl sm:text-4xl font-black tracking-tight">{getLocalTimeOnly(fixture.date)}</div>
            <div className="mt-1 text-sm sm:text-base font-semibold text-gray-300">
              {getFriendlyDateLabel(fixture.date)} · {formatFullLocalDate(fixture.date)}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-sm sm:text-base">
          <div className="flex items-center gap-2 text-gray-300 min-w-0">
            <svg className="w-5 h-5 text-primary-light flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-bold truncate">{fixture.venue.name}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-400 truncate">{fixture.venue.city}</span>
          </div>
          <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-white">
            Tap to add score
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamHeroSide({
  align,
  code,
  name,
  fullName,
  color,
}: {
  align: 'left' | 'right';
  code: string;
  name: string;
  fullName: string;
  color: string;
}) {
  const isRight = align === 'right';

  return (
    <div className={`team-hero-side ${isRight ? 'team-hero-side-right' : ''}`}>
      <div className="flag-plinth" style={{ backgroundColor: `${color}24`, borderColor: `${color}66` }}>
        <CountryFlag countryCode={code} size="xl" className="hero-flag" />
      </div>
      <div className={isRight ? 'text-right' : ''}>
        <div className="text-sm sm:text-base font-black uppercase tracking-[0.28em]" style={{ color }}>{code}</div>
        <h3 className="team-hero-name" title={fullName}>{name}</h3>
      </div>
    </div>
  );
}