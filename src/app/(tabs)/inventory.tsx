import { Text } from 'react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';

export default function InventoryTab() {
  return (
    <ScreenContainer className="items-center justify-center">
      <Text className="text-xl font-bold text-slate-900">📦 Manajemen Produk</Text>
      <Text className="mt-1 text-sm text-slate-500">Daftar & Stok Barang</Text>
    </ScreenContainer>
  );
}
