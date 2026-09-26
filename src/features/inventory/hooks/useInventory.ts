import { useCallback, useEffect, useState } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import {
  type CreateProductData,
  createProduct as createProductRepo,
  deleteProduct as deleteProductRepo,
  getAllProducts,
  getProductByBarcode,
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
  createProduct: (data: CreateProductData) => Promise<string>;
  updateProduct: (barcode: string, data: Parameters<typeof updateProductRepo>[2]) => Promise<void>;
  deleteProduct: (barcode: string) => Promise<void>;
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
      const barcode = await createProductRepo(db, data);
      refetch();
      return barcode;
    },
    [db, refetch],
  );

  const updateProduct = useCallback(
    async (barcode: string, data: Parameters<typeof updateProductRepo>[2]) => {
      await updateProductRepo(db, barcode, data);
      refetch();
    },
    [db, refetch],
  );

  const deleteProduct = useCallback(
    async (barcode: string) => {
      await deleteProductRepo(db, barcode);
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

export function useProduct(barcode?: string): UseProductResult {
  const db = useSQLiteContext();
  const [state, setState] = useState<ProductByKeyState | null>(null);

  const key = barcode && barcode.trim() !== '' ? barcode.trim() : 'new';

  useEffect(() => {
    if (!barcode || barcode.trim() === '') return;

    let cancelled = false;

    getProductByBarcode(db, barcode.trim())
      .then(row => {
        if (!cancelled) setState({ key: barcode.trim(), product: row });
      })
      .catch(error => {
        console.error(error);
        if (!cancelled) setState({ key: barcode.trim(), product: null });
      });

    return () => {
      cancelled = true;
    };
  }, [db, barcode, key]);

  return {
    product: state !== null && state.key === key ? state.product : null,
    isLoading: Boolean(barcode && barcode.trim() !== '') && (state === null || state.key !== key),
  };
}
