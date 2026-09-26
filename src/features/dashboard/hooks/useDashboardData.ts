import { useCallback, useEffect, useState } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import { getCashFlowSummary } from '@/db/repositories/cashFlowRepository';
import { getActiveDebtTotal } from '@/db/repositories/debtRepository';
import { getLowStockProducts } from '@/db/repositories/productRepository';
import { getDailySalesMetrics, getRecentTransactionsWithItems } from '@/db/repositories/transactionRepository';
import type { DashboardMetrics } from '@/types/dashboard';
import { getStockStatus } from '@/utils/stock';

const DEFAULT_METRICS: DashboardMetrics = {
  dailySales: {
    totalSales: 0,
    transactionCount: 0,
    itemCount: 0,
  },
  stockAlerts: [],
  recentTransactions: [],
  activeDebtTotal: 0,
  todayCashBalance: 0,
};

export interface UseDashboardDataResult {
  metrics: DashboardMetrics;
  isLoading: boolean;
  refetch: () => void;
}

export function useDashboardData(): UseDashboardDataResult {
  const db = useSQLiteContext();
  const [metrics, setMetrics] = useState<DashboardMetrics>(DEFAULT_METRICS);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [dailySales, lowStockProducts, recentTransactions, activeDebtTotal, cashSummary] = await Promise.all([
          getDailySalesMetrics(db),
          getLowStockProducts(db),
          getRecentTransactionsWithItems(db, 3),
          getActiveDebtTotal(db),
          getCashFlowSummary(db),
        ]);

        if (cancelled) return;

        const stockAlerts = lowStockProducts.map(p => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
          min_stock: p.min_stock,
          status: getStockStatus(p.stock, p.min_stock) as 'low' | 'empty',
        }));

        setMetrics({
          dailySales,
          stockAlerts,
          recentTransactions,
          activeDebtTotal,
          todayCashBalance: cashSummary.balance,
        });
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [db, refreshKey]);

  return { metrics, isLoading, refetch };
}
