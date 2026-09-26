import { useCallback, useMemo, useState } from 'react';

import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { ScanBarcode, Sparkles } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { SearchBar } from '@/components/ui/SearchBar';
import { useCategories } from '@/features/inventory/hooks/useCategories';
import { useCartStore } from '@/store/useCartStore';

import { BarcodeScannerModal } from '../components/BarcodeScannerModal';
import { CartSummary } from '../components/CartSummary';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

export interface POSScreenProps {
  onCheckout?: () => void;
}

export function POSScreen({ onCheckout }: POSScreenProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [quickAddedFeedback, setQuickAddedFeedback] = useState<string | null>(null);

  const addItem = useCartStore(s => s.addItem);
  const totalItems = useCartStore(s => s.totalItems());

  // Products fetched from SQLite — search handled via LIKE (name / barcode)
  const { products, isLoading, refetch } = useProducts(search);
  const { categories: allCategories, refetch: refetchCategories } = useCategories();

  // Refetch when screen regains focus (e.g. after checkout modal closes or switching tabs)
  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchCategories();
    }, [refetch, refetchCategories]),
  );

  // Combine registered categories and any distinct categories from products
  const categories = useMemo(() => {
    const registered = allCategories.map(c => c.name);
    const fromProducts = Array.from(new Set(products.map(p => p.type).filter(Boolean))) as string[];
    const combined = Array.from(new Set([...registered, ...fromProducts]));
    return ['Semua', ...combined];
  }, [allCategories, products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'Semua') return products;
    return products.filter(p => p.type?.toLowerCase() === selectedCategory.toLowerCase());
  }, [products, selectedCategory]);

  const handleSearchSubmit = () => {
    const query = search.trim().toLowerCase();
    if (!query) return;

    // Look for exact barcode match first, then name match
    const matched =
      products.find(p => p.barcode && p.barcode.toLowerCase() === query) ||
      products.find(p => p.name.toLowerCase() === query) ||
      (filteredProducts.length === 1 ? filteredProducts[0] : null);

    if (matched && matched.stock > 0) {
      addItem(matched);
      setQuickAddedFeedback(`+1 ${matched.name}`);
      setTimeout(() => setQuickAddedFeedback(null), 2000);
      setSearch('');
    }
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']} className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="border-b border-slate-100 bg-white px-4 pb-3 pt-2">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-slate-900">🛒 Kasir</Text>
          {totalItems > 0 && (
            <View className="rounded-full bg-emerald-500 px-3 py-1">
              <Text className="text-xs font-semibold text-white">{totalItems} barang</Text>
            </View>
          )}
        </View>

        {/* Search Bar + Barcode Scanner Trigger Button */}
        <View className="flex-row items-center gap-2">
          <View className="flex-1">
            <SearchBar
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearchSubmit}
              placeholder="Cari nama atau scan barcode..."
            />
          </View>
          <Pressable
            onPress={() => router.push('/(modals)/transaction-history' as Href)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 active:bg-slate-100"
          >
            <Text className="text-xs font-semibold text-slate-700">Riwayat</Text>
          </Pressable>
          <Pressable
            onPress={() => setIsScannerOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Scan Barcode"
            className="h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 active:opacity-70"
          >
            <ScanBarcode size={20} color="#059669" />
          </Pressable>
        </View>

        {/* Quick Added Feedback Banner */}
        {quickAddedFeedback && (
          <View className="mt-2 flex-row items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1">
            <Sparkles size={14} color="#059669" />
            <Text className="text-xs font-bold text-emerald-800">{quickAddedFeedback} masuk keranjang!</Text>
          </View>
        )}

        {/* Category Filter Pills (Fast 1-Tap Filter) */}
        <View className="mt-2.5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            <View className="flex-row gap-1.5 pr-4">
              {categories.map(cat => {
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

      {/* Product Grid */}
      {isLoading ? (
        <LoadingScreen message="Memuat produk..." />
      ) : filteredProducts.length === 0 ? (
        <View className="flex-1 justify-center">
          <EmptyState
            emoji="🔍"
            title="Produk tidak ditemukan"
            subtitle={search ? `Tidak ada hasil untuk "${search}"` : 'Belum ada produk di kategori ini'}
          />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.barcode}
          numColumns={2}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{ padding: 12, paddingBottom: totalItems > 0 ? 16 : 32 }}
          renderItem={({ item }) => <ProductCard product={item} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          className="flex-1"
        />
      )}

      {/* Cart Summary Drawer (Sticky Bottom) — Only rendered when items exist in cart */}
      {totalItems > 0 && <CartSummary onCheckout={onCheckout ?? (() => router.push('/(modals)/checkout' as Href))} />}

      {/* Barcode Scanner Modal */}
      {isScannerOpen && <BarcodeScannerModal visible={isScannerOpen} onClose={() => setIsScannerOpen(false)} />}
    </ScreenContainer>
  );
}
