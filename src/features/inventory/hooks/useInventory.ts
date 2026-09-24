import { useCallback, useEffect, useState } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import {
  type CreateProductData,
  createProduct as createProductRepo,
  deleteProduct as deleteProductRepo,
  getAllProducts,
  getProductById,
  updateProduct as updateProductRepo,
} from '@/db/repositories/productRepository';
import type { Product } from '@/types/product';

interface InventoryState {
  key: string;
  products: Product[];
}

export interface UseInventoryResult {
  products: Product[];
  isLoading: boolean;
  refetch: () => void;
  createProduct: (data: CreateProductData) => Promise<number>;
  updateProduct: (id: number, data: Parameters<typeof updateProductRepo>[2]) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
}

export function useInventory(search: string = ''): UseInventoryResult {
  const db = useSQLiteContext();
  const [state, setState] = useState<InventoryState | null>(null);
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

  const refetch = useCallback(() => setRefreshKey(prev => prev + 1), []);

  const createProduct = useCallback(
    async (data: CreateProductData) => {
      const id = await createProductRepo(db, data);
      refetch();
      return id;
    },
    [db, refetch],
  );

  const updateProduct = useCallback(
    async (id: number, data: Parameters<typeof updateProductRepo>[2]) => {
      await updateProductRepo(db, id, data);
      refetch();
    },
    [db, refetch],
  );

  const deleteProduct = useCallback(
    async (id: number) => {
      await deleteProductRepo(db, id);
      refetch();
    },
    [db, refetch],
  );

  return {
    products: state?.products ?? [],
    isLoading: state === null,
    refetch,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}

interface ProductByKeyState {
  key: string;
  product: Product | null;
}

export interface UseProductResult {
  product: Product | null;
  isLoading: boolean;
}

export function useProduct(id?: number): UseProductResult {
  const db = useSQLiteContext();
  const [state, setState] = useState<ProductByKeyState | null>(null);

  const key = id !== undefined ? String(id) : 'new';

  useEffect(() => {
    if (id === undefined) return;

    let cancelled = false;

    getProductById(db, id)
      .then(row => {
        if (!cancelled) setState({ key: String(id), product: row });
      })
      .catch(error => {
        console.error(error);
        if (!cancelled) setState({ key: String(id), product: null });
      });

    return () => {
      cancelled = true;
    };
  }, [db, id, key]);

  return {
    product: state !== null && state.key === key ? state.product : null,
    isLoading: id !== undefined && (state === null || state.key !== key),
  };
}
