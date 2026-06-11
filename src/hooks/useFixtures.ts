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
      // Try to load from cache first
      const cached = loadFixturesFromCache();
      if (cached && cached.length > 0) {
        setFixtures(cached);
        setLoading(false);
        return;
      }

      // If no cache, fetch from API
      const data = await fetchFixtures();
      setFixtures(data);
      saveFixturesToCache(data);
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
