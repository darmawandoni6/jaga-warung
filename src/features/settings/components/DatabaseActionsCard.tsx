import { Alert, Text, View } from 'react-native';

import { Database, RefreshCw, Trash2 } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function DatabaseActionsCard() {
  const handleResetData = () => {
    Alert.alert(
      'Konfirmasi Hapus Data',
      'Apakah Anda yakin ingin menghapus semua riwayat transaksi? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Hapus',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Sukses', 'Riwayat transaksi telah direset.');
          },
        },
      ],
    );
  };

  const handleSeedDemo = () => {
    Alert.alert(
      'Muat Data Contoh',
      'Data contoh produk, utang pelanggan, dan transaksi akan dimuat ulang ke aplikasi.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Muat Data',
          onPress: () => {
            Alert.alert('Sukses', 'Data contoh berhasil dimuat ulang.');
          },
        },
      ],
    );
  };

  return (
    <Card className="border border-slate-100 bg-white p-4">
      {/* Header */}
      <View className="mb-2 flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-slate-100">
          <Database size={15} color="#475569" />
        </View>
        <Text className="text-sm font-bold text-slate-800">Manajemen Database</Text>
      </View>

      <Text className="mb-3.5 text-xs text-slate-500">
        Kelola penyimpanan data lokal atau muat data simulasi untuk keperluan uji coba.
      </Text>

      {/* Buttons */}
      <View className="space-y-2">
        <Button
          variant="secondary"
          label="Muat Ulang Data Contoh"
          icon={<RefreshCw size={15} color="#475569" />}
          onPress={handleSeedDemo}
          size="sm"
        />

        <Button
          variant="danger"
          label="Reset Riwayat Transaksi"
          icon={<Trash2 size={15} color="#FFFFFF" />}
          onPress={handleResetData}
          size="sm"
        />
      </View>
    </Card>
  );
}
