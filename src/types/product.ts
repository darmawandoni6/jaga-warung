export interface Product {
  id: number;
  name: string;
  buy_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
  barcode?: string | null;
  type?: string | null;
  image?: string | null;
  created_at: string;
  updated_at: string;
}
