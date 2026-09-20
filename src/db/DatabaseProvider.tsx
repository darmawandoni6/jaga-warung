import type { PropsWithChildren } from 'react';

import { type SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';

import {
  CREATE_CASH_FLOWS_TABLE,
  CREATE_DEBTS_TABLE,
  CREATE_PRODUCTS_TABLE,
  CREATE_TRANSACTIONS_TABLE,
  CREATE_TRANSACTION_ITEMS_TABLE,
} from './schema';

export const DB_NAME = 'jaga-warung.db';
export const CURRENT_DB_VERSION = 1;

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  // PRAGMA settings must be executed outside of transactions (Context7 expo-sqlite pattern)
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');

  if (result === null) {
    throw new Error('Cannot read database schema version');
  }

  if (result.user_version > CURRENT_DB_VERSION) {
    throw new Error(`DB schema v${result.user_version} is newer than app v${CURRENT_DB_VERSION}`);
  }

  if (result.user_version === CURRENT_DB_VERSION) {
    return;
  }

  await db.withTransactionAsync(async () => {
    if (result.user_version < 1) {
      await db.execAsync(CREATE_PRODUCTS_TABLE);
      await db.execAsync(CREATE_TRANSACTIONS_TABLE);
      await db.execAsync(CREATE_TRANSACTION_ITEMS_TABLE);
      await db.execAsync(CREATE_DEBTS_TABLE);
      await db.execAsync(CREATE_CASH_FLOWS_TABLE);
    }
    await db.execAsync(`PRAGMA user_version = ${CURRENT_DB_VERSION}`);
  });
}

export function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName={DB_NAME} onInit={initializeDatabase}>
      {children}
    </SQLiteProvider>
  );
}
