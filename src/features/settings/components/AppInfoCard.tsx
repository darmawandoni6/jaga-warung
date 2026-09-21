import { Text, View } from 'react-native';

import Constants from 'expo-constants';
import { Info, ShieldCheck, Smartphone } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export function AppInfoCard() {
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Card className="border border-slate-100 bg-white p-4">
      {/* Header */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-slate-100">
            <Info size={15} color="#475569" />
          </View>
          <Text className="text-sm font-bold text-slate-800">Tentang Aplikasi</Text>
        </View>
        <Badge variant="neutral" label={`v${version}`} />
      </View>

      <View className="space-y-2">
        <View className="flex-row items-center justify-between border-b border-slate-50 py-1">
          <View className="flex-row items-center gap-1.5">
            <Smartphone size={14} color="#64748B" />
            <Text className="text-xs text-slate-600">Aplikasi</Text>
          </View>
          <Text className="text-xs font-semibold text-slate-800">Jaga Warung POS</Text>
        </View>

        <View className="flex-row items-center justify-between border-b border-slate-50 py-1">
          <View className="flex-row items-center gap-1.5">
            <ShieldCheck size={14} color="#64748B" />
            <Text className="text-xs text-slate-600">Tipe Penyimpanan</Text>
          </View>
          <Text className="text-xs font-semibold text-emerald-700">Offline-First (SQLite)</Text>
        </View>

        <View className="pt-2">
          <Text className="text-center text-[11px] text-slate-400">
            Dibuat untuk memudahkan pengelolaan kasir, inventaris toko, dan pencatatan utang warung Anda.
          </Text>
        </View>
      </View>
    </Card>
  );
}
