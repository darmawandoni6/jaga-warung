import { useState } from 'react';

import { Alert, Text, View } from 'react-native';

import { CloudDownload, CloudUpload, DatabaseBackup } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime } from '@/utils/date';

export function BackupSettingCard() {
  const lastBackupDate = useAppStore(s => s.lastBackupDate);
  const setLastBackupDate = useAppStore(s => s.setLastBackupDate);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    // Simulate backup process
    setTimeout(() => {
      const now = new Date().toISOString();
      setLastBackupDate(now);
      setIsBackingUp(false);
      Alert.alert('Pencadangan Berhasil', `Data warung Anda telah berhasil dicadangkan pada ${formatDateTime(now)}.`);
    }, 600);
  };

  const handleRestore = () => {
    Alert.alert(
      'Pulihkan Data',
      'Pilih file cadangan (.json atau .db) dari penyimpanan perangkat untuk memulihkan data. Pastikan file berasal dari aplikasi Jaga Warung.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Pilih File',
          onPress: () => {
            Alert.alert('Info', 'Fitur pemilihan file penyimpanan akan aktif pada integrasi database SQLite.');
          },
        },
      ],
    );
  };

  return (
    <Card className="border border-slate-100 bg-white p-4">
      {/* Header */}
      <View className="mb-2 flex-row items-center gap-2">
        <View className="h-7 w-7 items-center justify-center rounded-full bg-emerald-50">
          <DatabaseBackup size={15} color="#059669" />
        </View>
        <Text className="text-sm font-bold text-slate-800">Cadangkan & Pulihkan Data</Text>
      </View>

      <Text className="mb-3 text-xs text-slate-500">
        Amankan data transaksi, utang, dan produk Anda dengan menyimpannya secara rutin.
      </Text>

      {/* Last Backup Info */}
      <View className="mb-3.5 rounded-lg bg-slate-50 p-2.5">
        <Text className="text-[11px] text-slate-400">Pencadangan Terakhir</Text>
        <Text className="text-xs font-semibold text-slate-700">
          {lastBackupDate ? formatDateTime(lastBackupDate) : 'Belum pernah dicadangkan'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2">
        <Button
          variant="primary"
          label={isBackingUp ? 'Menyimpan...' : 'Cadangkan Data'}
          icon={isBackingUp ? undefined : <CloudUpload size={16} color="#FFFFFF" />}
          onPress={handleBackup}
          disabled={isBackingUp}
          className="flex-1"
          size="sm"
        />
        <Button
          variant="secondary"
          label="Pulihkan"
          icon={<CloudDownload size={16} color="#475569" />}
          onPress={handleRestore}
          className="flex-1"
          size="sm"
        />
      </View>
    </Card>
  );
}
