import { Text, View } from 'react-native';

import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';

export interface CashFlowSummaryProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export function CashFlowSummary({ totalIncome, totalExpense, balance }: CashFlowSummaryProps) {
  const isPositiveBalance = balance >= 0;

  return (
    <Card className="mb-4 p-4">
      {/* Top: Net Balance */}
      <View className="flex-row items-center justify-between border-b border-slate-100 pb-3">
        <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
            <Wallet size={18} color="#059669" />
          </View>
          <View>
            <Text className="text-xs font-medium text-slate-500">Saldo Kas Bersih (Balance)</Text>
            <PriceText amount={balance} size="xl" color={isPositiveBalance ? 'success' : 'danger'} />
          </View>
        </View>
      </View>

      {/* Bottom: Total Income & Total Expense */}
      <View className="mt-3 flex-row items-center justify-between divide-x divide-slate-100">
        {/* Total In */}
        <View className="flex-1 pr-3">
          <View className="mb-1 flex-row items-center gap-1.5">
            <View className="h-5 w-5 items-center justify-center rounded-full bg-emerald-50">
              <ArrowUpRight size={13} color="#059669" />
            </View>
            <Text className="text-xs font-medium text-slate-600">Total Masuk (In)</Text>
          </View>
          <PriceText amount={totalIncome} size="md" color="success" />
        </View>

        {/* Total Out */}
        <View className="flex-1 pl-3">
          <View className="mb-1 flex-row items-center gap-1.5">
            <View className="h-5 w-5 items-center justify-center rounded-full bg-red-50">
              <ArrowDownRight size={13} color="#DC2626" />
            </View>
            <Text className="text-xs font-medium text-slate-600">Total Keluar (Out)</Text>
          </View>
          <PriceText amount={totalExpense} size="md" color="danger" />
        </View>
      </View>
    </Card>
  );
}
