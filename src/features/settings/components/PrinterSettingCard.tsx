import { Switch, Text, View } from 'react-native';

import { Printer } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';

export function PrinterSettingCard() {
  const isPrinterEnabled = useAppStore(s => s.isPrinterEnabled);
  const setPrinterEnabled = useAppStore(s => s.setPrinterEnabled);

  return (
    <Card className="border border-slate-100 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <View className="mb-1 flex-row items-center gap-2">
            <View className="h-7 w-7 items-center justify-center rounded-full bg-blue-50">
              <Printer size={15} color="#2563EB" />
            </View>
            <Text className="text-sm font-bold text-slate-800">Printer Bluetooth</Text>
            <Badge variant={isPrinterEnabled ? 'success' : 'neutral'} label={isPrinterEnabled ? 'Aktif' : 'Nonaktif'} />
          </View>
          <Text className="text-xs text-slate-500">
            Aktifkan untuk mencetak struk belanja secara otomatis setelah transaksi dikonfirmasi di kasir.
          </Text>
        </View>

        <Switch
          value={isPrinterEnabled}
          onValueChange={setPrinterEnabled}
          trackColor={{ false: '#E2E8F0', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>
    </Card>
  );
}
