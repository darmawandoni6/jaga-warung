import type { TransactionWithItems } from '@/types/transaction';

export interface DailySalesSummary {
  totalSales: number;
  transactionCount: number;
  itemCount: number;
}

export interface StockAlertItem {
  barcode: string;
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
