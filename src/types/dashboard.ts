import type { TransactionWithItems } from '@/mocks/transactions';

export interface DailySalesSummary {
  totalSales: number;
  transactionCount: number;
  itemCount: number;
}

export interface StockAlertItem {
  id: number;
  name: string;
  stock: number;
  min_stock: number;
  status: 'low' | 'empty';
}

export interface DashboardMetrics {
  dailySales: DailySalesSummary;
  stockAlerts: StockAlertItem[];
  recentTransactions: TransactionWithItems[];
  activeDebtTotal: number;
  todayCashBalance: number;
}
