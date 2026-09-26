// Context7 expo-sqlite: execAsync for multi-statement DDL execution

export const CREATE_PRODUCTS_TABLE = `
  CREATE TABLE IF NOT EXISTS products (
    barcode     TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    buy_price   REAL NOT NULL DEFAULT 0,
    sell_price  REAL NOT NULL DEFAULT 0,
    stock       INTEGER NOT NULL DEFAULT 0,
    min_stock   INTEGER NOT NULL DEFAULT 0,
    type        TEXT,
    image       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

export const CREATE_TRANSACTIONS_TABLE = `
  CREATE TABLE IF NOT EXISTS transactions (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    total_amount   REAL    NOT NULL,
    payment_amount REAL    NOT NULL,
    change_amount  REAL    NOT NULL DEFAULT 0,
    note           TEXT,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

export const CREATE_TRANSACTION_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS transaction_items (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id  INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_barcode TEXT    NOT NULL REFERENCES products(barcode) ON DELETE RESTRICT,
    product_name    TEXT    NOT NULL,
    sell_price      REAL    NOT NULL,
    quantity        INTEGER NOT NULL,
    subtotal        REAL    NOT NULL
  );
`;

export const CREATE_DEBTS_TABLE = `
  CREATE TABLE IF NOT EXISTS debts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT    NOT NULL,
    phone         TEXT,
    total_debt    REAL    NOT NULL DEFAULT 0,
    paid_amount   REAL    NOT NULL DEFAULT 0,
    status        TEXT    NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'partial', 'paid', 'bad_debt')),
    note          TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

export const CREATE_CASH_FLOWS_TABLE = `
  CREATE TABLE IF NOT EXISTS cash_flows (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    type       TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
    amount     REAL    NOT NULL,
    note       TEXT    NOT NULL DEFAULT '',
    date       TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

export const CREATE_SETTINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS settings (
    key        TEXT PRIMARY KEY,
    value      TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

export const CREATE_CATEGORIES_TABLE = `
  CREATE TABLE IF NOT EXISTS categories (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

export const SEED_INITIAL_CATEGORIES = `
  INSERT OR IGNORE INTO categories (name) VALUES
    ('Makanan'),
    ('Minuman'),
    ('Sembako'),
    ('Rokok'),
    ('Lainnya');
`;

export const CREATE_STOCK_MOVEMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS stock_movements (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    product_barcode TEXT    NOT NULL REFERENCES products(barcode) ON DELETE CASCADE,
    type            TEXT    NOT NULL CHECK (type IN ('restock', 'sale', 'adjustment_loss', 'adjustment_gain')),
    quantity        INTEGER NOT NULL,
    previous_stock  INTEGER NOT NULL,
    final_stock     INTEGER NOT NULL,
    total_cost      REAL    DEFAULT 0,
    note            TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
  CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_barcode);
`;

export const CREATE_DEBT_PAYMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS debt_payments (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    debt_id    INTEGER NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
    amount     REAL    NOT NULL,
    note       TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
  CREATE INDEX IF NOT EXISTS idx_debt_payments_debt ON debt_payments(debt_id);
`;

