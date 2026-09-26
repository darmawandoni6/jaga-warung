import { useCallback, useEffect, useState } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import { getDebtPayments } from '@/db/repositories/debtRepository';
import type { DebtPayment } from '@/types/debt';

export interface UseDebtPaymentsResult {
  payments: DebtPayment[];
  isLoading: boolean;
  refetch: () => void;
}

interface DebtPaymentsState {
  key: string;
  payments: DebtPayment[];
}

export function useDebtPayments(debtId: number | null): UseDebtPaymentsResult {
  const db = useSQLiteContext();
  const [state, setState] = useState<DebtPaymentsState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const key = `${debtId ?? 'none'}::${refreshKey}`;

  useEffect(() => {
    if (!debtId) {
      return;
    }

    let cancelled = false;

    getDebtPayments(db, debtId)
      .then(rows => {
        if (!cancelled) {
          setState({ key, payments: rows });
        }
      })
      .catch(error => {
        console.error(error);
        if (!cancelled) {
          setState({ key, payments: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [db, debtId, key]);

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const isLoading = debtId !== null && (state === null || state.key !== key);
  const payments = debtId !== null && state !== null && state.key === key ? state.payments : [];

  return { payments, isLoading, refetch };
}
