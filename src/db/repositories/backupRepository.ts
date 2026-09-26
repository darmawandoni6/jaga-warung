import type { SQLiteDatabase } from 'expo-sqlite';

export interface BackupDataV1 {
  appName: string;
  version: string;
  format: 'jaga-warung-backup-v1';
  exportedAt: string;
  data: {
    categories: unknown[];
    products: unknown[];
    transactions: unknown[];
    transaction_items: unknown[];
    debts: unknown[];
    debt_payments: unknown[];
    cash_flows: unknown[];
    stock_movements: unknown[];
    settings: unknown[];
  };
}

export async function exportDatabaseBackup(db: SQLiteDatabase): Promise<BackupDataV1> {
  const [
    categories,
    products,
    transactions,
    transaction_items,
    debts,
    debt_payments,
    cash_flows,
    stock_movements,
    settings,
  ] = await Promise.all([
    db.getAllAsync('SELECT * FROM categories'),
    db.getAllAsync('SELECT * FROM products'),
    db.getAllAsync('SELECT * FROM transactions'),
    db.getAllAsync('SELECT * FROM transaction_items'),
    db.getAllAsync('SELECT * FROM debts'),
    db.getAllAsync('SELECT * FROM debt_payments').catch(() => []),
    db.getAllAsync('SELECT * FROM cash_flows'),
    db.getAllAsync('SELECT * FROM stock_movements').catch(() => []),
    db.getAllAsync('SELECT * FROM settings').catch(() => []),
  ]);

  return {
    appName: 'Jaga Warung',
    version: '1.0.0',
    format: 'jaga-warung-backup-v1',
    exportedAt: new Date().toISOString(),
    data: {
      categories,
      products,
      transactions,
      transaction_items,
      debts,
      debt_payments,
      cash_flows,
      stock_movements,
      settings,
    },
  };
}

export async function restoreDatabaseBackup(db: SQLiteDatabase, backup: BackupDataV1): Promise<void> {
  if (backup.format !== 'jaga-warung-backup-v1' || !backup.data) {
    throw new Error('Format file cadangan tidak valid atau tidak didukung.');
  }

  const {
    categories = [],
    products = [],
    transactions = [],
    transaction_items = [],
    debts = [],
    debt_payments = [],
    cash_flows = [],
    stock_movements = [],
    settings = [],
  } = backup.data;

  await db.withTransactionAsync(async () => {
    // 1. Clear existing data in reverse dependency order
    await db.runAsync('DELETE FROM transaction_items');
    await db.runAsync('DELETE FROM transactions');
    await db.runAsync('DELETE FROM debt_payments');
    await db.runAsync('DELETE FROM debts');
    await db.runAsync('DELETE FROM stock_movements');
    await db.runAsync('DELETE FROM cash_flows');
    await db.runAsync('DELETE FROM products');
    await db.runAsync('DELETE FROM categories');

    // 2. Restore categories
    for (const c of categories as Record<string, unknown>[]) {
      await db.runAsync(
        'INSERT OR REPLACE INTO categories (id, name, icon, is_default, created_at) VALUES (?, ?, ?, ?, ?)',
        [
          c.id as number,
          c.name as string,
          (c.icon as string) ?? null,
          (c.is_default as number) ?? 0,
          (c.created_at as string) ?? '',
        ],
      );
    }

    // 3. Restore products
    for (const p of products as Record<string, unknown>[]) {
      await db.runAsync(
        `INSERT OR REPLACE INTO products (id, name, buy_price, sell_price, stock, min_stock, barcode, type, image, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id as number,
          p.name as string,
          p.buy_price as number,
          p.sell_price as number,
          p.stock as number,
          p.min_stock as number,
          (p.barcode as string) ?? null,
          (p.type as string) ?? null,
          (p.image as string) ?? null,
          (p.created_at as string) ?? '',
          (p.updated_at as string) ?? '',
        ],
      );
    }

    // 4. Restore transactions
    for (const t of transactions as Record<string, unknown>[]) {
      await db.runAsync(
        'INSERT OR REPLACE INTO transactions (id, total_amount, payment_amount, change_amount, note, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          t.id as number,
          t.total_amount as number,
          t.payment_amount as number,
          t.change_amount as number,
          (t.note as string) ?? null,
          (t.created_at as string) ?? '',
        ],
      );
    }

    // 5. Restore transaction items
    for (const ti of transaction_items as Record<string, unknown>[]) {
      await db.runAsync(
        `INSERT OR REPLACE INTO transaction_items (id, transaction_id, product_id, product_name, sell_price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          ti.id as number,
          ti.transaction_id as number,
          ti.product_id as number,
          ti.product_name as string,
          ti.sell_price as number,
          ti.quantity as number,
          ti.subtotal as number,
        ],
      );
    }

    // 6. Restore debts
    for (const d of debts as Record<string, unknown>[]) {
      await db.runAsync(
        `INSERT OR REPLACE INTO debts (id, customer_name, phone, total_debt, paid_amount, status, note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          d.id as number,
          d.customer_name as string,
          (d.phone as string) ?? null,
          d.total_debt as number,
          d.paid_amount as number,
          d.status as string,
          (d.note as string) ?? null,
          (d.created_at as string) ?? '',
          (d.updated_at as string) ?? '',
        ],
      );
    }

    // 7. Restore debt payments
    for (const dp of debt_payments as Record<string, unknown>[]) {
      await db.runAsync(
        'INSERT OR REPLACE INTO debt_payments (id, debt_id, amount, note, created_at) VALUES (?, ?, ?, ?, ?)',
        [
          dp.id as number,
          dp.debt_id as number,
          dp.amount as number,
          (dp.note as string) ?? null,
          (dp.created_at as string) ?? '',
        ],
      );
    }

    // 8. Restore cash flows
    for (const cf of cash_flows as Record<string, unknown>[]) {
      await db.runAsync(
        'INSERT OR REPLACE INTO cash_flows (id, type, amount, note, date, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [
          cf.id as number,
          cf.type as string,
          cf.amount as number,
          (cf.note as string) ?? null,
          cf.date as string,
          (cf.created_at as string) ?? '',
        ],
      );
    }

    // 9. Restore stock movements
    for (const sm of stock_movements as Record<string, unknown>[]) {
      await db.runAsync(
        `INSERT OR REPLACE INTO stock_movements (id, product_id, type, quantity, previous_stock, final_stock, note, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sm.id as number,
          sm.product_id as number,
          sm.type as string,
          sm.quantity as number,
          sm.previous_stock as number,
          sm.final_stock as number,
          (sm.note as string) ?? null,
          (sm.created_at as string) ?? '',
        ],
      );
    }

    // 10. Restore settings
    for (const s of settings as Record<string, unknown>[]) {
      await db.runAsync('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)', [
        s.key as string,
        s.value as string,
        (s.updated_at as string) ?? '',
      ]);
    }
  });
}
