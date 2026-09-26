export type StockMovementType = 'restock' | 'sale' | 'adjustment_loss' | 'adjustment_gain';

export interface StockMovement {
  id: number;
  product_barcode: string;
  type: StockMovementType;
  quantity: number;
  previous_stock: number;
  final_stock: number;
  total_cost?: number | null;
  note?: string | null;
  created_at: string;
}

export interface StockMovementWithProduct extends StockMovement {
  product_name: string;
  product_type?: string | null;
}

export interface StockMovementStats {
  totalRestocked: number;
  totalSold: number;
  totalAdjusted: number;
}

export interface RestockParams {
  productBarcode: string;
  quantity: number;
  buyPrice?: number;
  recordToCashFlow?: boolean;
  note?: string;
}

export interface AdjustStockParams {
  productBarcode: string;
  type: 'adjustment_loss' | 'adjustment_gain';
  quantity: number;
  reason: string;
}
