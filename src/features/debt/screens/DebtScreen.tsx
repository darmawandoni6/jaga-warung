import { useCallback, useMemo, useState } from 'react';

import { FlatList, Pressable, Text, View } from 'react-native';

import { type Href, useFocusEffect, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { PriceText } from '@/components/ui/PriceText';
import { SearchBar } from '@/components/ui/SearchBar';
import type { Debt } from '@/types/debt';

import { DebtCard } from '../components/DebtCard';
import { DebtPaymentModal } from '../components/DebtPaymentModal';
import { useDebts } from '../hooks/useDebt';

type FilterTab = 'all' | 'active' | 'paid';

interface TabItem {
  key: FilterTab;
  label: string;
}

const TABS: TabItem[] = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Belum Lunas' },
  { key: 'paid', label: 'Lunas' },
];

export function DebtScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);
  const { debts, isLoading, refetch, addPayment } = useDebts();

  // Refetch when screen regains focus (e.g. after add-debt modal closes)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Summary statistics
  const stats = useMemo(() => {
    let totalOutstanding = 0;
    let unpaidCount = 0;
    let paidCount = 0;

    for (const d of debts) {
      const remaining = Math.max(0, d.total_debt - d.paid_amount);
      if (d.status === 'paid' || remaining === 0) {
        paidCount += 1;
      } else {
        totalOutstanding += remaining;
        unpaidCount += 1;
      }
    }

    return {
      totalOutstanding,
      unpaidCount,
      paidCount,
      totalCount: debts.length,
    };
  }, [debts]);

  // Filtered debts based on tab and search query
  const filteredDebts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return debts.filter(debt => {
      // Tab filter
      if (selectedTab === 'active') {
        const remaining = debt.total_debt - debt.paid_amount;
        if (debt.status === 'paid' || remaining <= 0) return false;
      } else if (selectedTab === 'paid') {
        const remaining = debt.total_debt - debt.paid_amount;
        if (debt.status !== 'paid' && remaining > 0) return false;
      }

      // Search filter
      if (!query) return true;
      const matchName = debt.customer_name.toLowerCase().includes(query);
      const matchPhone = debt.phone ? debt.phone.toLowerCase().includes(query) : false;
      return matchName || matchPhone;
    });
  }, [debts, selectedTab, search]);

  const handleAddDebt = () => {
    router.push('/(modals)/add-debt' as Href);
  };

  const handlePressDebt = (_debt: Debt) => {
    // Will link to debt detail in future tasks
  };

  const handlePayDebt = (debt: Debt) => {
    setPaymentDebt(debt);
  };

  const handleConfirmPayment = async (amount: number) => {
    if (!paymentDebt) return;
    await addPayment(paymentDebt.id, amount);
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="border-b border-slate-100 bg-white px-4 pb-3 pt-14">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-slate-900">📖 Buku Utang</Text>
          <View className="rounded-full bg-slate-100 px-2.5 py-0.5">
            <Text className="text-xs font-semibold text-slate-600">{stats.totalCount} Catatan</Text>
          </View>
        </View>

        {/* Outstanding Total Banner */}
        <View className="mb-3 flex-row items-center justify-between rounded-xl border border-amber-100 bg-amber-50 p-3">
          <View>
            <Text className="text-xs font-medium text-amber-800">Total Piutang Belum Lunas</Text>
            <PriceText amount={stats.totalOutstanding} size="lg" color="warning" />
          </View>
          <View className="items-end">
            <Text className="text-xs text-amber-700">{stats.unpaidCount} orang belum lunas</Text>
            <Text className="text-xs text-emerald-700">{stats.paidCount} orang lunas</Text>
          </View>
        </View>

        {/* Search */}
        <SearchBar value={search} onChangeText={setSearch} placeholder="Cari nama pelanggan atau no. HP..." />

        {/* Filter Tabs */}
        <View className="mt-3 flex-row gap-2">
          {TABS.map(tab => {
            const isActive = selectedTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setSelectedTab(tab.key)}
                className={`rounded-lg px-3.5 py-1.5 ${
                  isActive ? 'bg-emerald-500' : 'bg-slate-100 active:bg-slate-200'
                }`}
              >
                <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-600'}`}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Debt List */}
      {isLoading ? (
        <LoadingScreen message="Memuat utang..." />
      ) : filteredDebts.length === 0 ? (
        <EmptyState
          emoji="📖"
          title="Tidak ada catatan utang"
          subtitle={
            search
              ? `Tidak ditemukan hasil untuk "${search}"`
              : selectedTab === 'active'
                ? 'Semua utang pelanggan sudah lunas 🎉'
                : 'Belum ada catatan utang'
          }
        />
      ) : (
        <FlatList
          data={filteredDebts}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ padding: 16, paddingBottom: 88 }}
          renderItem={({ item }) => <DebtCard debt={item} onPress={handlePressDebt} onPay={handlePayDebt} />}
        />
      )}

      {/* Payment Modal */}
      <DebtPaymentModal debt={paymentDebt} onClose={() => setPaymentDebt(null)} onConfirm={handleConfirmPayment} />

      {/* Floating Action Button (FAB) */}
      <Pressable
        onPress={handleAddDebt}
        className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg active:bg-emerald-600"
        style={{ elevation: 6 }}
      >
        <Plus size={26} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
