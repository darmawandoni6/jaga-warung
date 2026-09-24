import { useMemo } from 'react';

import { FlatList, Pressable, Text, View } from 'react-native';

import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { PriceText } from '@/components/ui/PriceText';
import { formatDate } from '@/utils/date';

import { TransactionDetailRow } from '../components/TransactionDetailRow';
import { useExpandedItems, useTransactions } from '../hooks/useTransactions';

export function TransactionHistoryScreen() {
  const router = useRouter();
  const { transactions, isLoading } = useTransactions();
  const { expandedId, toggleExpand } = useExpandedItems();

  const grouped = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    for (const row of transactions) {
      const date = formatDate(row.transaction.created_at);
      if (!groups[date]) groups[date] = [];
      groups[date].push(row);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, rows]) => ({ date, transactions: rows }));
  }, [transactions]);

  const totalRevenue = useMemo(
    () => transactions.reduce((acc, { transaction }) => acc + transaction.total_amount, 0),
    [transactions],
  );

  if (isLoading) {
    return <LoadingScreen message="Memuat riwayat transaksi..." />;
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="border-b border-slate-100 bg-white px-4 pb-3 pt-14">
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
            >
              <ArrowLeft size={18} color="#334155" />
            </Pressable>
            <View>
              <Text className="text-lg font-bold text-slate-900">Riwayat Transaksi</Text>
              <Text className="text-xs text-slate-500">{transactions.length} transaksi tercatat</Text>
            </View>
          </View>
          <View className="rounded-full bg-emerald-50 px-3 py-1.5">
            <PriceText amount={totalRevenue} size="sm" color="success" bold />
          </View>
        </View>
      </View>

      {/* List */}
      {transactions.length === 0 ? (
        <EmptyState emoji="📄" title="Belum ada transaksi" subtitle="Transaksi dari kasir akan muncul di sini." />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item, index) => item.date ?? String(index)}
          contentContainerStyle={{ padding: 16, paddingBottom: 88 }}
          ListHeaderComponent={
            <View className="mb-3">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-400">Hari Ini & Sebelumnya</Text>
            </View>
          }
          renderItem={({ item: { date, transactions: dayTx } }) => (
            <View className="mb-3">
              <Text className="mb-2 text-xs font-semibold text-slate-500">{date}</Text>
              {dayTx.map(({ transaction, items }) => (
                <TransactionDetailRow
                  key={transaction.id}
                  expanded={expandedId === transaction.id}
                  transactionId={transaction.id}
                  createdAt={transaction.created_at}
                  items={items}
                  onToggle={() => toggleExpand(transaction.id)}
                />
              ))}
            </View>
          )}
        />
      )}
    </View>
  );
}
