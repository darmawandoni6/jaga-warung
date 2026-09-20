export type CashFlowType = 'income' | 'expense';

export interface CashFlow {
  id: number;
  type: CashFlowType;
  amount: number;
  note: string;
  date: string;
  created_at: string;
}
