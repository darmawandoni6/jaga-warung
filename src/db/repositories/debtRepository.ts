import type { SQLiteDatabase } from 'expo-sqlite';

import type { Debt, DebtPayment, DebtStatus } from '@/types/debt';

import { CREATE_DEBT_PAYMENTS_TABLE } from '../schema';

export type CreateDebtData = Omit<Debt, 'id' | 'paid_amount' | 'status' | 'created_at' | 'updated_at'> & {
  paid_amount?: number;
  status?: DebtStatus;
};

export type DebtFilter = 'all' | DebtStatus;

function recalculateStatus(totalDebt: number, paidAmount: number): DebtStatus {
  if (paidAmount >= totalDebt) return 'paid';
  if (paidAmount > 0) return 'partial';
  return 'active';
}

export async function getAllDebts(db: SQLiteDatabase, filter: DebtFilter = 'all'): Promise<Debt[]> {
  if (filter === 'all') {
    return db.getAllAsync<Debt>('SELECT * FROM debts ORDER BY created_at DESC');
  }
  return db.getAllAsync<Debt>('SELECT * FROM debts WHERE status = ? ORDER BY created_at DESC', [filter]);
}

export async function getDebtById(db: SQLiteDatabase, id: number): Promise<Debt | null> {
  return db.getFirstAsync<Debt>('SELECT * FROM debts WHERE id = ?', [id]);
}

export async function createDebt(db: SQLiteDatabase, data: CreateDebtData): Promise<number> {
  const paidAmount = data.paid_amount ?? 0;
  const status = data.status ?? recalculateStatus(data.total_debt, paidAmount);

  const result = await db.runAsync(
    `INSERT INTO debts (customer_name, phone, total_debt, paid_amount, status, note)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.customer_name, data.phone ?? null, data.total_debt, paidAmount, status, data.note ?? null],
  );
  return result.lastInsertRowId;
}

export async function updateDebt(
  db: SQLiteDatabase,
  id: number,
  data: Partial<Omit<Debt, 'id' | 'created_at' | 'updated_at'>>,
): Promise<void> {
  const existing = await getDebtById(db, id);
  if (!existing) return;

  const totalDebt = data.total_debt ?? existing.total_debt;
  const paidAmount = data.paid_amount ?? existing.paid_amount;
  const status = data.status ?? recalculateStatus(totalDebt, paidAmount);

  await db.runAsync(
    `UPDATE debts
     SET customer_name = ?, phone = ?, total_debt = ?, paid_amount = ?, status = ?, note = ?,
         updated_at = datetime('now', 'localtime')
     WHERE id = ?`,
    [
      data.customer_name ?? existing.customer_name,
      data.phone !== undefined ? data.phone : existing.phone,
      totalDebt,
      paidAmount,
      status,
      data.note !== undefined ? data.note : existing.note,
      id,
    ],
  );
}

let debtPaymentsTableChecked = false;

async function ensureDebtPaymentsTable(db: SQLiteDatabase): Promise<void> {
  if (debtPaymentsTableChecked) return;
  await db.execAsync(CREATE_DEBT_PAYMENTS_TABLE);
  debtPaymentsTableChecked = true;
}

// Partial/full payment: paid_amount += amount, recalculate status, record payment log, and sync cash flow
export async function addDebtPayment(
  db: SQLiteDatabase,
  id: number,
  amount: number,
  note?: string | null,
): Promise<number> {
  await ensureDebtPaymentsTable(db);
  let paymentId = 0;
  await db.withTransactionAsync(async () => {
    const existing = await getDebtById(db, id);
    if (!existing) throw new Error(`Debt #${id} not found`);

    const newPaid = existing.paid_amount + amount;
    const newStatus = recalculateStatus(existing.total_debt, newPaid);

    await db.runAsync(
      `UPDATE debts
       SET paid_amount = ?, status = ?, updated_at = datetime('now', 'localtime')
       WHERE id = ?`,
      [newPaid, newStatus, id],
    );

    const insertPayment = await db.runAsync(
      `INSERT INTO debt_payments (debt_id, amount, note)
       VALUES (?, ?, ?)`,
      [id, amount, note ?? null],
    );
    paymentId = insertPayment.lastInsertRowId;

    // Record into cash_flows as income for accurate cash drawer tracking
    const cashFlowNote = note
      ? `Bayar utang: ${existing.customer_name} (${note})`
      : `Bayar utang: ${existing.customer_name}`;
    await db.runAsync(
      `INSERT INTO cash_flows (type, amount, note, date)
       VALUES ('income', ?, ?, date('now', 'localtime'))`,
      [amount, cashFlowNote],
    );
  });
  return paymentId;
}

export async function getDebtPayments(db: SQLiteDatabase, debtId: number): Promise<DebtPayment[]> {
  await ensureDebtPaymentsTable(db);
  return db.getAllAsync<DebtPayment>(
    'SELECT * FROM debt_payments WHERE debt_id = ? ORDER BY created_at DESC, id DESC',
    [debtId],
  );
}

export async function getActiveDebtTotal(db: SQLiteDatabase): Promise<number> {
  const row = await db.getFirstAsync<{ total: number | null }>(
    `SELECT COALESCE(SUM(total_debt - paid_amount), 0) AS total
     FROM debts
     WHERE status IN ('active', 'partial')`,
  );
  return row?.total ?? 0;
}

export async function deleteDebt(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM debts WHERE id = ?', [id]);
}
