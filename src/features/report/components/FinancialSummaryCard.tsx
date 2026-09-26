import { Text, View } from 'react-native';

import { TrendingUp } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import type { FinancialSummary } from '@/types/report';

export interface FinancialSummaryCardProps {
  summary: FinancialSummary;
}

export function FinancialSummaryCard({ summary }: FinancialSummaryCardProps) {
  const isProfit = summary.netProfit >= 0;
  const marginText = `${summary.profitMargin >= 0 ? '+' : ''}${summary.profitMargin.toFixed(1)}% Margin`;

  return (
    <Card className="mb-4 border border-emerald-100 bg-white p-4">
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
            <TrendingUp size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">Laba Bersih Usaha</Text>
            <Text className="text-[11px] text-slate-400">Omzet − Modal − Beban Operasional</Text>
          </View>
        </View>

        {summary.totalSales > 0 && <Badge variant={isProfit ? 'success' : 'danger'} label={marginText} />}
      </View>

      {/* Main Stat: Net Profit */}
      <View className="mb-3 rounded-xl border border-emerald-100/80 bg-emerald-50/70 p-3.5">
        <Text className="text-xs font-medium text-slate-600">Estimasi Bersih Diterima</Text>
        <PriceText
          amount={summary.netProfit}
          size="xl"
          color={isProfit ? 'success' : 'danger'}
          bold
          className="mt-0.5 text-2xl"
        />
      </View>

      {/* Breakdown Details */}
      <View className="divide-y divide-slate-100">
        {/* Omzet Penjualan */}
        <View className="flex-row items-center justify-between py-2">
          <View>
            <Text className="text-xs font-medium text-slate-700">Omzet Penjualan Kasir</Text>
            <Text className="text-[10px] text-slate-400">{summary.transactionCount} transaksi lunas</Text>
          </View>
          <PriceText amount={summary.totalSales} size="sm" color="default" bold />
        </View>

        {/* Modal Terjual / HPP */}
        <View className="flex-row items-center justify-between py-2">
          <View>
            <Text className="text-xs font-medium text-slate-700">Modal Pokok Barang Terjual (HPP)</Text>
            <Text className="text-[10px] text-slate-400">Total modal beli barang yang laku</Text>
          </View>
          <PriceText amount={summary.totalHpp} size="sm" color="warning" />
        </View>

        {/* Laba Kotor */}
        <View className="flex-row items-center justify-between py-2">
          <Text className="text-xs font-semibold text-slate-800">Laba Kotor Dagang</Text>
          <PriceText
            amount={summary.grossProfit}
            size="sm"
            color={summary.grossProfit >= 0 ? 'success' : 'danger'}
            bold
          />
        </View>

        {/* Beban Operasional */}
        <View className="flex-row items-center justify-between py-2">
          <View>
            <Text className="text-xs font-medium text-slate-700">Beban Operasional Warung</Text>
            <Text className="text-[10px] text-slate-400">Listrik, plastik, sampah, dll (di luar kulakan)</Text>
          </View>
          <PriceText amount={summary.operationalExpenses} size="sm" color="danger" />
        </View>
      </View>
    </Card>
  );
}
