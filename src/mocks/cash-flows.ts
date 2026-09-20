import type { CashFlow } from '@/types/cash-flow';

export const MOCK_CASH_FLOWS: CashFlow[] = [
  {
    id: 1,
    type: 'income',
    amount: 500000,
    note: 'Modal awal kas (Initial capital)',
    date: '2026-09-20',
    created_at: '2026-09-20 06:30:00',
  },
  {
    id: 2,
    type: 'expense',
    amount: 150000,
    note: 'Kulakan Indomie (Restock Indomie)',
    date: '2026-09-20',
    created_at: '2026-09-20 09:00:00',
  },
  {
    id: 3,
    type: 'income',
    amount: 75000,
    note: 'Penjualan sore (Afternoon sales)',
    date: '2026-09-19',
    created_at: '2026-09-19 17:30:00',
  },
  {
    id: 4,
    type: 'expense',
    amount: 25000,
    note: 'Beli token listrik (Electricity)',
    date: '2026-09-19',
    created_at: '2026-09-19 14:00:00',
  },
];
