import { Text, View } from 'react-native';

import { Clock, Receipt } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import type { TransactionWithItems } from '@/types/transaction';
import { formatRelative } from '@/utils/date';

export interface RecentTransactionsCardProps {
  transactions: TransactionWithItems[];
}

export function RecentTransactionsCard({ transactions }: RecentTransactionsCardProps) {
  if (transactions.length === 0) {
    return null;
  }

  return (
    <Card className="border border-slate-100 bg-white p-4">
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-slate-100">
            <Receipt size={15} color="#475569" />
          </View>
          <Text className="text-sm font-semibold text-slate-800">Transaksi Terkini</Text>
        </View>
      </View>

      {/* Transaction List */}
      <View className="divide-y divide-slate-100">
        {transactions.slice(0, 3).map(tx => {
          const itemSummary = tx.items.map(item => `${item.product_name} (${item.quantity}x)`).join(', ');

          return (
            <View key={tx.id} className="flex-row items-center justify-between py-2.5">
              <View className="flex-1 pr-2">
                <Text className="text-xs font-semibold text-slate-800" numberOfLines={1}>
                  Transaksi #{tx.id}
                </Text>
                <Text className="text-[11px] text-slate-500" numberOfLines={1}>
                  {itemSummary}
                </Text>
                <View className="mt-0.5 flex-row items-center gap-1">
                  <Clock size={11} color="#94A3B8" />
                  <Text className="text-[10px] text-slate-400">{formatRelative(tx.created_at)}</Text>
                </View>
              </View>
              <PriceText amount={tx.total_amount} size="sm" color="default" />
            </View>
          );
        })}
      </View>
    </Card>
  );
}
