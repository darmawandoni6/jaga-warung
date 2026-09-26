import { useCallback, useEffect, useState } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import {
  addDebtPayment as addDebtPaymentRepo,
  createDebt as createDebtRepo,
  deleteDebt as deleteDebtRepo,
  getAllDebts,
} from '@/db/repositories/debtRepository';
import type { CreateDebtData } from '@/db/repositories/debtRepository';
import type { Debt } from '@/types/debt';

interface DebtState {
  key: number;
  debts: Debt[];
}

export interface UseDebtsResult {
  debts: Debt[];
  isLoading: boolean;
  refetch: () => void;
  createDebt: (data: CreateDebtData) => Promise<number>;
  addPayment: (id: number, amount: number, note?: string | null) => Promise<void>;
  deleteDebt: (id: number) => Promise<void>;
}

export function useDebts(): UseDebtsResult {
  const db = useSQLiteContext();
  const [state, setState] = useState<DebtState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getAllDebts(db)
      .then(rows => {
        if (!cancelled) setState({ key: refreshKey, debts: rows });
      })
      .catch(error => {
        console.error(error);
        if (!cancelled) setState({ key: refreshKey, debts: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [db, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(prev => prev + 1), []);

  const createDebt = useCallback(
    async (data: CreateDebtData) => {
      const id = await createDebtRepo(db, data);
      refetch();
      return id;
    },
    [db, refetch],
  );

  const addPayment = useCallback(
    async (id: number, amount: number, note?: string | null) => {
      await addDebtPaymentRepo(db, id, amount, note);
      refetch();
    },
    [db, refetch],
  );

  const deleteDebt = useCallback(
    async (id: number) => {
      await deleteDebtRepo(db, id);
      refetch();
    },
    [db, refetch],
  );

  return {
    debts: state?.debts ?? [],
    isLoading: state === null,
    refetch,
    createDebt,
    addPayment,
    deleteDebt,
  };
}
