import { useCallback, useMemo, useState } from 'react';

import { Alert, FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { History, Plus, Tag } from 'lucide-react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { SearchBar } from '@/components/ui/SearchBar';
import type { Product } from '@/types/product';
import { getStockStatus } from '@/utils/stock';

import { ProductListItem } from '../components/ProductListItem';
import { RestockModal } from '../components/RestockModal';
import { StockAdjustmentModal } from '../components/StockAdjustmentModal';
import { useCategories } from '../hooks/useCategories';
import { useInventory } from '../hooks/useInventory';

export function InventoryScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const { products, isLoading, refetch, deleteProduct } = useInventory(search);
  const { categories: allCategories, refetch: refetchCategories } = useCategories();

  // Refetch when screen regains focus (e.g. after add/edit modal closes)
  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchCategories();
    }, [refetch, refetchCategories]),
  );

  const categoryList = useMemo(() => {
    return ['Semua', ...allCategories.map(c => c.name)];
  }, [allCategories]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Semua') return products;
    return products.filter(p => p.type?.toLowerCase() === selectedCategory.toLowerCase());
  }, [products, selectedCategory]);

  const stats = useMemo(() => {
    let lowCount = 0;
    let emptyCount = 0;
    for (const p of products) {
      const status = getStockStatus(p.stock, p.min_stock);
      if (status === 'low') {
        lowCount += 1;
      } else if (status === 'empty') {
        emptyCount += 1;
      }
    }
    return {
      total: products.length,
      low: lowCount,
      empty: emptyCount,
    };
  }, [products]);

  const handleAddProduct = () => {
    router.push({
      pathname: '/(modals)/add-product' as Href,
      params: { barcode: '' },
    } as Href);
  };

  const handleEditProduct = (product: Product) => {
    router.push({
      pathname: '/(modals)/add-product' as Href,
      params: { barcode: product.barcode },
    } as Href);
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert('Hapus Produk', `Hapus "${product.name}" dari daftar?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(product.barcode);
          } catch (error) {
            console.error(error);
            Alert.alert('Gagal Menghapus', 'Produk sudah tercatat dalam transaksi dan tidak dapat dihapus.');
          }
        },
      },
    ]);
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
        {/* Search Bar + Action Buttons */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <SearchBar value={search} onChangeText={setSearch} placeholder="Cari produk (nama barang)..." />
          </View>
          <Pressable
            onPress={() => router.push('/(modals)/stock-history' as Href)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Riwayat Stok"
            className="h-10 flex-row items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 active:bg-slate-100"
          >
            <History size={16} color="#475569" />
            <Text className="text-xs font-semibold text-slate-700">Riwayat</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/(modals)/categories' as Href)}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Kelola Kategori"
            className="h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 active:opacity-70"
          >
            <Tag size={18} color="#059669" />
          </Pressable>
        </View>

        {/* Category Filter Pills (Pure 1-Tap Filter) */}
        <View className="mt-2.5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <View className="flex-row gap-1.5 pr-4">
              {categoryList.map(cat => {
                const isSelected = selectedCategory === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3 py-1.5 ${
                      isSelected
                        ? 'border border-emerald-500 bg-emerald-500'
                        : 'border border-slate-200 bg-slate-100 active:bg-slate-200'
                    }`}
                  >
                    <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Product List */}
      {isLoading ? (
        <LoadingScreen message="Memuat produk..." />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="Produk tidak ditemukan"
          subtitle={
            search
              ? `Tidak ada hasil untuk "${search}"`
              : selectedCategory !== 'Semua'
                ? `Belum ada produk di kategori "${selectedCategory}"`
                : 'Belum ada produk terdaftar'
          }
        />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.barcode}
          contentContainerStyle={{ padding: 16, paddingBottom: 88 }}
          renderItem={({ item }) => (
            <ProductListItem
              product={item}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onRestock={p => setRestockProduct(p)}
              onAdjust={p => setAdjustProduct(p)}
            />
          )}
        />
      )}

      {/* Restock Modal */}
      <RestockModal
        product={restockProduct}
        visible={Boolean(restockProduct)}
        onClose={() => setRestockProduct(null)}
        onSuccess={() => refetch()}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        product={adjustProduct}
        visible={Boolean(adjustProduct)}
        onClose={() => setAdjustProduct(null)}
        onSuccess={() => refetch()}
      />

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
