export type DebtStatus = 'active' | 'partial' | 'paid' | 'bad_debt';

export interface Debt {
  id: number;
  customer_name: string;
  phone: string | null;
  total_debt: number;
  paid_amount: number;
  status: DebtStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface DebtPayment {
  id: number;
  debt_id: number;
  amount: number;
  note: string | null;
  created_at: string;
}
