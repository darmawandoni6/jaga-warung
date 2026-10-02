import type { PropsWithChildren } from 'react';

import { type SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';

import {
  CREATE_CASH_FLOWS_TABLE,
  CREATE_CATEGORIES_TABLE,
  CREATE_DEBTS_TABLE,
  CREATE_DEBT_PAYMENTS_TABLE,
  CREATE_PRODUCTS_TABLE,
  CREATE_SETTINGS_TABLE,
  CREATE_STOCK_MOVEMENTS_TABLE,
  CREATE_TRANSACTIONS_TABLE,
  CREATE_TRANSACTION_ITEMS_TABLE,
  SEED_INITIAL_CATEGORIES,
} from './schema';
import { seedDevData } from './seed';

// Separate databases per mode so dev resets/testing never touch prod data.
// __DEV__ is true in Metro/dev builds, false in release builds (build:apk).
export const DB_NAME = __DEV__ ? 'jaga-warung.dev.db' : 'jaga-warung.db';
export const CURRENT_DB_VERSION = 1;

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  // PRAGMA settings must be executed outside of transactions (Context7 expo-sqlite pattern)
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');

  if (result === null) {
    throw new Error('Cannot read database schema version');
  }

  if (result.user_version === CURRENT_DB_VERSION) {
    return;
  }

  // Testing mode: drop & recreate all tables when version doesn't match
  await db.execAsync(`
    DROP TABLE IF EXISTS stock_movements;
    DROP TABLE IF EXISTS debt_payments;
    DROP TABLE IF EXISTS transaction_items;
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS products;
    DROP TABLE IF EXISTS debts;
    DROP TABLE IF EXISTS cash_flows;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS settings;
  `);

  await db.withTransactionAsync(async () => {
    await db.execAsync(CREATE_PRODUCTS_TABLE);
    await db.execAsync(CREATE_TRANSACTIONS_TABLE);
    await db.execAsync(CREATE_TRANSACTION_ITEMS_TABLE);
    await db.execAsync(CREATE_DEBTS_TABLE);
    await db.execAsync(CREATE_CASH_FLOWS_TABLE);
    await db.execAsync(CREATE_SETTINGS_TABLE);
    await db.execAsync(CREATE_CATEGORIES_TABLE);
    await db.execAsync(SEED_INITIAL_CATEGORIES);
    await db.execAsync(CREATE_STOCK_MOVEMENTS_TABLE);
    await db.execAsync(CREATE_DEBT_PAYMENTS_TABLE);
    await db.execAsync(`PRAGMA user_version = ${CURRENT_DB_VERSION}`);
  });

  // Dev-only: populate sample data so the app isn't empty on first launch.
  // seedDevData skips itself when the products table is already populated,
  // so it stays idempotent.
  if (__DEV__) {
    await seedDevData(db);
  }
}

export function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName={DB_NAME} onInit={initializeDatabase}>
      {children}
    </SQLiteProvider>
  );
}
