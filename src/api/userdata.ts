import { openDB, type IDBPDatabase } from 'idb';
import type { MatchScore, MatchWatchStatus, MatchReminder, UserSettings, UserData } from '../types';

const DB_NAME = 'WorldCupTrackerDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  SCORES: 'scores',
  WATCH_STATUS: 'watchStatus',
  REMINDERS: 'reminders',
  SETTINGS: 'settings',
};

let dbInstance: IDBPDatabase | null = null;

/**
 * Initialize the database
 */
export async function initDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Scores store
      if (!db.objectStoreNames.contains(STORES.SCORES)) {
        const scoresStore = db.createObjectStore(STORES.SCORES, { keyPath: 'fixtureId' });
        scoresStore.createIndex('enteredAt', 'enteredAt');
      }

      // Watch status store
      if (!db.objectStoreNames.contains(STORES.WATCH_STATUS)) {
        db.createObjectStore(STORES.WATCH_STATUS, { keyPath: 'fixtureId' });
      }

      // Reminders store
      if (!db.objectStoreNames.contains(STORES.REMINDERS)) {
        const remindersStore = db.createObjectStore(STORES.REMINDERS, { keyPath: 'fixtureId' });
        remindersStore.createIndex('enabled', 'enabled');
      }

      // Settings store
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

// ========== SCORES ==========

export async function saveScore(score: MatchScore): Promise<void> {
  const db = await initDB();
  await db.put(STORES.SCORES, score);
}

export async function saveScores(scores: MatchScore[]): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORES.SCORES, 'readwrite');

  await Promise.all([
    ...scores.map((score) => tx.store.put(score)),
    tx.done,
  ]);
}

export async function getScore(fixtureId: number): Promise<MatchScore | undefined> {
  const db = await initDB();
  return await db.get(STORES.SCORES, fixtureId);
}

export async function getAllScores(): Promise<MatchScore[]> {
  const db = await initDB();
  return await db.getAll(STORES.SCORES);
}

export async function deleteScore(fixtureId: number): Promise<void> {
  const db = await initDB();
  await db.delete(STORES.SCORES, fixtureId);
}

// ========== WATCH STATUS ==========

export async function saveWatchStatus(status: MatchWatchStatus): Promise<void> {
  const db = await initDB();
  await db.put(STORES.WATCH_STATUS, status);
}

export async function getWatchStatus(fixtureId: number): Promise<MatchWatchStatus | undefined> {
  const db = await initDB();
  return await db.get(STORES.WATCH_STATUS, fixtureId);
}

export async function getAllWatchStatus(): Promise<MatchWatchStatus[]> {
  const db = await initDB();
  return await db.getAll(STORES.WATCH_STATUS);
}

export async function toggleWatchStatus(fixtureId: number): Promise<MatchWatchStatus> {
  const existing = await getWatchStatus(fixtureId);
  const newStatus: MatchWatchStatus = {
    fixtureId,
    watched: existing ? !existing.watched : true,
    watchedAt: existing?.watched === false ? new Date().toISOString() : existing?.watchedAt,
  };
  await saveWatchStatus(newStatus);
  return newStatus;
}

// ========== REMINDERS ==========

export async function saveReminder(reminder: MatchReminder): Promise<void> {
  const db = await initDB();
  await db.put(STORES.REMINDERS, reminder);
}

export async function getReminder(fixtureId: number): Promise<MatchReminder | undefined> {
  const db = await initDB();
  return await db.get(STORES.REMINDERS, fixtureId);
}

export async function getAllReminders(): Promise<MatchReminder[]> {
  const db = await initDB();
  return await db.getAll(STORES.REMINDERS);
}

export async function getEnabledReminders(): Promise<MatchReminder[]> {
  const db = await initDB();
  const allReminders = await db.getAllFromIndex(STORES.REMINDERS, 'enabled', 1);
  return allReminders.filter((r) => r.enabled);
}

export async function toggleReminder(
  fixtureId: number,
  minutesBefore: number = 30
): Promise<MatchReminder> {
  const existing = await getReminder(fixtureId);
  const newReminder: MatchReminder = {
    fixtureId,
    enabled: existing ? !existing.enabled : true,
    minutesBefore: existing?.minutesBefore ?? minutesBefore,
    notificationSent: false,
  };
  await saveReminder(newReminder);
  return newReminder;
}

// ========== SETTINGS ==========

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: true,
  notifications: true,
  defaultReminderMinutes: 30,
  favoriteTeamCodes: ['AUS', 'ENG'],
};

export async function getSettings(): Promise<UserSettings> {
  const db = await initDB();
  const settings = await db.get(STORES.SETTINGS, 'user-settings');
  return { ...DEFAULT_SETTINGS, ...settings };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const db = await initDB();
  await db.put(STORES.SETTINGS, { id: 'user-settings', ...settings });
}

export async function updateSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await saveSettings(updated);
  return updated;
}

// ========== IMPORT / EXPORT ==========

export async function exportUserData(): Promise<UserData> {
  const scores = await getAllScores();
  const watchStatus = await getAllWatchStatus();
  const reminders = await getAllReminders();
  const settings = await getSettings();

  return {
    scores,
    watchStatus,
    reminders,
    settings,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
}

export async function importUserData(data: UserData): Promise<void> {
  const db = await initDB();

  // Clear existing data
  await db.clear(STORES.SCORES);
  await db.clear(STORES.WATCH_STATUS);
  await db.clear(STORES.REMINDERS);

  // Import scores
  for (const score of data.scores) {
    await db.put(STORES.SCORES, score);
  }

  // Import watch status
  for (const status of data.watchStatus) {
    await db.put(STORES.WATCH_STATUS, status);
  }

  // Import reminders
  for (const reminder of data.reminders) {
    await db.put(STORES.REMINDERS, reminder);
  }

  // Import settings
  await saveSettings(data.settings);
}

// ========== CLEAR DATA ==========

export async function clearAllUserData(): Promise<void> {
  const db = await initDB();
  await db.clear(STORES.SCORES);
  await db.clear(STORES.WATCH_STATUS);
  await db.clear(STORES.REMINDERS);
  // Keep settings
}
