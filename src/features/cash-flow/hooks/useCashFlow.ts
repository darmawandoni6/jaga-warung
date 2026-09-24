import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import {
  type CreateCashFlowData,
  createCashFlow as createCashFlowRepo,
  deleteCashFlow as deleteCashFlowRepo,
  getAllCashFlows,
} from '@/db/repositories/cashFlowRepository';
import type { CashFlow } from '@/types/cash-flow';

interface CashFlowState {
  key: number;
  items: CashFlow[];
}

export interface CashFlowSummaryValues {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface UseCashFlowResult {
  cashFlows: CashFlow[];
  summary: CashFlowSummaryValues;
  isLoading: boolean;
  refetch: () => void;
  createCashFlow: (data: CreateCashFlowData) => Promise<number>;
  deleteCashFlow: (id: number) => Promise<void>;
}

export function useCashFlow(): UseCashFlowResult {
  const db = useSQLiteContext();
  const [state, setState] = useState<CashFlowState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getAllCashFlows(db)
      .then(rows => {
        if (!cancelled) setState({ key: refreshKey, items: rows });
      })
      .catch(error => {
        console.error(error);
        if (!cancelled) setState({ key: refreshKey, items: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [db, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(prev => prev + 1), []);

  const createCashFlow = useCallback(
    async (data: CreateCashFlowData) => {
      const id = await createCashFlowRepo(db, data);
      refetch();
      return id;
    },
    [db, refetch],
  );

  const deleteCashFlow = useCallback(
    async (id: number) => {
      await deleteCashFlowRepo(db, id);
      refetch();
    },
    [db, refetch],
  );

  const items = useMemo(() => state?.items ?? [], [state]);

  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const item of items) {
      if (item.type === 'income') {
        totalIncome += item.amount;
      } else {
        totalExpense += item.amount;
      }
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, [items]);

  return {
    cashFlows: items,
    summary,
    isLoading: state === null,
    refetch,
    createCashFlow,
    deleteCashFlow,
  };
}
