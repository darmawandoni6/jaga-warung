import { Pressable, Text, View } from 'react-native';

import { useRouter } from 'expo-router';
import { AlertTriangle, CheckCircle2, ChevronRight, Package } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { StockAlertItem } from '@/types/dashboard';

export interface StockAlertCardProps {
  alerts: StockAlertItem[];
}

export function StockAlertCard({ alerts }: StockAlertCardProps) {
  const router = useRouter();

  if (alerts.length === 0) {
    return (
      <Card className="border border-slate-100 bg-white p-4">
        <View className="flex-row items-center gap-3">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={20} color="#059669" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-800">Semua Stok Aman</Text>
            <Text className="text-xs text-slate-500">Tidak ada produk yang berada di bawah stok minimum.</Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card className="border border-amber-200 bg-amber-50/50 p-4">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-amber-500">
            <AlertTriangle size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text className="text-sm font-semibold text-slate-800">Perhatian Stok Menipis</Text>
            <Text className="text-xs text-slate-500">{alerts.length} produk butuh restock segera</Text>
          </View>
        </View>
        <Badge variant="warning" label={`${alerts.length} Produk`} />
      </View>

      {/* Item List (up to 4 items) */}
      <View className="mt-3 divide-y divide-amber-100">
        {alerts.slice(0, 4).map(item => (
          <View key={item.id} className="flex-row items-center justify-between py-2">
            <View className="flex-1 pr-2">
              <Text className="text-xs font-medium text-slate-800" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-[11px] text-slate-500">
                Sisa: <Text className="font-semibold text-slate-700">{item.stock}</Text> (Min: {item.min_stock})
              </Text>
            </View>
            <Badge
              variant={item.status === 'empty' ? 'danger' : 'warning'}
              label={item.status === 'empty' ? 'Habis' : 'Menipis'}
            />
          </View>
        ))}
      </View>

      {/* Footer Link */}
      <Pressable
        onPress={() => router.push('/(tabs)/inventory')}
        accessibilityRole="button"
        className="mt-3 flex-row items-center justify-center gap-1 rounded-lg bg-amber-100/70 py-2 active:bg-amber-200"
      >
        <Package size={14} color="#B45309" />
        <Text className="text-xs font-semibold text-amber-800">Kelola Produk di Gudang</Text>
        <ChevronRight size={14} color="#B45309" />
      </Pressable>
    </Card>
  );
}
