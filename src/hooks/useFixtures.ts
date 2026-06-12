import { useState, useEffect } from 'react';
import type { Fixture } from '../types';
import { 
  fetchFixtures, 
  loadFixturesFromCache, 
  saveFixturesToCache,
  updateFixtures 
} from '../api/fixtures';

/**
 * Hook for managing fixtures data
 */
export function useFixtures() {
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFixtures = async () => {
    setLoading(true);
    setError(null);

    try {
      // Show cached fixtures immediately for speed/offline support, but still
      // revalidate from the network so deployed fixture updates reach everyone.
      const cached = loadFixturesFromCache();
      if (cached && cached.length > 0) {
        setFixtures(cached);
        setLoading(false);
      }

      // Always fetch the latest fixtures after showing any cached copy.
      const data = await fetchFixtures();
      if (data.length > 0) {
        setFixtures(data);
        saveFixturesToCache(data);
      } else if (!cached || cached.length === 0) {
        setFixtures([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load fixtures');
      console.error('Error loading fixtures:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshFixtures = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await updateFixtures();
      setFixtures(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update fixtures');
      console.error('Error updating fixtures:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFixtures();
  }, []);

  return {
    fixtures,
    loading,
    error,
    refreshFixtures,
  };
}
