import { useMemo } from 'react';

import { MOCK_CASH_FLOWS } from '@/mocks/cash-flows';
import { MOCK_DEBTS } from '@/mocks/debts';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { MOCK_TRANSACTIONS } from '@/mocks/transactions';
import type { DashboardMetrics, StockAlertItem } from '@/types/dashboard';
import { getStockStatus } from '@/utils/stock';

export function useDashboardData(): DashboardMetrics {
  return useMemo(() => {
    // 1. Calculate Daily Sales
    const totalSales = MOCK_TRANSACTIONS.reduce((acc, curr) => acc + curr.total_amount, 0);
    const transactionCount = MOCK_TRANSACTIONS.length;
    const itemCount = MOCK_TRANSACTIONS.reduce(
      (acc, curr) => acc + curr.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0),
      0,
    );

    // 2. Calculate Stock Alerts (stock <= min_stock)
    const stockAlerts: StockAlertItem[] = MOCK_PRODUCTS.filter(product => {
      const status = getStockStatus(product.stock, product.min_stock);
      return status !== 'ok';
    }).map(product => ({
      id: product.id,
      name: product.name,
      stock: product.stock,
      min_stock: product.min_stock,
      status: getStockStatus(product.stock, product.min_stock) as 'low' | 'empty',
    }));

    // 3. Recent Transactions (sorted latest first)
    const recentTransactions = [...MOCK_TRANSACTIONS].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    // 4. Active Customer Debts
    const activeDebtTotal = MOCK_DEBTS.filter(debt => debt.status === 'active' || debt.status === 'partial').reduce(
      (acc, debt) => acc + (debt.total_debt - debt.paid_amount),
      0,
    );

    // 5. Today Cash Balance
    const income = MOCK_CASH_FLOWS.filter(cf => cf.type === 'income').reduce((acc, cf) => acc + cf.amount, 0);
    const expense = MOCK_CASH_FLOWS.filter(cf => cf.type === 'expense').reduce((acc, cf) => acc + cf.amount, 0);
    const todayCashBalance = income - expense;

    return {
      dailySales: {
        totalSales,
        transactionCount,
        itemCount,
      },
      stockAlerts,
      recentTransactions,
      activeDebtTotal,
      todayCashBalance,
    };
  }, []);
}
