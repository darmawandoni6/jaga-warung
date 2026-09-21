import { Text, View } from 'react-native';

import { ReceiptText, ShoppingBag, TrendingUp } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import type { DailySalesSummary } from '@/types/dashboard';

export interface DailySalesCardProps {
  summary: DailySalesSummary;
}

export function DailySalesCard({ summary }: DailySalesCardProps) {
  return (
    <Card className="border border-emerald-100 bg-emerald-50/60 p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-emerald-500">
            <TrendingUp size={18} color="#FFFFFF" />
          </View>
          <Text className="text-sm font-medium text-slate-600">Penjualan Hari Ini</Text>
        </View>
        <Badge variant="success" label="Hari Ini" />
      </View>

      {/* Main Stat: Total Sales */}
      <View className="mt-3">
        <PriceText amount={summary.totalSales} size="xl" color="success" />
      </View>

      {/* Divider */}
      <View className="my-3 h-px bg-emerald-100" />

      {/* Secondary Stats: Transactions & Items */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <ReceiptText size={16} color="#059669" />
          <Text className="text-xs text-slate-600">
            Transaksi: <Text className="font-semibold text-slate-800">{summary.transactionCount}</Text>
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <ShoppingBag size={16} color="#059669" />
          <Text className="text-xs text-slate-600">
            Produk Terjual: <Text className="font-semibold text-slate-800">{summary.itemCount} pcs</Text>
          </Text>
        </View>
      </View>
    </Card>
  );
}
