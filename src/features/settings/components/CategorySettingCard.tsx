import { Pressable, Text, View } from 'react-native';

import { type Href, useRouter } from 'expo-router';
import { ChevronRight, Tag } from 'lucide-react-native';

import { Card } from '@/components/ui/Card';

export function CategorySettingCard() {
  const router = useRouter();

  return (
    <Card className="border border-slate-100 bg-white p-4">
      <Pressable
        onPress={() => router.push('/(modals)/categories' as Href)}
        className="flex-row items-center justify-between active:opacity-75"
        accessibilityRole="button"
        accessibilityLabel="Kelola Kategori Produk"
      >
        <View className="flex-1 pr-3">
          <View className="mb-1 flex-row items-center gap-2">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
              <Tag size={15} color="#059669" />
            </View>
            <Text className="text-sm font-bold text-slate-800">Kategori Produk</Text>
          </View>
          <Text className="text-xs text-slate-500">
            Kelola dan kelompokkan produk warung agar transaksi di kasir lebih cepat dan tertata.
          </Text>
        </View>

        <View className="h-8 w-8 items-center justify-center rounded-full bg-slate-100">
          <ChevronRight size={18} color="#64748B" />
        </View>
      </Pressable>
    </Card>
  );
}
