import { useMemo, useState } from 'react';

import { Alert, Pressable, SectionList, Text, View } from 'react-native';

import { Plus } from 'lucide-react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { MOCK_CASH_FLOWS } from '@/mocks/cash-flows';
import type { CashFlow, CashFlowType } from '@/types/cash-flow';
import { formatDate } from '@/utils/date';

import { CashFlowItem } from '../components/CashFlowItem';
import { CashFlowSummary } from '../components/CashFlowSummary';

type FilterType = 'all' | CashFlowType;

interface CashFlowSection {
  title: string;
  date: string;
  data: CashFlow[];
}

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'income', label: 'Pemasukan' },
  { key: 'expense', label: 'Pengeluaran' },
];

export function CashFlowScreen() {
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Overall totals across all mock records
  const summary = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const item of MOCK_CASH_FLOWS) {
      if (item.type === 'income') {
        totalIncome += item.amount;
      } else {
        totalExpense += item.amount;
      }
    }

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }, []);

  // Filtered and grouped by date
  const sections = useMemo(() => {
    const filtered = MOCK_CASH_FLOWS.filter(item => {
      if (filterType === 'all') return true;
      return item.type === filterType;
    });

    const groups: Record<string, CashFlow[]> = {};
    for (const item of filtered) {
      if (!groups[item.date]) {
        groups[item.date] = [];
      }
      groups[item.date].push(item);
    }

    // Sort dates descending
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

    return sortedDates.map((date): CashFlowSection => ({
      title: formatDate(date),
      date,
      data: groups[date],
    }));
  }, [filterType]);

  const handleAddCashFlow = () => {
    Alert.alert(
      'Catat Arus Kas',
      'Pencatatan kas masuk / kas keluar baru akan terhubung langsung ke database SQLite pada Phase 4.',
      [{ text: 'OK' }],
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="border-b border-slate-100 bg-white px-4 pb-3 pt-14">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-xl font-bold text-slate-900">💵 Arus Kas Warung</Text>
          <View className="rounded-full bg-slate-100 px-2.5 py-0.5">
            <Text className="text-xs font-semibold text-slate-600">{MOCK_CASH_FLOWS.length} Transaksi</Text>
          </View>
        </View>

        {/* Filter Segmented Control */}
        <View className="flex-row gap-2">
          {FILTER_TABS.map(tab => {
            const isActive = filterType === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => setFilterType(tab.key)}
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

      {/* Main Content */}
      <SectionList
        sections={sections}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingBottom: 88 }}
        ListHeaderComponent={
          <CashFlowSummary
            totalIncome={summary.totalIncome}
            totalExpense={summary.totalExpense}
            balance={summary.balance}
          />
        }
        renderSectionHeader={({ section: { title } }) => (
          <View className="mb-2 mt-3 flex-row items-center justify-between">
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</Text>
          </View>
        )}
        renderItem={({ item }) => <CashFlowItem item={item} />}
        ListEmptyComponent={
          <EmptyState
            emoji="💵"
            title="Tidak ada transaksi kas"
            subtitle="Belum ada transaksi pada filter yang dipilih"
          />
        }
      />

      {/* Floating Action Button (FAB) */}
      <Pressable
        onPress={handleAddCashFlow}
        className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg active:bg-emerald-600"
        style={{ elevation: 6 }}
      >
        <Plus size={26} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
