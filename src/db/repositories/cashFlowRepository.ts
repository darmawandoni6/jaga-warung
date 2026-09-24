import type { SQLiteDatabase } from 'expo-sqlite';

import type { CashFlow, CashFlowType } from '@/types/cash-flow';

export type CreateCashFlowData = Omit<CashFlow, 'id' | 'created_at'>;

export interface CashFlowSummary {
  totalIn: number;
  totalOut: number;
  balance: number;
}

export async function getAllCashFlows(db: SQLiteDatabase): Promise<CashFlow[]> {
  return db.getAllAsync<CashFlow>('SELECT * FROM cash_flows ORDER BY date DESC, created_at DESC');
}

export async function getCashFlowsByDate(db: SQLiteDatabase, date: string): Promise<CashFlow[]> {
  return db.getAllAsync<CashFlow>('SELECT * FROM cash_flows WHERE date = ? ORDER BY created_at DESC', [date]);
}

export async function getCashFlowSummary(db: SQLiteDatabase): Promise<CashFlowSummary> {
  const row = await db.getFirstAsync<{ total_in: number | null; total_out: number | null }>(
    `SELECT
       SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS total_in,
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_out
     FROM cash_flows`,
  );

  const totalIn = row?.total_in ?? 0;
  const totalOut = row?.total_out ?? 0;
  return { totalIn, totalOut, balance: totalIn - totalOut };
}

export async function createCashFlow(db: SQLiteDatabase, data: CreateCashFlowData): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO cash_flows (type, amount, note, date)
     VALUES (?, ?, ?, ?)`,
    [data.type, data.amount, data.note, data.date],
  );
  return result.lastInsertRowId;
}

export async function deleteCashFlow(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM cash_flows WHERE id = ?', [id]);
}

export type { CashFlowType };
