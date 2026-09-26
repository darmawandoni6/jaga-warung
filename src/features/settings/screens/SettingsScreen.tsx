import { Pressable, ScrollView, Text, View } from 'react-native';

import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';

import { AppInfoCard } from '../components/AppInfoCard';
import { BackupSettingCard } from '../components/BackupSettingCard';
import { CategorySettingCard } from '../components/CategorySettingCard';
import { DatabaseActionsCard } from '../components/DatabaseActionsCard';
import { PrinterSettingCard } from '../components/PrinterSettingCard';
import { StoreProfileCard } from '../components/StoreProfileCard';

export function SettingsScreen() {
  const router = useRouter();

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center border-b border-slate-100 bg-white px-4 py-3.5">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <ArrowLeft size={18} color="#334155" />
        </Pressable>
        <Text className="text-base font-bold text-slate-800">Pengaturan</Text>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 px-4 pt-4"
      >
        <View className="space-y-4">
          {/* 1. Profil Warung */}
          <StoreProfileCard />

          {/* 2. Kategori Produk */}
          <CategorySettingCard />

          {/* 3. Pengaturan Printer */}
          <PrinterSettingCard />

          {/* 3. Pencadangan & Pemulihan */}
          <BackupSettingCard />

          {/* 4. Aksi Database */}
          <DatabaseActionsCard />

          {/* 5. Informasi Aplikasi */}
          <AppInfoCard />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
