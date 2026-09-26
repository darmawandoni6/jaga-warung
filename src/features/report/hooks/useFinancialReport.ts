import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import { getFinancialSummary, getPeriodTimeline, getTopProducts } from '@/db/repositories/reportRepository';
import type { FinancialReportData, ReportPeriod } from '@/types/report';

import { computePeriodFilter } from '../utils/reportDate';

export interface UseFinancialReportResult {
  data: FinancialReportData | null;
  period: ReportPeriod;
  offset: number;
  isLoading: boolean;
  setPeriod: (period: ReportPeriod) => void;
  prevPeriod: () => void;
  nextPeriod: () => void;
  resetCurrent: () => void;
  refetch: () => void;
}

export function useFinancialReport(initialPeriod: ReportPeriod = 'month'): UseFinancialReportResult {
  const db = useSQLiteContext();
  const [period, setPeriodState] = useState<ReportPeriod>(initialPeriod);
  const [offset, setOffset] = useState<number>(0);
  const [data, setData] = useState<FinancialReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const filter = useMemo(() => computePeriodFilter(period, offset), [period, offset]);

  const setPeriod = useCallback((newPeriod: ReportPeriod) => {
    setPeriodState(newPeriod);
    setOffset(0);
  }, []);

  const prevPeriod = useCallback(() => {
    setOffset(prev => prev - 1);
  }, []);

  const nextPeriod = useCallback(() => {
    setOffset(prev => Math.min(0, prev + 1));
  }, []);

  const resetCurrent = useCallback(() => {
    setOffset(0);
  }, []);

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      setIsLoading(true);
      try {
        const [{ financial, cashFlow }, topProducts, timeline] = await Promise.all([
          getFinancialSummary(db, filter.startDate, filter.endDate),
          getTopProducts(db, filter.startDate, filter.endDate, 5),
          getPeriodTimeline(db, filter.startDate, filter.endDate),
        ]);

        if (cancelled) return;

        setData({
          period: filter,
          financial,
          cashFlow,
          topProducts,
          timeline,
        });
      } catch (error) {
        console.error('Failed to load financial report:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      cancelled = true;
    };
  }, [db, filter, refreshKey]);

  return {
    data,
    period,
    offset,
    isLoading,
    setPeriod,
    prevPeriod,
    nextPeriod,
    resetCurrent,
    refetch,
  };
}
