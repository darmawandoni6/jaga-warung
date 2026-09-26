import { useLocalSearchParams } from 'expo-router';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ProductForm } from '@/features/inventory/components/ProductForm';
import { useProduct } from '@/features/inventory/hooks/useInventory';

export default function AddProductModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const productId = id && !isNaN(Number(id)) ? Number(id) : undefined;
  const { product, isLoading } = useProduct(productId);

  if (isLoading) {
    return <LoadingScreen message="Memuat produk..." />;
  }

  return <ProductForm initialProduct={product ?? undefined} />;
}
