import { Text, View } from 'react-native';

import { Award } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import type { TopProductItem } from '@/types/report';

export interface TopProductsCardProps {
  products: TopProductItem[];
}

export function TopProductsCard({ products }: TopProductsCardProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Card className="mb-4 border border-slate-100 bg-white p-4">
      {/* Header */}
      <View className="mb-3 flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-amber-50">
          <Award size={16} color="#D97706" />
        </View>
        <View>
          <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500">Produk Terlaris</Text>
          <Text className="text-[11px] text-slate-400">Paling banyak terjual pada periode ini</Text>
        </View>
      </View>

      {/* List */}
      <View className="divide-y divide-slate-100">
        {products.map((item, index) => {
          const rankColors = ['bg-amber-400 text-white', 'bg-slate-300 text-slate-800', 'bg-amber-600 text-white'];
          const badgeClass = rankColors[index] ?? 'bg-slate-100 text-slate-600';

          return (
            <View key={item.productBarcode} className="flex-row items-center justify-between py-2.5">
              <View className="flex-1 flex-row items-center gap-2.5 pr-2">
                <View className={`h-5 w-5 items-center justify-center rounded-full ${badgeClass}`}>
                  <Text className="text-[10px] font-bold">{index + 1}</Text>
                </View>

                <View className="flex-1">
                  <Text className="text-xs font-semibold text-slate-800" numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text className="text-[11px] text-slate-500">{item.quantity} pcs terjual</Text>
                </View>
              </View>

              <PriceText amount={item.totalSales} size="sm" color="default" bold />
            </View>
          );
        })}
      </View>
    </Card>
  );
}
