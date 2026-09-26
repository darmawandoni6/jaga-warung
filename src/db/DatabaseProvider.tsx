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
  MIGRATE_V2_ADD_PRODUCT_COLUMNS,
  SEED_INITIAL_CATEGORIES,
} from './schema';

export const DB_NAME = 'jaga-warung.db';
export const CURRENT_DB_VERSION = 6;

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
    } else if (result.user_version < 2) {
      for (const statement of MIGRATE_V2_ADD_PRODUCT_COLUMNS) {
        await db.execAsync(statement);
      }
    }
    if (result.user_version < 3) {
      await db.execAsync(CREATE_SETTINGS_TABLE);
    }
    if (result.user_version < 4) {
      await db.execAsync(CREATE_CATEGORIES_TABLE);
      await db.execAsync(SEED_INITIAL_CATEGORIES);
      await db.execAsync(`
        INSERT OR IGNORE INTO categories (name)
        SELECT DISTINCT type FROM products WHERE type IS NOT NULL AND TRIM(type) != '';
      `);
    }
    if (result.user_version < 5) {
      await db.execAsync(CREATE_STOCK_MOVEMENTS_TABLE);
    }
    if (result.user_version < 6) {
      await db.execAsync(CREATE_DEBT_PAYMENTS_TABLE);
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
