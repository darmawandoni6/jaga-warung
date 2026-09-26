import type { SQLiteDatabase } from 'expo-sqlite';

import type { CashFlowReportSummary, FinancialSummary, PeriodTimelineItem, TopProductItem } from '@/types/report';
import { formatDate } from '@/utils/date';

export async function getFinancialSummary(
  db: SQLiteDatabase,
  startDate: string,
  endDate: string,
): Promise<{ financial: FinancialSummary; cashFlow: CashFlowReportSummary }> {
  // 1. Total sales and transaction count
  const salesRow = await db.getFirstAsync<{ total_sales: number | null; tx_count: number }>(
    `SELECT
       SUM(total_amount) AS total_sales,
       COUNT(*) AS tx_count
     FROM transactions
     WHERE date(created_at) BETWEEN ? AND ?`,
    [startDate, endDate],
  );
  const totalSales = salesRow?.total_sales ?? 0;
  const transactionCount = salesRow?.tx_count ?? 0;

  // 2. Total HPP (Cost of Goods Sold)
  const hppRow = await db.getFirstAsync<{ total_hpp: number | null }>(
    `SELECT
       SUM(ti.quantity * COALESCE(p.buy_price, 0)) AS total_hpp
     FROM transaction_items ti
     JOIN transactions t ON ti.transaction_id = t.id
     LEFT JOIN products p ON ti.product_id = p.id
     WHERE date(t.created_at) BETWEEN ? AND ?`,
    [startDate, endDate],
  );
  const totalHpp = hppRow?.total_hpp ?? 0;
  const grossProfit = totalSales - totalHpp;

  // 3. Cash flow in, out, and operational expenses
  const cashRow = await db.getFirstAsync<{
    total_in: number | null;
    total_out: number | null;
    operational_expenses: number | null;
  }>(
    `SELECT
       SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_in,
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_out,
       SUM(CASE WHEN type = 'expense' AND (note IS NULL OR note NOT LIKE 'Kulakan%') THEN amount ELSE 0 END) AS operational_expenses
     FROM cash_flows
     WHERE date BETWEEN ? AND ?`,
    [startDate, endDate],
  );

  const totalIn = cashRow?.total_in ?? 0;
  const totalOut = cashRow?.total_out ?? 0;
  const operationalExpenses = cashRow?.operational_expenses ?? 0;

  const netProfit = grossProfit - operationalExpenses;
  const profitMargin = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

  return {
    financial: {
      totalSales,
      transactionCount,
      totalHpp,
      grossProfit,
      operationalExpenses,
      netProfit,
      profitMargin,
    },
    cashFlow: {
      totalIn,
      totalOut,
      balance: totalIn - totalOut,
    },
  };
}

export async function getTopProducts(
  db: SQLiteDatabase,
  startDate: string,
  endDate: string,
  limit = 5,
): Promise<TopProductItem[]> {
  const rows = await db.getAllAsync<{
    product_id: number;
    product_name: string;
    quantity: number;
    total_sales: number;
  }>(
    `SELECT
       ti.product_id,
       ti.product_name,
       SUM(ti.quantity) AS quantity,
       SUM(ti.subtotal) AS total_sales
     FROM transaction_items ti
     JOIN transactions t ON ti.transaction_id = t.id
     WHERE date(t.created_at) BETWEEN ? AND ?
     GROUP BY ti.product_id, ti.product_name
     ORDER BY quantity DESC, total_sales DESC
     LIMIT ?`,
    [startDate, endDate, limit],
  );

  return rows.map(r => ({
    productId: r.product_id,
    productName: r.product_name,
    quantity: r.quantity,
    totalSales: r.total_sales,
  }));
}

export async function getPeriodTimeline(
  db: SQLiteDatabase,
  startDate: string,
  endDate: string,
): Promise<PeriodTimelineItem[]> {
  const salesRows = await db.getAllAsync<{ tx_date: string; sales: number }>(
    `SELECT
       date(created_at) AS tx_date,
       SUM(total_amount) AS sales
     FROM transactions
     WHERE date(created_at) BETWEEN ? AND ?
     GROUP BY date(created_at)`,
    [startDate, endDate],
  );

  const expenseRows = await db.getAllAsync<{ cf_date: string; expense: number }>(
    `SELECT
       date AS cf_date,
       SUM(amount) AS expense
     FROM cash_flows
     WHERE type = 'expense' AND date BETWEEN ? AND ?
     GROUP BY date`,
    [startDate, endDate],
  );

  const map = new Map<string, { sales: number; expense: number }>();

  for (const s of salesRows) {
    map.set(s.tx_date, { sales: s.sales, expense: 0 });
  }

  for (const e of expenseRows) {
    const existing = map.get(e.cf_date) ?? { sales: 0, expense: 0 };
    existing.expense = e.expense;
    map.set(e.cf_date, existing);
  }

  const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));

  return sortedDates.map(d => ({
    date: d,
    label: formatDate(d),
    sales: map.get(d)?.sales ?? 0,
    expense: map.get(d)?.expense ?? 0,
  }));
}
