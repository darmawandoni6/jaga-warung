import { useCallback } from 'react';

import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, RotateCw } from 'lucide-react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

import { CashFlowReportCard } from '../components/CashFlowReportCard';
import { FinancialSummaryCard } from '../components/FinancialSummaryCard';
import { PeriodTimelineCard } from '../components/PeriodTimelineCard';
import { ReportPeriodSelector } from '../components/ReportPeriodSelector';
import { TopProductsCard } from '../components/TopProductsCard';
import { useFinancialReport } from '../hooks/useFinancialReport';

export function FinancialReportScreen() {
  const router = useRouter();
  const { data, period, offset, isLoading, setPeriod, prevPeriod, nextPeriod, resetCurrent, refetch } =
    useFinancialReport('month');

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (isLoading && !data) {
    return <LoadingScreen message="Memuat laporan keuangan..." />;
  }

  const hasActivity =
    data &&
    (data.financial.totalSales > 0 ||
      data.cashFlow.totalIn > 0 ||
      data.cashFlow.totalOut > 0 ||
      data.topProducts.length > 0);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-4 pb-3 pt-14">
        <Pressable
          onPress={() => router.back()}
          className="rounded-full p-2 active:bg-slate-100"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Kembali"
        >
          <ArrowLeft size={22} color="#0F172A" />
        </Pressable>

        <Text className="text-lg font-bold text-slate-900">Laporan Keuangan</Text>

        <Pressable
          onPress={refetch}
          className="rounded-full p-2 active:bg-slate-100"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Muat Ulang"
        >
          <RotateCw size={18} color="#475569" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
      >
        {data && (
          <ReportPeriodSelector
            period={period}
            label={data.period.label}
            offset={offset}
            onPeriodChange={setPeriod}
            onPrev={prevPeriod}
            onNext={nextPeriod}
            onReset={resetCurrent}
          />
        )}

        {hasActivity && data ? (
          <>
            <FinancialSummaryCard summary={data.financial} />
            <CashFlowReportCard cashFlow={data.cashFlow} />
            <TopProductsCard products={data.topProducts} />
            <PeriodTimelineCard timeline={data.timeline} />
          </>
        ) : (
          <EmptyState
            emoji="📊"
            title="Belum Ada Transaksi"
            subtitle={`Tidak ada catatan penjualan atau arus kas pada ${data?.period.label ?? 'periode ini'}.`}
          />
        )}
      </ScrollView>
    </View>
  );
}
