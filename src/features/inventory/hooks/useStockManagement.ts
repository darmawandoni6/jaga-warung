import { useCallback, useEffect, useState } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import {
  adjustStock as adjustStockRepo,
  getAllStockMovementsWithProduct,
  getStockMovementStats,
  restockProduct as restockProductRepo,
} from '@/db/repositories/stockMovementRepository';
import type {
  AdjustStockParams,
  RestockParams,
  StockMovementStats,
  StockMovementWithProduct,
} from '@/types/stock-movement';

export interface UseStockManagementResult {
  isSubmitting: boolean;
  restock: (params: RestockParams) => Promise<{ previousStock: number; finalStock: number }>;
  adjust: (params: AdjustStockParams) => Promise<{ previousStock: number; finalStock: number }>;
}

export function useStockManagement(): UseStockManagementResult {
  const db = useSQLiteContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const restock = useCallback(
    async (params: RestockParams) => {
      setIsSubmitting(true);
      try {
        return await restockProductRepo(db, params);
      } finally {
        setIsSubmitting(false);
      }
    },
    [db],
  );

  const adjust = useCallback(
    async (params: AdjustStockParams) => {
      setIsSubmitting(true);
      try {
        return await adjustStockRepo(db, params);
      } finally {
        setIsSubmitting(false);
      }
    },
    [db],
  );

  return {
    isSubmitting,
    restock,
    adjust,
  };
}

interface MovementState {
  key: string;
  movements: StockMovementWithProduct[];
  stats: StockMovementStats;
}

export interface UseStockMovementsResult {
  movements: StockMovementWithProduct[];
  stats: StockMovementStats;
  isLoading: boolean;
  refetch: () => void;
}

export function useStockMovements(filter?: { type?: string; search?: string }): UseStockMovementsResult {
  const db = useSQLiteContext();
  const [state, setState] = useState<MovementState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const type = filter?.type ?? 'all';
  const search = filter?.search ?? '';
  const key = `${type}::${search}::${refreshKey}`;

  useEffect(() => {
    let cancelled = false;

    Promise.all([getAllStockMovementsWithProduct(db, { type, search }), getStockMovementStats(db)])
      .then(([movements, stats]) => {
        if (!cancelled) {
          setState({ key, movements, stats });
        }
      })
      .catch(error => {
        console.error('Failed to load stock movements', error);
        if (!cancelled) {
          setState({
            key,
            movements: [],
            stats: { totalRestocked: 0, totalSold: 0, totalAdjusted: 0 },
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [db, key, type, search]);

  const refetch = useCallback(() => setRefreshKey(prev => prev + 1), []);

  const movements = state?.key === key ? state.movements : [];
  const stats = state?.key === key ? state.stats : { totalRestocked: 0, totalSold: 0, totalAdjusted: 0 };
  const isLoading = state === null || state.key !== key;

  return { movements, stats, isLoading, refetch };
}
