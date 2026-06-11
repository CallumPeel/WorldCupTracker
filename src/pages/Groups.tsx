import { useMemo } from 'react';
import { CompactGroupCard } from '../components/CompactGroupCard';
import { useFixtures } from '../hooks/useFixtures';
import { useUserData } from '../hooks/useUserData';
import { calculateGroupStandings } from '../utils/groupCalculator';

export function Groups() {
  const { fixtures, loading } = useFixtures();
  const { scores } = useUserData();

  const groupTables = useMemo(() => {
    return calculateGroupStandings(fixtures, scores);
  }, [fixtures, scores]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse-subtle">
          <div className="text-primary text-xl font-bold">Loading groups...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-dark-bg/95 backdrop-blur-xl border-b border-dark-border z-30 safe-top">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-2xl font-bold">Groups</h1>
          <p className="text-xs text-gray-500 mt-1">
            Based on your entered scores
          </p>
        </div>
      </div>

      {/* Group Cards Grid */}
      <div className="container mx-auto px-4 py-4">
        {groupTables.length === 0 ? (
          <div className="py-12 text-center border border-dark-border rounded-xl">
            <div className="text-gray-400 text-lg">
              No group data available yet
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {groupTables.map((table) => (
              <CompactGroupCard key={table.group} table={table} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
