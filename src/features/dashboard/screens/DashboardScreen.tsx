import { useCallback } from 'react';

import { Pressable, ScrollView, Text, View } from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';
import { BookOpen, Settings, Store, Wallet } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { PriceText } from '@/components/ui/PriceText';
import { useAppStore } from '@/store/useAppStore';
import { formatDate } from '@/utils/date';

import { DailySalesCard } from '../components/DailySalesCard';
import { QuickActions } from '../components/QuickActions';
import { RecentTransactionsCard } from '../components/RecentTransactionsCard';
import { StockAlertCard } from '../components/StockAlertCard';
import { useDashboardData } from '../hooks/useDashboardData';

export function DashboardScreen() {
  const router = useRouter();
  const { metrics, isLoading, refetch } = useDashboardData();
  const storeName = useAppStore(s => s.storeProfile.name);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const todayFormatted = formatDate(new Date());

  if (isLoading) {
    return <LoadingScreen message="Memuat beranda..." />;
  }

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header Section */}
        <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-4 py-3.5">
          <View className="flex-1 pr-2">
            <View className="flex-row items-center gap-1.5">
              <Store size={16} color="#059669" />
              <Text className="text-base font-bold text-slate-800" numberOfLines={1}>
                {storeName}
              </Text>
            </View>
            <Text className="text-xs text-slate-500">{todayFormatted} • Selamat Berjualan</Text>
          </View>

          {/* Settings Icon Button */}
          <Pressable
            onPress={() => router.push('/(modals)/settings')}
            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
            accessibilityRole="button"
            accessibilityLabel="Pengaturan"
          >
            <Settings size={18} color="#334155" />
          </Pressable>
        </View>

        {/* Content Container */}
        <View className="space-y-4 px-4 pt-4">
          {/* 1. Daily Sales Summary */}
          <DailySalesCard summary={metrics.dailySales} />

          {/* 2. Stock Alerts */}
          <StockAlertCard alerts={metrics.stockAlerts} />

          {/* 3. Quick Actions */}
          <QuickActions />

          {/* 4. Financial Snapshot (Debts & Cash Flow) */}
          <View className="flex-row gap-3">
            {/* Active Debts Card */}
            <Pressable
              onPress={() => router.push('/(tabs)/debt')}
              accessibilityRole="button"
              className="flex-1 active:opacity-70"
            >
              <Card className="border border-slate-100 bg-white p-3">
                <View className="mb-1 flex-row items-center gap-1.5">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-amber-50">
                    <BookOpen size={13} color="#D97706" />
                  </View>
                  <Text className="text-[11px] font-medium text-slate-500">Piutang Aktif</Text>
                </View>
                <PriceText amount={metrics.activeDebtTotal} size="sm" color="warning" />
              </Card>
            </Pressable>

            {/* Cash Balance Card */}
            <Pressable
              onPress={() => router.push('/(tabs)/cash-flow')}
              accessibilityRole="button"
              className="flex-1 active:opacity-70"
            >
              <Card className="border border-slate-100 bg-white p-3">
                <View className="mb-1 flex-row items-center gap-1.5">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
                    <Wallet size={13} color="#059669" />
                  </View>
                  <Text className="text-[11px] font-medium text-slate-500">Saldo Kas</Text>
                </View>
                <PriceText amount={metrics.todayCashBalance} size="sm" color="success" />
              </Card>
            </Pressable>
          </View>

          {/* 5. Recent Transactions */}
          <RecentTransactionsCard transactions={metrics.recentTransactions} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
