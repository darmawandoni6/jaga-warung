import type { SQLiteDatabase } from 'expo-sqlite';

import type { Product } from '@/types/product';

export type CreateProductData = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export async function getAllProducts(db: SQLiteDatabase, search?: string): Promise<Product[]> {
  const trimmed = search?.trim();

  if (trimmed) {
    const like = `%${trimmed}%`;
    return db.getAllAsync<Product>(
      `SELECT * FROM products
       WHERE name LIKE ? OR barcode LIKE ?
       ORDER BY name ASC`,
      [like, like],
    );
  }

  return db.getAllAsync<Product>('SELECT * FROM products ORDER BY name ASC');
}

export async function getProductById(db: SQLiteDatabase, id: number): Promise<Product | null> {
  return db.getFirstAsync<Product>('SELECT * FROM products WHERE id = ?', [id]);
}

export async function getProductByBarcode(db: SQLiteDatabase, barcode: string): Promise<Product | null> {
  return db.getFirstAsync<Product>('SELECT * FROM products WHERE barcode = ?', [barcode]);
}

export async function createProduct(db: SQLiteDatabase, data: CreateProductData): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO products (name, buy_price, sell_price, stock, min_stock, barcode, type, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.buy_price,
      data.sell_price,
      data.stock,
      data.min_stock,
      data.barcode ?? null,
      data.type ?? null,
      data.image ?? null,
    ],
  );
  return result.lastInsertRowId;
}

export async function updateProduct(
  db: SQLiteDatabase,
  id: number,
  data: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>,
): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  const columns = ['name', 'buy_price', 'sell_price', 'stock', 'min_stock', 'barcode', 'type', 'image'] as const;

  for (const column of columns) {
    if (data[column] !== undefined) {
      fields.push(`${column} = ?`);
      values.push(data[column] ?? null);
    }
  }

  if (fields.length === 0) return;

  fields.push(`updated_at = datetime('now', 'localtime')`);
  values.push(id);

  await db.runAsync(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function updateStock(db: SQLiteDatabase, id: number, delta: number): Promise<void> {
  await db.runAsync(
    `UPDATE products
     SET stock = stock + ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [delta, id],
  );
}

export async function getLowStockProducts(db: SQLiteDatabase): Promise<Product[]> {
  return db.getAllAsync<Product>(
    `SELECT * FROM products
     WHERE stock <= min_stock
     ORDER BY stock ASC, name ASC`,
  );
}

export async function deleteProduct(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
}
