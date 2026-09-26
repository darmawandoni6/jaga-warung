import type { Transaction, TransactionItem } from '@/types/transaction';

export interface TransactionWithItems extends Transaction {
  items: TransactionItem[];
}

export const MOCK_TRANSACTION_ITEMS: TransactionItem[] = [
  {
    id: 1,
    transaction_id: 1,
    product_barcode: '8998866200227',
    product_name: 'Indomie Goreng Spesial',
    sell_price: 3500,
    quantity: 3,
    subtotal: 10500,
  },
  {
    id: 2,
    transaction_id: 1,
    product_barcode: '8886008101053',
    product_name: 'Aqua Botol 600ml',
    sell_price: 3000,
    quantity: 1,
    subtotal: 3000,
  },
  {
    id: 3,
    transaction_id: 2,
    product_barcode: '8992775211014',
    product_name: 'Minyak Goreng Sania 1L',
    sell_price: 18500,
    quantity: 1,
    subtotal: 18500,
  },
  {
    id: 4,
    transaction_id: 2,
    product_barcode: '8993189211018',
    product_name: 'Gula Pasir Gulaku 1kg',
    sell_price: 17500,
    quantity: 2,
    subtotal: 35000,
  },
];

export const MOCK_TRANSACTIONS: TransactionWithItems[] = [
  {
    id: 1,
    total_amount: 13500,
    payment_amount: 15000,
    change_amount: 1500,
    note: null,
    created_at: '2026-09-20 08:45:00',
    items: [MOCK_TRANSACTION_ITEMS[0], MOCK_TRANSACTION_ITEMS[1]],
  },
  {
    id: 2,
    total_amount: 53500,
    payment_amount: 60000,
    change_amount: 6500,
    note: 'Pelanggan langganan',
    created_at: '2026-09-20 10:15:00',
    items: [MOCK_TRANSACTION_ITEMS[2], MOCK_TRANSACTION_ITEMS[3]],
  },
];
