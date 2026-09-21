import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';
import { BookOpen, Settings, Store, Wallet } from 'lucide-react-native';

import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Card } from '@/components/ui/Card';
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
  const metrics = useDashboardData();
  const storeName = useAppStore(s => s.storeProfile.name);

  const todayFormatted = formatDate(new Date());

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
          <TouchableOpacity
            onPress={() => router.push('/(modals)/settings')}
            className="h-9 w-9 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
            accessibilityLabel="Pengaturan"
          >
            <Settings size={18} color="#334155" />
          </TouchableOpacity>
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
            <TouchableOpacity onPress={() => router.push('/(tabs)/debt')} className="flex-1" activeOpacity={0.7}>
              <Card className="border border-slate-100 bg-white p-3">
                <View className="mb-1 flex-row items-center gap-1.5">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-amber-50">
                    <BookOpen size={13} color="#D97706" />
                  </View>
                  <Text className="text-[11px] font-medium text-slate-500">Piutang Aktif</Text>
                </View>
                <PriceText amount={metrics.activeDebtTotal} size="sm" color="warning" />
              </Card>
            </TouchableOpacity>

            {/* Cash Balance Card */}
            <TouchableOpacity onPress={() => router.push('/(tabs)/cash-flow')} className="flex-1" activeOpacity={0.7}>
              <Card className="border border-slate-100 bg-white p-3">
                <View className="mb-1 flex-row items-center gap-1.5">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
                    <Wallet size={13} color="#059669" />
                  </View>
                  <Text className="text-[11px] font-medium text-slate-500">Saldo Kas</Text>
                </View>
                <PriceText amount={metrics.todayCashBalance} size="sm" color="success" />
              </Card>
            </TouchableOpacity>
          </View>

          {/* 5. Recent Transactions */}
          <RecentTransactionsCard transactions={metrics.recentTransactions} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
