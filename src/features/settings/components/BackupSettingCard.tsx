import { useState } from 'react';

import { Alert, Text, View } from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useSQLiteContext } from 'expo-sqlite';
import { CloudDownload, CloudUpload, DatabaseBackup } from 'lucide-react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { type BackupDataV1, exportDatabaseBackup, restoreDatabaseBackup } from '@/db/repositories/backupRepository';
import { useAppStore } from '@/store/useAppStore';
import { formatDateTime } from '@/utils/date';

export function BackupSettingCard() {
  const db = useSQLiteContext();
  const lastBackupDate = useAppStore(s => s.lastBackupDate);
  const setLastBackupDate = useAppStore(s => s.setLastBackupDate);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const backupData = await exportDatabaseBackup(db);
      const jsonString = JSON.stringify(backupData, null, 2);

      const dateStr = new Date().toISOString().slice(0, 10);
      const fileName = `jaga-warung-backup-${dateStr}.json`;
      const filePath = `${FileSystem.cacheDirectory ?? ''}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: 'Simpan Cadangan Data Jaga Warung',
          UTI: 'public.json',
        });
      }

      const now = new Date().toISOString();
      setLastBackupDate(now);

      Alert.alert('Pencadangan Berhasil', `Data warung Anda telah berhasil diekspor pada ${formatDateTime(now)}.`);
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal Mencadangkan', 'Terjadi kesalahan saat mengekspor data.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/json', '*/*'],
        copyToCacheDirectory: true,
      });

      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        return;
      }

      const fileAsset = pickerResult.assets[0];
      setIsRestoring(true);

      const fileContent = await FileSystem.readAsStringAsync(fileAsset.uri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      let backupJson: BackupDataV1;
      try {
        backupJson = JSON.parse(fileContent) as BackupDataV1;
      } catch {
        Alert.alert('File Tidak Valid', 'Format file tidak terbaca sebagai JSON yang valid.');
        setIsRestoring(false);
        return;
      }

      if (backupJson.format !== 'jaga-warung-backup-v1' || !backupJson.data) {
        Alert.alert('Format Tidak Sesuai', 'File ini bukan merupakan file cadangan resmi dari aplikasi Jaga Warung.');
        setIsRestoring(false);
        return;
      }

      const exportTime = backupJson.exportedAt ? formatDateTime(backupJson.exportedAt) : 'tidak diketahui';

      Alert.alert(
        'Konfirmasi Pemulihan Data',
        `File cadangan dibuat pada: ${exportTime}.\n\nPERINGATAN: Seluruh data yang ada saat ini akan digantikan dengan data cadangan ini. Lanjutkan pemulihan?`,
        [
          {
            text: 'Batal',
            style: 'cancel',
            onPress: () => setIsRestoring(false),
          },
          {
            text: 'Ya, Pulihkan Data',
            style: 'destructive',
            onPress: async () => {
              try {
                await restoreDatabaseBackup(db, backupJson);
                Alert.alert('Sukses', 'Data warung Anda telah berhasil dipulihkan!');
              } catch (restoreError) {
                console.error(restoreError);
                Alert.alert('Gagal Memulihkan', 'Terjadi kesalahan saat memulihkan data ke database.');
              } finally {
                setIsRestoring(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat membaca file cadangan.');
      setIsRestoring(false);
    }
  };

  const isBusy = isBackingUp || isRestoring;

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
        Simpan salinan data warung Anda ke Google Drive, WhatsApp, atau folder ponsel untuk keamanan.
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
          label={isBackingUp ? 'Mengekspor...' : 'Cadangkan Data'}
          icon={isBackingUp ? undefined : <CloudUpload size={16} color="#FFFFFF" />}
          onPress={handleBackup}
          disabled={isBusy}
          className="flex-1"
          size="sm"
        />
        <Button
          variant="secondary"
          label={isRestoring ? 'Memproses...' : 'Pulihkan'}
          icon={isRestoring ? undefined : <CloudDownload size={16} color="#475569" />}
          onPress={handleRestore}
          disabled={isBusy}
          className="flex-1"
          size="sm"
        />
      </View>
    </Card>
  );
}
