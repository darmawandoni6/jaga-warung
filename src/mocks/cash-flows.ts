import type { CashFlow } from '@/types/cash-flow';

export const MOCK_CASH_FLOWS: CashFlow[] = [
  {
    id: 1,
    type: 'income',
    amount: 500000,
    note: 'Modal kas awal pagi',
    date: '2026-09-20',
    created_at: '2026-09-20 06:30:00',
  },
  {
    id: 2,
    type: 'expense',
    amount: 150000,
    note: 'Kulakan Indomie 2 dus',
    date: '2026-09-20',
    created_at: '2026-09-20 09:00:00',
  },
  {
    id: 3,
    type: 'income',
    amount: 75000,
    note: 'Penjualan offline pagi',
    date: '2026-09-20',
    created_at: '2026-09-20 11:30:00',
  },
  {
    id: 4,
    type: 'expense',
    amount: 25000,
    note: 'Beli token listrik warung',
    date: '2026-09-19',
    created_at: '2026-09-19 14:00:00',
  },
  {
    id: 5,
    type: 'income',
    amount: 250000,
    note: 'Penjualan sore kemarin',
    date: '2026-09-19',
    created_at: '2026-09-19 18:00:00',
  },
];
