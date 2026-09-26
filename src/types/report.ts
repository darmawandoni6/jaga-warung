export type ReportPeriod = 'week' | 'month' | 'year';

export interface PeriodFilter {
  period: ReportPeriod;
  offset: number;
  startDate: string;
  endDate: string;
  label: string;
}

export interface FinancialSummary {
  totalSales: number;
  transactionCount: number;
  totalHpp: number;
  grossProfit: number;
  operationalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export interface CashFlowReportSummary {
  totalIn: number;
  totalOut: number;
  balance: number;
}

export interface TopProductItem {
  productId: number;
  productName: string;
  quantity: number;
  totalSales: number;
}

export interface PeriodTimelineItem {
  date: string;
  label: string;
  sales: number;
  expense: number;
}

export interface FinancialReportData {
  period: PeriodFilter;
  financial: FinancialSummary;
  cashFlow: CashFlowReportSummary;
  topProducts: TopProductItem[];
  timeline: PeriodTimelineItem[];
}
