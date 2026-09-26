import type { SQLiteDatabase } from 'expo-sqlite';

import type { Category, CategoryWithCount } from '@/types/category';

export async function getAllCategories(db: SQLiteDatabase): Promise<Category[]> {
  return db.getAllAsync<Category>('SELECT * FROM categories ORDER BY name ASC');
}

export async function getCategoriesWithCount(db: SQLiteDatabase): Promise<CategoryWithCount[]> {
  return db.getAllAsync<CategoryWithCount>(
    `SELECT c.id, c.name, c.created_at, c.updated_at,
            COUNT(p.id) AS product_count
     FROM categories c
     LEFT JOIN products p ON LOWER(p.type) = LOWER(c.name)
     GROUP BY c.id
     ORDER BY c.name ASC`,
  );
}

export async function createCategory(db: SQLiteDatabase, name: string): Promise<number> {
  const trimmed = name.trim();
  const result = await db.runAsync('INSERT INTO categories (name) VALUES (?)', [trimmed]);
  return result.lastInsertRowId;
}

export async function updateCategory(db: SQLiteDatabase, id: number, newName: string, oldName?: string): Promise<void> {
  const trimmedNew = newName.trim();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `UPDATE categories
       SET name = ?, updated_at = datetime('now', 'localtime')
       WHERE id = ?`,
      [trimmedNew, id],
    );

    if (oldName && oldName.trim() !== trimmedNew) {
      await db.runAsync(
        `UPDATE products
         SET type = ?, updated_at = datetime('now', 'localtime')
         WHERE LOWER(type) = LOWER(?)`,
        [trimmedNew, oldName.trim()],
      );
    }
  });
}

export async function deleteCategory(db: SQLiteDatabase, id: number, name: string): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
    // Detach or move products in this category to NULL
    await db.runAsync(
      `UPDATE products
       SET type = NULL, updated_at = datetime('now', 'localtime')
       WHERE LOWER(type) = LOWER(?)`,
      [name.trim()],
    );
  });
}
