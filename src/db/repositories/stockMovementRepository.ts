import type { SQLiteDatabase } from 'expo-sqlite';

import type { AdjustStockParams, RestockParams, StockMovement } from '@/types/stock-movement';

export async function restockProduct(
  db: SQLiteDatabase,
  params: RestockParams,
): Promise<{ previousStock: number; finalStock: number }> {
  let previousStock = 0;
  let finalStock = 0;

  await db.withTransactionAsync(async () => {
    const product = await db.getFirstAsync<{ id: number; name: string; stock: number; buy_price: number }>(
      'SELECT id, name, stock, buy_price FROM products WHERE id = ?',
      [params.productId],
    );

    if (!product) {
      throw new Error(`Product with ID ${params.productId} not found`);
    }

    previousStock = product.stock;
    finalStock = previousStock + params.quantity;
    const effectiveBuyPrice =
      params.buyPrice !== undefined && params.buyPrice >= 0 ? params.buyPrice : product.buy_price;
    const totalCost = params.quantity * effectiveBuyPrice;

    // 1. Update product stock and optionally buy_price
    await db.runAsync(
      `UPDATE products
       SET stock = ?, buy_price = ?, updated_at = datetime('now', 'localtime')
       WHERE id = ?`,
      [finalStock, effectiveBuyPrice, params.productId],
    );

    // 2. Insert stock_movements record
    await db.runAsync(
      `INSERT INTO stock_movements (product_id, type, quantity, previous_stock, final_stock, total_cost, note)
       VALUES (?, 'restock', ?, ?, ?, ?, ?)`,
      [params.productId, params.quantity, previousStock, finalStock, totalCost, params.note ?? null],
    );

    // 3. Optionally record cash outflow (expense)
    if (params.recordToCashFlow && totalCost > 0) {
      const expenseNote = params.note?.trim()
        ? `Kulakan ${product.name} (${params.quantity} pcs) - ${params.note.trim()}`
        : `Kulakan ${product.name} (${params.quantity} pcs)`;

      await db.runAsync(
        `INSERT INTO cash_flows (type, amount, note, date)
         VALUES ('expense', ?, ?, date('now', 'localtime'))`,
        [totalCost, expenseNote],
      );
    }
  });

  return { previousStock, finalStock };
}

export async function adjustStock(
  db: SQLiteDatabase,
  params: AdjustStockParams,
): Promise<{ previousStock: number; finalStock: number }> {
  let previousStock = 0;
  let finalStock = 0;

  await db.withTransactionAsync(async () => {
    const product = await db.getFirstAsync<{ id: number; name: string; stock: number }>(
      'SELECT id, name, stock FROM products WHERE id = ?',
      [params.productId],
    );

    if (!product) {
      throw new Error(`Product with ID ${params.productId} not found`);
    }

    previousStock = product.stock;
    const isLoss = params.type === 'adjustment_loss';
    const delta = isLoss ? -Math.abs(params.quantity) : Math.abs(params.quantity);
    finalStock = Math.max(0, previousStock + delta);

    // 1. Update product stock
    await db.runAsync(
      `UPDATE products
       SET stock = ?, updated_at = datetime('now', 'localtime')
       WHERE id = ?`,
      [finalStock, params.productId],
    );

    // 2. Insert stock_movements record
    await db.runAsync(
      `INSERT INTO stock_movements (product_id, type, quantity, previous_stock, final_stock, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [params.productId, params.type, delta, previousStock, finalStock, params.reason.trim()],
    );
  });

  return { previousStock, finalStock };
}

export async function getStockMovements(db: SQLiteDatabase, productId?: number): Promise<StockMovement[]> {
  if (productId !== undefined) {
    return db.getAllAsync<StockMovement>(
      `SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC`,
      [productId],
    );
  }
  return db.getAllAsync<StockMovement>(`SELECT * FROM stock_movements ORDER BY created_at DESC`);
}

export async function getAllStockMovementsWithProduct(
  db: SQLiteDatabase,
  filter?: { type?: string; search?: string; limit?: number },
): Promise<(StockMovement & { product_name: string; product_type: string | null })[]> {
  const whereClauses: string[] = [];
  const params: (string | number)[] = [];

  if (filter?.type && filter.type !== 'all') {
    if (filter.type === 'adjustment') {
      whereClauses.push("m.type IN ('adjustment_loss', 'adjustment_gain')");
    } else {
      whereClauses.push('m.type = ?');
      params.push(filter.type);
    }
  }

  if (filter?.search?.trim()) {
    whereClauses.push('(p.name LIKE ? OR m.note LIKE ?)');
    const like = `%${filter.search.trim()}%`;
    params.push(like, like);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const limitSql = filter?.limit ? `LIMIT ${filter.limit}` : 'LIMIT 100';

  return db.getAllAsync<StockMovement & { product_name: string; product_type: string | null }>(
    `SELECT m.*, COALESCE(p.name, 'Produk Dihapus') AS product_name, p.type AS product_type
     FROM stock_movements m
     LEFT JOIN products p ON p.id = m.product_id
     ${whereSql}
     ORDER BY m.created_at DESC
     ${limitSql}`,
    params,
  );
}

export async function getStockMovementStats(
  db: SQLiteDatabase,
): Promise<{ totalRestocked: number; totalSold: number; totalAdjusted: number }> {
  const row = await db.getFirstAsync<{
    totalRestocked: number;
    totalSold: number;
    totalAdjusted: number;
  }>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'restock' THEN quantity ELSE 0 END), 0) AS totalRestocked,
       COALESCE(SUM(CASE WHEN type = 'sale' THEN ABS(quantity) ELSE 0 END), 0) AS totalSold,
       COALESCE(SUM(CASE WHEN type IN ('adjustment_loss', 'adjustment_gain') THEN ABS(quantity) ELSE 0 END), 0) AS totalAdjusted
     FROM stock_movements`,
  );

  return (
    row ?? {
      totalRestocked: 0,
      totalSold: 0,
      totalAdjusted: 0,
    }
  );
}
