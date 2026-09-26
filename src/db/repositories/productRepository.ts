import type { SQLiteDatabase } from 'expo-sqlite';

import type { Product } from '@/types/product';

export type CreateProductData = Omit<Product, 'created_at' | 'updated_at'>;

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

export async function getProductByBarcode(db: SQLiteDatabase, barcode: string): Promise<Product | null> {
  return db.getFirstAsync<Product>('SELECT * FROM products WHERE barcode = ?', [barcode]);
}

export async function createProduct(db: SQLiteDatabase, data: CreateProductData): Promise<string> {
  await db.runAsync(
    `INSERT INTO products (barcode, name, buy_price, sell_price, stock, min_stock, type, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.barcode,
      data.name,
      data.buy_price,
      data.sell_price,
      data.stock,
      data.min_stock,
      data.type ?? null,
      data.image ?? null,
    ],
  );
  return data.barcode;
}

export async function updateProduct(
  db: SQLiteDatabase,
  barcode: string,
  data: Partial<Omit<Product, 'created_at' | 'updated_at'>>,
): Promise<void> {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  const columns = ['name', 'buy_price', 'sell_price', 'stock', 'min_stock', 'type', 'image'] as const;

  for (const column of columns) {
    if (data[column] !== undefined) {
      fields.push(`${column} = ?`);
      values.push(data[column] ?? null);
    }
  }

  if (fields.length === 0) return;

  fields.push(`updated_at = datetime('now', 'localtime')`);
  values.push(barcode);

  await db.runAsync(`UPDATE products SET ${fields.join(', ')} WHERE barcode = ?`, values);
}

export async function updateStock(db: SQLiteDatabase, barcode: string, delta: number): Promise<void> {
  await db.runAsync(
    `UPDATE products
     SET stock = stock + ?, updated_at = datetime('now', 'localtime')
     WHERE barcode = ?`,
    [delta, barcode],
  );
}

export async function getLowStockProducts(db: SQLiteDatabase): Promise<Product[]> {
  return db.getAllAsync<Product>(
    `SELECT * FROM products
     WHERE stock <= min_stock
     ORDER BY stock ASC, name ASC`,
  );
}

export async function deleteProduct(db: SQLiteDatabase, barcode: string): Promise<void> {
  await db.runAsync('DELETE FROM products WHERE barcode = ?', [barcode]);
}
