import { useMemo, useState } from 'react';

import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';

import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  History,
  Package,
  PackageCheck,
  ShoppingCart,
} from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { SearchBar } from '@/components/ui/SearchBar';
import type { StockMovementWithProduct } from '@/types/stock-movement';
import { formatRupiah } from '@/utils/currency';
import { formatDate } from '@/utils/date';

import { useStockMovements } from '../hooks/useStockManagement';

const FILTER_TABS = [
  { id: 'all', label: 'Semua' },
  { id: 'restock', label: '📦 Kulakan (+)' },
  { id: 'sale', label: '🛒 Penjualan (-)' },
  { id: 'adjustment', label: '⚠️ Opname' },
];

export function StockHistoryScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('all');
  const [search, setSearch] = useState('');

  const filter = useMemo(() => ({ type: selectedTab, search }), [selectedTab, search]);
  const { movements, stats, isLoading } = useStockMovements(filter);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="border-b border-slate-100 bg-white px-4 pb-3 pt-14">
        <View className="mb-3 flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <ArrowLeft size={18} color="#334155" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-lg font-bold text-slate-900">Riwayat Mutasi Stok</Text>
            <Text className="text-xs text-slate-500">Log keluar-masuk barang warung</Text>
          </View>
        </View>

        {/* Stats Summary Bar */}
        <View className="mb-3 flex-row gap-2">
          <View className="flex-1 rounded-xl bg-emerald-50/80 p-2.5">
            <View className="flex-row items-center gap-1">
              <PackageCheck size={13} color="#059669" />
              <Text className="text-[11px] font-semibold text-emerald-800">Kulakan</Text>
            </View>
            <Text className="mt-0.5 text-base font-bold text-emerald-700">
              +{stats.totalRestocked} <Text className="text-xs font-normal">pcs</Text>
            </Text>
          </View>

          <View className="flex-1 rounded-xl bg-blue-50/80 p-2.5">
            <View className="flex-row items-center gap-1">
              <ShoppingCart size={13} color="#2563EB" />
              <Text className="text-[11px] font-semibold text-blue-800">Terjual</Text>
            </View>
            <Text className="mt-0.5 text-base font-bold text-blue-700">
              -{stats.totalSold} <Text className="text-xs font-normal">pcs</Text>
            </Text>
          </View>

          <View className="flex-1 rounded-xl bg-amber-50/80 p-2.5">
            <View className="flex-row items-center gap-1">
              <AlertTriangle size={13} color="#D97706" />
              <Text className="text-[11px] font-semibold text-amber-800">Opname</Text>
            </View>
            <Text className="mt-0.5 text-base font-bold text-amber-700">
              {stats.totalAdjusted} <Text className="text-xs font-normal">pcs</Text>
            </Text>
          </View>
        </View>

        {/* Search Input */}
        <SearchBar value={search} onChangeText={setSearch} placeholder="Cari nama barang atau keterangan..." />

        {/* Filter Pills */}
        <View className="mt-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {FILTER_TABS.map(tab => {
              const isSelected = selectedTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  onPress={() => setSelectedTab(tab.id)}
                  className={`mr-2 rounded-xl px-3 py-1.5 ${
                    isSelected ? 'bg-slate-900' : 'bg-slate-100 active:bg-slate-200'
                  }`}
                >
                  <Text className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Movement List */}
      {isLoading ? (
        <LoadingScreen message="Memuat riwayat stok..." />
      ) : (
        <FlatList
          data={movements}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={
            <EmptyState
              title="Belum Ada Riwayat"
              subtitle={
                search
                  ? `Tidak ada catatan untuk "${search}"`
                  : 'Catatan keluar-masuk barang akan muncul di sini otomatis.'
              }
              icon={<History size={36} color="#94A3B8" />}
            />
          }
          renderItem={({ item }) => <StockMovementCard item={item} />}
        />
      )}
    </View>
  );
}

function StockMovementCard({ item }: { item: StockMovementWithProduct }) {
  const isRestock = item.type === 'restock';
  const isSale = item.type === 'sale';
  const isAdjustmentLoss = item.type === 'adjustment_loss';

  const badgeConfig = isRestock
    ? {
        label: `+${item.quantity} pcs`,
        variant: 'success' as const,
        icon: <ArrowUpRight size={14} color="#059669" />,
      }
    : isSale
      ? {
          label: `${item.quantity} pcs`,
          variant: 'info' as const,
          icon: <ArrowDownRight size={14} color="#2563EB" />,
        }
      : isAdjustmentLoss
        ? {
            label: `${item.quantity} pcs`,
            variant: 'danger' as const,
            icon: <ArrowDownRight size={14} color="#DC2626" />,
          }
        : {
            label: `+${item.quantity} pcs`,
            variant: 'warning' as const,
            icon: <ArrowUpRight size={14} color="#D97706" />,
          };

  return (
    <Card className="mb-2.5 p-3.5">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-2">
          <View className="flex-row items-center gap-1.5">
            <Package size={14} color="#64748B" />
            <Text className="text-sm font-bold text-slate-900" numberOfLines={1}>
              {item.product_name}
            </Text>
          </View>
          <Text className="mt-0.5 text-xs text-slate-400">{formatDate(item.created_at)}</Text>
        </View>

        <Badge label={badgeConfig.label} variant={badgeConfig.variant} icon={badgeConfig.icon} />
      </View>

      <View className="mt-2.5 flex-row items-center justify-between border-t border-slate-50 pt-2">
        <Text className="text-xs text-slate-500">
          Stok: <Text className="font-semibold text-slate-700">{item.previous_stock}</Text> →{' '}
          <Text className="font-bold text-slate-900">{item.final_stock} pcs</Text>
        </Text>

        {isRestock && item.total_cost ? (
          <Text className="text-xs font-semibold text-emerald-600">Biaya: {formatRupiah(item.total_cost)}</Text>
        ) : null}
      </View>

      {item.note ? (
        <View className="mt-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5">
          <Text className="text-[11px] text-slate-600">{item.note}</Text>
        </View>
      ) : null}
    </Card>
  );
}
