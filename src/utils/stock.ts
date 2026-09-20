export type StockStatus = 'ok' | 'low' | 'empty';

/**
 * Determines stock status based on current stock and minimum stock threshold.
 * - 'empty': stock is 0 or less
 * - 'low': stock is greater than 0 but less than or equal to minStock
 * - 'ok': stock is greater than minStock
 */
export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= 0) return 'empty';
  if (stock <= minStock) return 'low';
  return 'ok';
}
