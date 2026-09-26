import { useCallback, useEffect, useState } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import {
  createCategory as createCategoryRepo,
  deleteCategory as deleteCategoryRepo,
  getCategoriesWithCount,
  updateCategory as updateCategoryRepo,
} from '@/db/repositories/categoryRepository';
import type { CategoryWithCount } from '@/types/category';

export interface UseCategoriesResult {
  categories: CategoryWithCount[];
  isLoading: boolean;
  refetch: () => void;
  addCategory: (name: string) => Promise<number>;
  editCategory: (id: number, newName: string, oldName: string) => Promise<void>;
  removeCategory: (id: number, name: string) => Promise<void>;
}

interface CategoriesState {
  key: number;
  categories: CategoryWithCount[];
}

export function useCategories(): UseCategoriesResult {
  const db = useSQLiteContext();
  const [state, setState] = useState<CategoriesState | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getCategoriesWithCount(db)
      .then(data => {
        if (!cancelled) {
          setState({ key: refreshKey, categories: data });
        }
      })
      .catch(error => {
        console.error('Failed to load categories', error);
        if (!cancelled) {
          setState({ key: refreshKey, categories: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [db, refreshKey]);

  const refetch = useCallback(() => setRefreshKey(prev => prev + 1), []);

  const addCategory = useCallback(
    async (name: string) => {
      const id = await createCategoryRepo(db, name);
      refetch();
      return id;
    },
    [db, refetch],
  );

  const editCategory = useCallback(
    async (id: number, newName: string, oldName: string) => {
      await updateCategoryRepo(db, id, newName, oldName);
      refetch();
    },
    [db, refetch],
  );

  const removeCategory = useCallback(
    async (id: number, name: string) => {
      await deleteCategoryRepo(db, id, name);
      refetch();
    },
    [db, refetch],
  );

  return {
    categories: state?.key === refreshKey ? state.categories : (state?.categories ?? []),
    isLoading: state === null,
    refetch,
    addCategory,
    editCategory,
    removeCategory,
  };
}
