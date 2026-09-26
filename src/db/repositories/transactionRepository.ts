import type { SQLiteDatabase } from 'expo-sqlite';

import type { Transaction, TransactionItem } from '@/types/transaction';

export interface CreateTransactionData {
  total_amount: number;
  payment_amount: number;
  change_amount: number;
  note?: string | null;
}

export interface CreateTransactionItemData {
  product_id: number;
  product_name: string;
  sell_price: number;
  quantity: number;
  subtotal: number;
}

export interface SaveTransactionInput {
  transaction: CreateTransactionData;
  items: CreateTransactionItemData[];
}

export async function getAllTransactions(db: SQLiteDatabase, limit?: number): Promise<Transaction[]> {
  if (limit !== undefined) {
    return db.getAllAsync<Transaction>('SELECT * FROM transactions ORDER BY created_at DESC LIMIT ?', [limit]);
  }
  return db.getAllAsync<Transaction>('SELECT * FROM transactions ORDER BY created_at DESC');
}

export async function getTransactionById(db: SQLiteDatabase, id: number): Promise<Transaction | null> {
  return db.getFirstAsync<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);
}

export async function getTransactionItems(db: SQLiteDatabase, transactionId: number): Promise<TransactionItem[]> {
  return db.getAllAsync<TransactionItem>('SELECT * FROM transaction_items WHERE transaction_id = ?', [transactionId]);
}

export async function createTransaction(db: SQLiteDatabase, data: CreateTransactionData): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO transactions (total_amount, payment_amount, change_amount, note)
     VALUES (?, ?, ?, ?)`,
    [data.total_amount, data.payment_amount, data.change_amount, data.note ?? null],
  );
  return result.lastInsertRowId;
}

export async function createTransactionItem(
  db: SQLiteDatabase,
  transactionId: number,
  data: CreateTransactionItemData,
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO transaction_items (transaction_id, product_id, product_name, sell_price, quantity, subtotal)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [transactionId, data.product_id, data.product_name, data.sell_price, data.quantity, data.subtotal],
  );
  return result.lastInsertRowId;
}

// Atomic multi-step: insert transaction + items, decrement stock. Rolls back on any error.
export async function saveTransaction(db: SQLiteDatabase, input: SaveTransactionInput): Promise<number> {
  let transactionId = 0;

  await db.withTransactionAsync(async () => {
    transactionId = await createTransaction(db, input.transaction);

    for (const item of input.items) {
      await createTransactionItem(db, transactionId, item);

      // Get current stock for accurate movement audit
      const prod = await db.getFirstAsync<{ stock: number }>('SELECT stock FROM products WHERE id = ?', [
        item.product_id,
      ]);
      const previousStock = prod ? prod.stock : 0;
      const finalStock = Math.max(0, previousStock - item.quantity);

      await db.runAsync(
        `UPDATE products
         SET stock = ?, updated_at = datetime('now', 'localtime')
         WHERE id = ?`,
        [finalStock, item.product_id],
      );

      await db.runAsync(
        `INSERT INTO stock_movements (product_id, type, quantity, previous_stock, final_stock, note)
         VALUES (?, 'sale', ?, ?, ?, ?)`,
        [item.product_id, -item.quantity, previousStock, finalStock, `Penjualan Kasir #${transactionId}`],
      );
    }
  });

  return transactionId;
}

export async function deleteAllTransactions(db: SQLiteDatabase): Promise<void> {
  await db.runAsync('DELETE FROM transactions');
}
