import { useMemo, useState } from 'react';

import { FlatList, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { useCartStore } from '@/store/useCartStore';

import { CartSummary } from '../components/CartSummary';
import { ProductCard } from '../components/ProductCard';

export interface POSScreenProps {
  onCheckout?: () => void;
}

export function POSScreen({ onCheckout }: POSScreenProps) {
  const [search, setSearch] = useState('');
  const totalItems = useCartStore(s => s.totalItems());

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return MOCK_PRODUCTS;
    }
    return MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query));
  }, [search]);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="border-b border-slate-100 bg-white px-4 pb-3 pt-14">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-slate-900">🛒 Kasir</Text>
          {totalItems > 0 && (
            <View className="rounded-full bg-emerald-500 px-3 py-1">
              <Text className="text-xs font-semibold text-white">{totalItems} barang</Text>
            </View>
          )}
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Cari produk (nama / scan)..." />
      </View>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="Produk tidak ditemukan"
          subtitle={search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada produk terdaftar'}
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 8, paddingBottom: 16 }}
          renderItem={({ item }) => <ProductCard product={item} />}
        />
      )}

      {/* Cart Summary Drawer (Sticky Bottom) */}
      <CartSummary onCheckout={onCheckout} />
    </View>
  );
}
