import type { SQLiteDatabase } from 'expo-sqlite';

import type { StoreProfile } from '@/types/settings';

/**
 * Dev-only seed data so the app doesn't look empty on first launch.
 *
 * Runs only when:
 *  - __DEV__ is true (dev builds only — never prod)
 *  - the `products` table is empty (idempotent: won't re-seed after user edits)
 *
 * Dates everything to "today" (local) so the dashboard's getDailySalesMetrics
 * (which filters on date(created_at) = date('now')) shows numbers immediately.
 */

// EAN-13-style barcodes (all start with 899 = Indonesia). Not real check-digit valid,
// but fine for a POS demo.
const PRODUCTS = [
  {
    barcode: '8990001000017',
    name: 'Aqua Botol 600ml',
    buy_price: 2500,
    sell_price: 4000,
    stock: 48,
    min_stock: 12,
    type: 'Minuman',
  },
  {
    barcode: '8990001000024',
    name: 'Teh Botol Sosro 350ml',
    buy_price: 3500,
    sell_price: 5000,
    stock: 24,
    min_stock: 10,
    type: 'Minuman',
  },
  {
    barcode: '8990001000031',
    name: 'Kopi Kapal Api Sachet',
    buy_price: 1200,
    sell_price: 2000,
    stock: 60,
    min_stock: 20,
    type: 'Minuman',
  },
  {
    barcode: '8990001000048',
    name: 'Indomie Goreng',
    buy_price: 2800,
    sell_price: 3500,
    stock: 80,
    min_stock: 24,
    type: 'Makanan',
  },
  {
    barcode: '8990001000055',
    name: 'Chitato Sapi Panggang',
    buy_price: 8500,
    sell_price: 11000,
    stock: 15,
    min_stock: 8,
    type: 'Makanan',
  },
  {
    barcode: '8990001000062',
    name: 'Beras Premium 5kg',
    buy_price: 62000,
    sell_price: 72000,
    stock: 10,
    min_stock: 5,
    type: 'Sembako',
  },
  {
    barcode: '8990001000079',
    name: 'Minyak Goreng 1L Bimoli',
    buy_price: 14000,
    sell_price: 16500,
    stock: 18,
    min_stock: 6,
    type: 'Sembako',
  },
  {
    barcode: '8990001000086',
    name: 'Gula Pasir 1kg',
    buy_price: 13000,
    sell_price: 15000,
    stock: 20,
    min_stock: 8,
    type: 'Sembako',
  },
  {
    barcode: '8990001000093',
    name: 'Sampo Sunsilk 170ml',
    buy_price: 9000,
    sell_price: 12000,
    stock: 14,
    min_stock: 6,
    type: 'Lainnya',
  },
  {
    barcode: '8990001000109',
    name: 'Sabun Lifebuoy',
    buy_price: 3000,
    sell_price: 4500,
    stock: 30,
    min_stock: 12,
    type: 'Lainnya',
  },
  {
    barcode: '8990001000116',
    name: 'Rokok Surya 16',
    buy_price: 30000,
    sell_price: 32000,
    stock: 25,
    min_stock: 10,
    type: 'Rokok',
  },
  {
    barcode: '8990001000123',
    name: 'Rokok Gudang Garam Surya 12',
    buy_price: 23000,
    sell_price: 25000,
    stock: 6,
    min_stock: 10,
    type: 'Rokok',
  }, // low stock
  {
    barcode: '8990001000130',
    name: 'Roti Tawar Sari Roti',
    buy_price: 12000,
    sell_price: 15000,
    stock: 8,
    min_stock: 5,
    type: 'Makanan',
  },
  {
    barcode: '8990001000147',
    name: 'Telur 1kg',
    buy_price: 24000,
    sell_price: 28000,
    stock: 12,
    min_stock: 6,
    type: 'Sembako',
  },
  {
    barcode: '8990001000154',
    name: 'Susu Ultra Coklat 250ml',
    buy_price: 4500,
    sell_price: 6000,
    stock: 36,
    min_stock: 12,
    type: 'Minuman',
  },
] as const;

const STORE_PROFILE: StoreProfile = {
  name: 'Warung Berkah Jaya',
  phone: '0812-3456-7890',
  address: 'Jl. Merdeka No. 12, Jakarta',
  receiptFooter: 'Terima kasih atas kunjungan Anda!',
};

type TransactionSeed = {
  items: { barcode: string; name: string; price: number; qty: number }[];
  payment: number; // cash paid by customer
  note?: string;
};

// 6 transactions spread across "today" — gives the dashboard life.
const TRANSACTIONS: TransactionSeed[] = [
  {
    items: [
      { barcode: '8990001000017', name: 'Aqua Botol 600ml', price: 4000, qty: 2 },
      { barcode: '8990001000048', name: 'Indomie Goreng', price: 3500, qty: 3 },
    ],
    payment: 20000,
    note: 'Bapak Budi',
  },
  {
    items: [
      { barcode: '8990001000154', name: 'Susu Ultra Coklat 250ml', price: 6000, qty: 2 },
      { barcode: '8990001000031', name: 'Kopi Kapal Api Sachet', price: 2000, qty: 2 },
    ],
    payment: 20000,
    note: 'Ibu Siti',
  },
  {
    items: [
      { barcode: '8990001000116', name: 'Rokok Surya 16', price: 32000, qty: 1 },
      { barcode: '8990001000017', name: 'Aqua Botol 600ml', price: 4000, qty: 1 },
    ],
    payment: 50000,
    note: 'Pak Dedi',
  },
  {
    items: [
      { barcode: '8990001000062', name: 'Beras Premium 5kg', price: 72000, qty: 1 },
      { barcode: '8990001000079', name: 'Minyak Goreng 1L Bimoli', price: 16500, qty: 1 },
    ],
    payment: 100000,
    note: 'Ibu Yuni',
  },
  {
    items: [
      { barcode: '8990001000109', name: 'Sabun Lifebuoy', price: 4500, qty: 3 },
      { barcode: '8990001000093', name: 'Sampo Sunsilk 170ml', price: 12000, qty: 1 },
    ],
    payment: 30000,
    note: 'Kak Rina',
  },
  {
    items: [
      { barcode: '8990001000055', name: 'Chitato Sapi Panggang', price: 11000, qty: 2 },
      { barcode: '8990001000154', name: 'Susu Ultra Coklat 250ml', price: 6000, qty: 1 },
    ],
    payment: 30000,
    note: 'Adit',
  },
];

// Standalone cash flows (not tied to a sale) — modal awal + a few expenses.
const CASH_FLOWS: { type: 'income' | 'expense'; amount: number; note: string }[] = [
  { type: 'income', amount: 500000, note: 'Modal awal kas' },
  { type: 'expense', amount: 50000, note: 'Bayar listrik' },
  { type: 'expense', amount: 15000, note: 'Belai pulsa' },
];

// Debts: one active, one partial, one paid — shows all 3 statuses in the UI.
const DEBTS: {
  customer_name: string;
  phone: string;
  total_debt: number;
  paid_amount: number;
  note?: string;
}[] = [
  {
    customer_name: 'Tukang Bakso',
    phone: '0813-1111-2222',
    total_debt: 45000,
    paid_amount: 0,
    note: 'Utang minggu lalu',
  },
  { customer_name: 'Pak Hans', phone: '0813-3333-4444', total_debt: 80000, paid_amount: 30000, note: 'Bayar sebagian' },
  { customer_name: 'Mbak Wati', phone: '0813-5555-6666', total_debt: 20000, paid_amount: 20000, note: 'Lunas' },
];

function fmtMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function seedDevData(db: SQLiteDatabase): Promise<void> {
  // Guard: only seed when the products table is empty (idempotent)
  const countRow = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) AS c FROM products');
  if (countRow && countRow.c > 0) return;

  await db.withTransactionAsync(async () => {
    // 1. Products
    for (const p of PRODUCTS) {
      await db.runAsync(
        `INSERT INTO products (barcode, name, buy_price, sell_price, stock, min_stock, type)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p.barcode, p.name, p.buy_price, p.sell_price, p.stock, p.min_stock, p.type],
      );
    }

    // 2. Transactions + items + stock movements (sale) + cash inflow
    //    Backdated to "today" using datetime('now','localtime') so the dashboard sees them.
    for (const t of TRANSACTIONS) {
      const total = t.items.reduce((s, it) => s + it.price * it.qty, 0);
      const change = Math.max(0, t.payment - total);

      const txRes = await db.runAsync(
        `INSERT INTO transactions (total_amount, payment_amount, change_amount, note, created_at)
         VALUES (?, ?, ?, ?, datetime('now', 'localtime'))`,
        [fmtMoney(total), fmtMoney(t.payment), fmtMoney(change), t.note ?? null],
      );
      const txId = txRes.lastInsertRowId as number;

      for (const it of t.items) {
        await db.runAsync(
          `INSERT INTO transaction_items (transaction_id, product_barcode, product_name, sell_price, quantity, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [txId, it.barcode, it.name, it.price, it.qty, fmtMoney(it.price * it.qty)],
        );

        // Decrement product stock + record a 'sale' stock movement
        const prod = await db.getFirstAsync<{ stock: number }>('SELECT stock FROM products WHERE barcode = ?', [
          it.barcode,
        ]);
        const prevStock = prod?.stock ?? 0;
        const finalStock = Math.max(0, prevStock - it.qty);
        await db.runAsync(
          `UPDATE products SET stock = ?, updated_at = datetime('now', 'localtime') WHERE barcode = ?`,
          [finalStock, it.barcode],
        );
        await db.runAsync(
          `INSERT INTO stock_movements (product_barcode, type, quantity, previous_stock, final_stock, note)
           VALUES (?, 'sale', ?, ?, ?, ?)`,
          [it.barcode, -it.qty, prevStock, finalStock, `Penjualan Kasir #${txId}`],
        );
      }

      // Auto cash inflow (mirrors saveTransaction's recordToCashFlow path)
      if (total > 0) {
        await db.runAsync(
          `INSERT INTO cash_flows (type, amount, note, date)
           VALUES ('income', ?, ?, date('now', 'localtime'))`,
          [fmtMoney(total), `Penjualan Kasir #${txId}`],
        );
      }
    }

    // 3. Standalone cash flows
    for (const cf of CASH_FLOWS) {
      await db.runAsync(
        `INSERT INTO cash_flows (type, amount, note, date)
         VALUES (?, ?, ?, date('now', 'localtime'))`,
        [cf.type, fmtMoney(cf.amount), cf.note],
      );
    }

    // 4. Debts (+ a payment log for the partial/paid ones to exercise that table)
    for (const d of DEBTS) {
      const status = d.paid_amount >= d.total_debt ? 'paid' : d.paid_amount > 0 ? 'partial' : 'active';
      const dRes = await db.runAsync(
        `INSERT INTO debts (customer_name, phone, total_debt, paid_amount, status, note)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [d.customer_name, d.phone, fmtMoney(d.total_debt), fmtMoney(d.paid_amount), status, d.note ?? null],
      );
      const debtId = dRes.lastInsertRowId as number;

      if (d.paid_amount > 0) {
        await db.runAsync(
          `INSERT INTO debt_payments (debt_id, amount, note)
           VALUES (?, ?, ?)`,
          [debtId, fmtMoney(d.paid_amount), 'Pembayaran awal'],
        );
        // Mirror addDebtPayment's cash flow income side-effect
        await db.runAsync(
          `INSERT INTO cash_flows (type, amount, note, date)
           VALUES ('income', ?, ?, date('now', 'localtime'))`,
          [fmtMoney(d.paid_amount), `Bayar utang: ${d.customer_name}`],
        );
      }
    }

    // 5. One restock movement to exercise that type (on the low-stock Rokok Gudang Garam)
    const restockBarcode = '8990001000123';
    const restockProd = await db.getFirstAsync<{ stock: number; buy_price: number; name: string }>(
      'SELECT stock, buy_price, name FROM products WHERE barcode = ?',
      [restockBarcode],
    );
    if (restockProd) {
      const prev = restockProd.stock;
      const qty = 10;
      const fin = prev + qty;
      const cost = qty * 23000;
      await db.runAsync(
        `UPDATE products SET stock = ?, buy_price = ?, updated_at = datetime('now', 'localtime') WHERE barcode = ?`,
        [fin, 23000, restockBarcode],
      );
      await db.runAsync(
        `INSERT INTO stock_movements (product_barcode, type, quantity, previous_stock, final_stock, total_cost, note)
         VALUES (?, 'restock', ?, ?, ?, ?, ?)`,
        [restockBarcode, qty, prev, fin, fmtMoney(cost), `Kulakan ${restockProd.name} (${qty} pcs)`],
      );
      // Kulakan also creates an expense cash flow (mirrors restockProduct recordToCashFlow)
      await db.runAsync(
        `INSERT INTO cash_flows (type, amount, note, date)
         VALUES ('expense', ?, ?, date('now', 'localtime'))`,
        [fmtMoney(cost), `Kulakan ${restockProd.name} (${qty} pcs)`],
      );
    }

    // 6. Settings: store profile + printer off (so SettingsHydrator finds real data)
    await db.runAsync(`INSERT INTO settings (key, value) VALUES (?, ?)`, [
      'store_profile',
      JSON.stringify(STORE_PROFILE),
    ]);
    await db.runAsync(`INSERT INTO settings (key, value) VALUES (?, ?)`, ['is_printer_enabled', '0']);
  });
}
