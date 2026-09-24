import { Text, TouchableOpacity, View } from 'react-native';

import { ChevronDown, ChevronUp, Clock } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { PriceText } from '@/components/ui/PriceText';
import type { TransactionItem } from '@/types/transaction';
import { formatRupiah } from '@/utils/currency';
import { formatRelative } from '@/utils/date';

export interface TransactionDetailRowProps {
  expanded: boolean;
  transactionId: number;
  createdAt: string;
  items: TransactionItem[];
  onToggle: () => void;
}

export function TransactionDetailRow({
  expanded,
  transactionId,
  createdAt,
  items,
  onToggle,
}: TransactionDetailRowProps) {
  if (!expanded) {
    return (
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
        <View className="mb-1.5 flex-row items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2.5">
          <View className="flex-row items-center gap-2">
            <Badge label={`#${transactionId}`} variant="neutral" size="sm" />
            <View className="flex-row items-center gap-1">
              <Clock size={11} color="#94A3B8" />
              <Text className="text-[10px] text-slate-400">{formatRelative(createdAt)}</Text>
            </View>
          </View>
          <ChevronDown size={14} color="#94A3B8" />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="mb-2.5 overflow-hidden rounded-xl border border-slate-100 bg-white">
      <View className="border-b border-slate-100 px-4 py-2.5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Badge label={`#${transactionId}`} variant="success" size="sm" icon={<Clock size={11} color="#059669" />} />
            <View className="flex-row items-center gap-1">
              <Clock size={11} color="#94A3B8" />
              <Text className="text-[10px] text-slate-400">{formatRelative(createdAt)}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onToggle} hitSlop={6}>
            <ChevronUp size={14} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="divide-y divide-slate-50 px-4 py-2">
        {items.map(item => (
          <View key={item.id} className="flex-row items-center justify-between py-2">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-medium text-slate-800" numberOfLines={1}>
                {item.product_name}
              </Text>
              <Text className="text-xs text-slate-400">
                {item.quantity} x {formatRupiah(item.sell_price)}
              </Text>
            </View>
            <PriceText amount={item.subtotal} size="sm" color="default" bold />
          </View>
        ))}
      </View>
    </View>
  );
}
