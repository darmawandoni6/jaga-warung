import { useCallback, useEffect, useState } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import { getAllTransactions, getTransactionItems } from '@/db/repositories/transactionRepository';
import type { Transaction, TransactionItem } from '@/types/transaction';

interface TransactionRow {
  transaction: Transaction;
  items: TransactionItem[];
}

interface TransactionState {
  key: number;
  transactions: TransactionRow[];
}

export interface UseTransactionsResult {
  transactions: TransactionRow[];
  isLoading: boolean;
}

export function useTransactions(): UseTransactionsResult {
  const db = useSQLiteContext();
  const [state, setState] = useState<TransactionState | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAllTransactions(db)
      .then(async rows => {
        if (cancelled) return;

        const expanded: TransactionRow[] = [];
        for (const tx of rows) {
          try {
            const items = await getTransactionItems(db, tx.id);
            expanded.push({ transaction: tx, items });
          } catch {
            expanded.push({ transaction: tx, items: [] });
          }
        }
        if (!cancelled) setState({ key: Date.now(), transactions: expanded });
      })
      .catch(error => {
        console.error(error);
        if (!cancelled) setState({ key: Date.now(), transactions: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [db]);

  const transactions = state !== null ? state.transactions : [];
  const isLoading = state === null;

  return { transactions, isLoading };
}

export function useExpandedItems() {
  const db = useSQLiteContext();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [itemMap, setItemMap] = useState<Record<number, TransactionItem[]>>({});

  const toggleExpand = useCallback(
    async (id: number) => {
      if (expandedId === id) {
        setExpandedId(null);
        return;
      }

      if (itemMap[id]) {
        setExpandedId(id);
        return;
      }

      try {
        const items = await getTransactionItems(db, id);
        setItemMap(prev => ({ ...prev, [id]: items }));
        setExpandedId(id);
      } catch (error) {
        console.error(error);
        setExpandedId(id);
      }
    },
    [db, expandedId, itemMap],
  );

  return { expandedId, toggleExpand, itemMap };
}
