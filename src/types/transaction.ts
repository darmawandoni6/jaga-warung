export interface Transaction {
  id: number;
  total_amount: number;
  payment_amount: number;
  change_amount: number;
  note: string | null;
  created_at: string;
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product_barcode: string;
  product_name: string;
  sell_price: number;
  quantity: number;
  subtotal: number;
}

export interface TransactionWithItems extends Transaction {
  items: TransactionItem[];
}
