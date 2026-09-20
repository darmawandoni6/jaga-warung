import { useLocalSearchParams } from 'expo-router';

import { ProductForm } from '@/features/inventory/components/ProductForm';
import { MOCK_PRODUCTS } from '@/mocks/products';

export default function AddProductModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const initialProduct = id ? MOCK_PRODUCTS.find(p => p.id === Number(id)) : undefined;

  return <ProductForm initialProduct={initialProduct} />;
}
