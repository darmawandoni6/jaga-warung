import { useState } from 'react';

import { Alert, Text, View } from 'react-native';

import { useSQLiteContext } from 'expo-sqlite';
import { Database, Trash2 } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function DatabaseActionsCard() {
  const db = useSQLiteContext();
  const [isBusy, setIsBusy] = useState(false);

  const handleResetData = () => {
    Alert.alert(
      'Konfirmasi Reset Data',
      'Apakah Anda yakin ingin mereset data warung? Seluruh riwayat transaksi kasir, catatan kas, mutasi stok, dan utang pelanggan akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Reset Data',
          style: 'destructive',
          onPress: async () => {
            setIsBusy(true);
            try {
              await db.withTransactionAsync(async () => {
                await db.runAsync('DELETE FROM transaction_items');
                await db.runAsync('DELETE FROM transactions');
                await db.runAsync('DELETE FROM debt_payments');
                await db.runAsync('DELETE FROM debts');
                await db.runAsync('DELETE FROM stock_movements');
                await db.runAsync('DELETE FROM cash_flows');
              });
              Alert.alert('Sukses', 'Seluruh data operasional warung telah berhasil direset.');
            } catch (error) {
              console.error(error);
              Alert.alert('Gagal', 'Reset data gagal. Silakan coba lagi.');
            } finally {
              setIsBusy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Card className="border border-slate-100 bg-white p-4">
      {/* Header */}
      <View className="mb-2 flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-red-50">
          <Database size={15} color="#DC2626" />
        </View>
        <Text className="text-sm font-bold text-slate-800">Reset Data Warung</Text>
      </View>

      <Text className="mb-3.5 text-xs text-slate-500">
        Hapus seluruh catatan riwayat transaksi, arus kas, utang, dan mutasi stok untuk memulai pembukuan baru dari
        awal.
      </Text>

      {/* Single Reset Button */}
      <Button
        variant="danger"
        label={isBusy ? 'Mereset Data...' : 'Reset Data'}
        icon={isBusy ? undefined : <Trash2 size={16} color="#FFFFFF" />}
        onPress={handleResetData}
        size="sm"
        disabled={isBusy}
        fullWidth
      />
    </Card>
  );
}
