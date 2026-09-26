import type { PeriodFilter, ReportPeriod } from '@/types/report';
import { formatDate } from '@/utils/date';

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function computePeriodFilter(period: ReportPeriod, offset: number): PeriodFilter {
  const now = new Date();

  if (period === 'week') {
    const day = now.getDay();
    // Monday is 1, Sunday is 0
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday + offset * 7);

    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6);

    const startDate = toIsoDate(monday);
    const endDate = toIsoDate(sunday);

    const label =
      offset === 0
        ? `Minggu Ini (${formatDate(monday)} - ${formatDate(sunday)})`
        : `${formatDate(monday)} - ${formatDate(sunday)}`;

    return { period, offset, startDate, endDate, label };
  }

  if (period === 'month') {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const firstDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const lastDay = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

    const startDate = toIsoDate(firstDay);
    const endDate = toIsoDate(lastDay);

    const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(targetMonth);
    const label = offset === 0 ? `Bulan Ini (${monthName})` : monthName;

    return { period, offset, startDate, endDate, label };
  }

  // year
  const targetYear = now.getFullYear() + offset;
  const startDate = `${targetYear}-01-01`;
  const endDate = `${targetYear}-12-31`;
  const label = offset === 0 ? `Tahun Ini (${targetYear})` : `Tahun ${targetYear}`;

  return { period, offset, startDate, endDate, label };
}
