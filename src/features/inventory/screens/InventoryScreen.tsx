import { useMemo, useState } from 'react';

import { FlatList, Pressable, Text, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { SearchBar } from '@/components/ui/SearchBar';
import { MOCK_PRODUCTS } from '@/mocks/products';
import type { Product } from '@/types/product';
import { getStockStatus } from '@/utils/stock';

import { ProductListItem } from '../components/ProductListItem';

export function InventoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    let lowCount = 0;
    let emptyCount = 0;
    for (const p of MOCK_PRODUCTS) {
      const status = getStockStatus(p.stock, p.min_stock);
      if (status === 'low') {
        lowCount += 1;
      } else if (status === 'empty') {
        emptyCount += 1;
      }
    }
    return {
      total: MOCK_PRODUCTS.length,
      low: lowCount,
      empty: emptyCount,
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return MOCK_PRODUCTS;
    }
    return MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query));
  }, [search]);

  const handleAddProduct = () => {
    router.push('/(modals)/add-product' as Href);
  };

  const handleEditProduct = (product: Product) => {
    router.push({
      pathname: '/(modals)/add-product' as Href,
      params: { id: String(product.id) },
    } as Href);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="border-b border-slate-100 bg-white px-4 pb-3 pt-14">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-slate-900">📦 Manajemen Produk</Text>
          <View className="flex-row items-center gap-1.5">
            {stats.empty > 0 && (
              <View className="rounded-full bg-red-100 px-2 py-0.5">
                <Text className="text-xs font-semibold text-red-700">{stats.empty} Habis</Text>
              </View>
            )}
            {stats.low > 0 && (
              <View className="rounded-full bg-amber-100 px-2 py-0.5">
                <Text className="text-xs font-semibold text-amber-700">{stats.low} Menipis</Text>
              </View>
            )}
            <View className="rounded-full bg-slate-100 px-2.5 py-0.5">
              <Text className="text-xs font-semibold text-slate-600">{stats.total} Total</Text>
            </View>
          </View>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Cari produk (nama barang)..." />
      </View>

      {/* Product List */}
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
          contentContainerStyle={{ padding: 16, paddingBottom: 88 }}
          renderItem={({ item }) => <ProductListItem product={item} onEdit={handleEditProduct} />}
        />
      )}

      {/* Floating Action Button (FAB) */}
      <Pressable
        onPress={handleAddProduct}
        className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg active:bg-emerald-600"
        style={{ elevation: 6 }}
      >
        <Plus size={26} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
