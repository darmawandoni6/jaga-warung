import { useEffect, useState } from 'react';

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
}

export function useProducts(search: string = ''): UseProductsResult {
  const db = useSQLiteContext();
  const [state, setState] = useState<ProductsState | null>(null);

  useEffect(() => {
    let cancelled = false;

    getAllProducts(db, search)
      .then(rows => {
        if (!cancelled) setState({ key: search, products: rows });
      })
      .catch(error => {
        console.error(error);
        if (!cancelled) setState({ key: search, products: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [db, search]);

  const isLoading = state === null || state.key !== search;
  const products = state !== null && state.key === search ? state.products : [];

  return { products, isLoading };
}
