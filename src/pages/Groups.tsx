import { useMemo } from 'react';
import { GroupTable } from '../components/GroupTable';
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
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">Group Standings</h1>
          <p className="text-gray-400 text-sm mt-1">
            Based on your entered scores only
          </p>
        </div>
      </div>

      {/* Group Tables */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {groupTables.length === 0 ? (
            <div className="col-span-full card text-center py-12">
              <div className="text-gray-400 text-lg">
                No group data available yet
              </div>
            </div>
          ) : (
            groupTables.map((table) => (
              <GroupTable key={table.group} table={table} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
