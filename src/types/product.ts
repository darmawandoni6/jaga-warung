export interface Product {
  barcode: string;
  name: string;
  buy_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
  type?: string | null;
  image?: string | null;
  created_at: string;
  updated_at: string;
}
