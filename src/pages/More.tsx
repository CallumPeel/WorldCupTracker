import { useMemo } from 'react';
import { CountryFlag } from '../components/CountryFlag';
import { useFixtures } from '../hooks/useFixtures';
import { useUserData } from '../hooks/useUserData';
import type { Team } from '../types';

function isSelectableTeam(team: Team): boolean {
  return Boolean(team.group) && !team.code.includes('_');
}

export function More() {
  const { fixtures, loading: fixturesLoading, error } = useFixtures();
  const userData = useUserData();
  const favoriteTeamCodes = userData.settings?.favoriteTeamCodes ?? [];
  const favoriteCodeSet = new Set(favoriteTeamCodes);

  const teams = useMemo(() => {
    const teamMap = new Map<string, Team>();

    fixtures.forEach((fixture) => {
      [fixture.homeTeam, fixture.awayTeam].forEach((team) => {
        if (isSelectableTeam(team)) {
          teamMap.set(team.code, team);
        }
      });
    });

    return Array.from(teamMap.values()).sort((a, b) => {
      const groupCompare = (a.group ?? '').localeCompare(b.group ?? '');
      return groupCompare || a.name.localeCompare(b.name);
    });
  }, [fixtures]);

  const toggleFavoriteTeam = async (teamCode: string) => {
    const nextFavoriteTeamCodes = favoriteCodeSet.has(teamCode)
      ? favoriteTeamCodes.filter((code) => code !== teamCode)
      : [...favoriteTeamCodes, teamCode];

    await userData.updateSettings({ favoriteTeamCodes: nextFavoriteTeamCodes });
  };

  return (
    <div className="min-h-screen pb-24">
      <div className="sticky top-0 nav-glass border-b border-dark-border z-30 safe-top">
        <div className="page-shell py-3">
          <p className="text-[0.65rem] font-black uppercase tracking-[0.35em] text-primary/80">Settings</p>
          <h1 className="text-2xl font-bold">Favourite Teams</h1>
        </div>
      </div>

      <div className="page-shell page-stack">
        <section className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold mb-2">Pick your teams</h2>
              <p className="text-sm text-gray-400 max-w-2xl">
                Selected teams get special highlights across the schedule and group tables. Choose as many or as few as you like.
              </p>
            </div>
            <div className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
              {favoriteTeamCodes.length} selected
            </div>
          </div>
        </section>

        {(fixturesLoading || userData.loading) && (
          <div className="py-12 text-center border border-dark-border rounded-xl">
            <div className="text-primary text-lg font-bold">Loading teams...</div>
          </div>
        )}

        {error && (
          <div className="card border-red-500/40 text-center">
            <div className="text-red-400 font-bold mb-1">Could not load teams</div>
            <div className="text-sm text-gray-400">{error}</div>
          </div>
        )}

        {!fixturesLoading && !userData.loading && !error && (
          <div className="groups-auto-grid">
            {teams.map((team) => {
              const selected = favoriteCodeSet.has(team.code);

              return (
                <button
                  key={team.code}
                  type="button"
                  onClick={() => toggleFavoriteTeam(team.code)}
                  className={`relative overflow-hidden dense-card rounded-lg border text-left transition-all ${
                    selected
                      ? 'border-primary bg-primary/10 shadow-[0_0_18px_rgba(10,132,255,0.28)]'
                      : 'border-dark-border bg-dark-surface hover:border-primary/40 hover:bg-white/[0.04]'
                  }`}
                >
                  {selected && (
                    <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/15 via-transparent to-emerald-400/10" />
                  )}
                  <div className="relative flex items-center gap-3">
                    <div className={`rounded-lg p-1 ${selected ? 'bg-primary/20 shadow-[0_0_12px_rgba(10,132,255,0.4)]' : 'bg-dark-elevated'}`}>
                      <CountryFlag countryCode={team.code} size="md" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold truncate">{team.name}</div>
                      <div className="text-xs text-gray-500">{team.code} · Group {team.group}</div>
                    </div>
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-black ${
                        selected
                          ? 'border-emerald-300 bg-emerald-400 text-black shadow-[0_0_14px_rgba(52,211,153,0.75)]'
                          : 'border-white/15 text-gray-500'
                      }`}
                    >
                      {selected ? '✓' : '+'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!fixturesLoading && !userData.loading && !error && teams.length === 0 && (
          <div className="py-12 text-center border border-dark-border rounded-xl">
            <div className="text-gray-400 text-lg">No teams found</div>
          </div>
        )}

        <section className="card">
          <h2 className="text-xl font-bold mb-3">About</h2>
          <div className="space-y-2 text-sm text-gray-400">
            <p>FIFA World Cup 2026 Tracker</p>
            <p>All scores and standings are based on your manually entered results only.</p>
            <p>Times are shown in your device&apos;s local timezone.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
