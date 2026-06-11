import { useState, useEffect, useCallback } from 'react';
import type { MatchScore, MatchWatchStatus, MatchReminder } from '../types';
import {
  getAllScores,
  saveScore,
  deleteScore,
  getAllWatchStatus,
  toggleWatchStatus as toggleWatchStatusDB,
  getAllReminders,
  toggleReminder as toggleReminderDB,
  initDB,
} from '../api/userdata';

/**
 * Hook for managing all user data (scores, watch status, reminders)
 */
export function useUserData() {
  const [scores, setScores] = useState<MatchScore[]>([]);
  const [watchStatus, setWatchStatus] = useState<MatchWatchStatus[]>([]);
  const [reminders, setReminders] = useState<MatchReminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all user data
  const loadUserData = useCallback(async () => {
    try {
      await initDB();
      const [scoresData, watchData, remindersData] = await Promise.all([
        getAllScores(),
        getAllWatchStatus(),
        getAllReminders(),
      ]);

      setScores(scoresData);
      setWatchStatus(watchData);
      setReminders(remindersData);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Score management
  const addScore = useCallback(async (score: MatchScore) => {
    await saveScore(score);
    setScores((prev) => {
      const filtered = prev.filter((s) => s.fixtureId !== score.fixtureId);
      return [...filtered, score];
    });
  }, []);

  const removeScore = useCallback(async (fixtureId: number) => {
    await deleteScore(fixtureId);
    setScores((prev) => prev.filter((s) => s.fixtureId !== fixtureId));
  }, []);

  const getScoreForFixture = useCallback(
    (fixtureId: number) => {
      return scores.find((s) => s.fixtureId === fixtureId);
    },
    [scores]
  );

  // Watch status management
  const toggleWatchStatus = useCallback(async (fixtureId: number) => {
    const newStatus = await toggleWatchStatusDB(fixtureId);
    setWatchStatus((prev) => {
      const filtered = prev.filter((w) => w.fixtureId !== fixtureId);
      return [...filtered, newStatus];
    });
  }, []);

  const isWatched = useCallback(
    (fixtureId: number) => {
      return watchStatus.find((w) => w.fixtureId === fixtureId)?.watched || false;
    },
    [watchStatus]
  );

  // Reminder management
  const toggleReminder = useCallback(async (fixtureId: number, minutesBefore?: number) => {
    const newReminder = await toggleReminderDB(fixtureId, minutesBefore);
    setReminders((prev) => {
      const filtered = prev.filter((r) => r.fixtureId !== fixtureId);
      return [...filtered, newReminder];
    });
  }, []);

  const hasReminder = useCallback(
    (fixtureId: number) => {
      return reminders.find((r) => r.fixtureId === fixtureId)?.enabled || false;
    },
    [reminders]
  );

  return {
    scores,
    watchStatus,
    reminders,
    loading,
    addScore,
    removeScore,
    getScoreForFixture,
    toggleWatchStatus,
    isWatched,
    toggleReminder,
    hasReminder,
    refreshData: loadUserData,
  };
}
