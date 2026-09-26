import { useCallback, useEffect, useState } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import { getAllProducts } from '@/db/repositories/productRepository';
import type { Product } from '@/types/product';

interface ProductsState {
  key: string;
  products: Product[];
}

export interface UseProductsResult {
  products: Product[];
  isLoading: boolean;
  refetch: () => void;
}

export function useProducts(search: string = ''): UseProductsResult {
  const db = useSQLiteContext();
  const [state, setState] = useState<ProductsState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const key = `${search}::${refreshKey}`;

  useEffect(() => {
    let cancelled = false;

    getAllProducts(db, search)
      .then(rows => {
        if (!cancelled) setState({ key, products: rows });
      })
      .catch(error => {
        console.error(error);
        if (!cancelled) setState({ key, products: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [db, search, key]);

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const isLoading = state === null || state.key !== key;
  const products = state !== null && state.key === key ? state.products : [];

  return { products, isLoading, refetch };
}
