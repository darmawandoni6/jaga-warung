import { type PropsWithChildren, useEffect } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import { useAppStore } from '@/store/useAppStore';
import type { StoreProfile } from '@/types/settings';

import { getAllSettings, setSetting } from './repositories/settingsRepository';

const KEY_STORE_PROFILE = 'store_profile';
const KEY_PRINTER_ENABLED = 'is_printer_enabled';
const KEY_LAST_BACKUP = 'last_backup_date';

// Loads persisted settings from SQLite into Zustand on mount,
// and writes store changes back to SQLite on every update.
export function SettingsHydrator({ children }: PropsWithChildren) {
  const db = useSQLiteContext();

  // Hydrate store from DB
  useEffect(() => {
    let cancelled = false;

    getAllSettings(db)
      .then(rows => {
        if (cancelled) return;

        const patch: {
          storeProfile?: StoreProfile;
          isPrinterEnabled?: boolean;
          lastBackupDate?: string | null;
        } = {};

        if (rows[KEY_STORE_PROFILE]) {
          try {
            patch.storeProfile = JSON.parse(rows[KEY_STORE_PROFILE]) as StoreProfile;
          } catch (error) {
            console.error(error);
          }
        }
        if (rows[KEY_PRINTER_ENABLED] !== undefined) {
          patch.isPrinterEnabled = rows[KEY_PRINTER_ENABLED] === '1';
        }
        if (rows[KEY_LAST_BACKUP] !== undefined) {
          patch.lastBackupDate = rows[KEY_LAST_BACKUP];
        }

        useAppStore.getState().hydrate(patch);
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [db]);

  // Persist store changes to DB
  useEffect(() => {
    const unsubscribe = useAppStore.subscribe((state, prev) => {
      if (state.storeProfile !== prev.storeProfile) {
        setSetting(db, KEY_STORE_PROFILE, JSON.stringify(state.storeProfile)).catch(console.error);
      }
      if (state.isPrinterEnabled !== prev.isPrinterEnabled) {
        setSetting(db, KEY_PRINTER_ENABLED, state.isPrinterEnabled ? '1' : '0').catch(console.error);
      }
      if (state.lastBackupDate !== prev.lastBackupDate && state.lastBackupDate !== null) {
        setSetting(db, KEY_LAST_BACKUP, state.lastBackupDate).catch(console.error);
      }
    });

    return unsubscribe;
  }, [db]);

  return <>{children}</>;
}
