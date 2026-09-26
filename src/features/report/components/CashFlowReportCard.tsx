import { Text, View } from 'react-native';

import { ArrowDownRight, ArrowUpRight, Wallet } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import type { CashFlowReportSummary } from '@/types/report';

export interface CashFlowReportCardProps {
  cashFlow: CashFlowReportSummary;
}

export function CashFlowReportCard({ cashFlow }: CashFlowReportCardProps) {
  const isPositive = cashFlow.balance >= 0;

  return (
    <Card className="mb-4 border border-slate-100 bg-white p-4">
      {/* Header */}
      <View className="mb-3 flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-slate-100">
          <Wallet size={16} color="#059669" />
        </View>
        <View>
          <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Arus Kas Fisik (Likuiditas)
          </Text>
          <Text className="text-[11px] text-slate-400">Total uang tunai masuk vs keluar pada periode ini</Text>
        </View>
      </View>

      {/* Row: In, Out, Balance */}
      <View className="flex-row items-center justify-between rounded-xl bg-slate-50 p-3">
        {/* Total In */}
        <View className="flex-1 pr-2">
          <View className="mb-1 flex-row items-center gap-1">
            <View className="h-4 w-4 items-center justify-center rounded-full bg-emerald-100">
              <ArrowUpRight size={11} color="#059669" />
            </View>
            <Text className="text-[11px] font-medium text-slate-600">Total Masuk</Text>
          </View>
          <PriceText amount={cashFlow.totalIn} size="sm" color="success" bold />
        </View>

        <View className="h-8 w-px bg-slate-200" />

        {/* Total Out */}
        <View className="flex-1 px-2">
          <View className="mb-1 flex-row items-center gap-1">
            <View className="h-4 w-4 items-center justify-center rounded-full bg-red-100">
              <ArrowDownRight size={11} color="#DC2626" />
            </View>
            <Text className="text-[11px] font-medium text-slate-600">Total Keluar</Text>
          </View>
          <PriceText amount={cashFlow.totalOut} size="sm" color="danger" bold />
        </View>

        <View className="h-8 w-px bg-slate-200" />

        {/* Balance */}
        <View className="flex-1 pl-2">
          <Text className="mb-1 text-[11px] font-medium text-slate-600">Selisih Kas</Text>
          <PriceText amount={cashFlow.balance} size="sm" color={isPositive ? 'success' : 'danger'} bold />
        </View>
      </View>
    </Card>
  );
}
