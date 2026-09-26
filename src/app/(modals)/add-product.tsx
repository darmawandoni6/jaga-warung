import { useLocalSearchParams } from 'expo-router';

import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { ProductForm } from '@/features/inventory/components/ProductForm';
import { useProduct } from '@/features/inventory/hooks/useInventory';

export default function AddProductModal() {
  const { barcode } = useLocalSearchParams<{ barcode?: string }>();
  const productBarcode = barcode?.trim() ? barcode.trim() : undefined;
  const { product, isLoading } = useProduct(productBarcode);

  if (isLoading) {
    return <LoadingScreen message="Memuat produk..." />;
  }

  return <ProductForm initialProduct={product ?? undefined} />;
}
