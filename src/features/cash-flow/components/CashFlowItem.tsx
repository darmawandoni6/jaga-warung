import { Text, View } from 'react-native';

import { ArrowDownRight, ArrowUpRight } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import type { CashFlow } from '@/types/cash-flow';

export interface CashFlowItemProps {
  item: CashFlow;
}

export function CashFlowItem({ item }: CashFlowItemProps) {
  const isIncome = item.type === 'income';

  return (
    <Card className="mb-2.5 p-3.5">
      <View className="flex-row items-center justify-between">
        {/* Left: Icon, Note, Badge */}
        <View className="flex-1 flex-row items-center gap-3 pr-2">
          <View
            className={`h-9 w-9 items-center justify-center rounded-full ${isIncome ? 'bg-emerald-100' : 'bg-red-100'}`}
          >
            {isIncome ? <ArrowUpRight size={18} color="#059669" /> : <ArrowDownRight size={18} color="#DC2626" />}
          </View>
          <View className="flex-1">
            <View className="mb-1 flex-row items-center gap-2">
              <Badge label={isIncome ? 'Pemasukan' : 'Pengeluaran'} variant={isIncome ? 'success' : 'danger'} />
            </View>
            <Text className="text-sm font-semibold text-slate-900" numberOfLines={1}>
              {item.note}
            </Text>
          </View>
        </View>

        {/* Right: Amount */}
        <View className="items-end">
          <View className="flex-row items-center">
            <Text className={`mr-1 text-base font-bold ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
              {isIncome ? '+' : '-'}
            </Text>
            <PriceText amount={item.amount} size="md" color={isIncome ? 'success' : 'danger'} />
          </View>
        </View>
      </View>
    </Card>
  );
}
