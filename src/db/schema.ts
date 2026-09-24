// Context7 expo-sqlite: execAsync for multi-statement DDL execution

export const CREATE_PRODUCTS_TABLE = `
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    buy_price   REAL    NOT NULL DEFAULT 0,
    sell_price  REAL    NOT NULL DEFAULT 0,
    stock       INTEGER NOT NULL DEFAULT 0,
    min_stock   INTEGER NOT NULL DEFAULT 0,
    barcode     TEXT,
    type        TEXT,
    image       TEXT,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`;

export const MIGRATE_V2_ADD_PRODUCT_COLUMNS = [
  `ALTER TABLE products ADD COLUMN barcode TEXT;`,
  `ALTER TABLE products ADD COLUMN type TEXT;`,
  `ALTER TABLE products ADD COLUMN image TEXT;`,
];

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
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_name   TEXT    NOT NULL,
    sell_price     REAL    NOT NULL,
    quantity       INTEGER NOT NULL,
    subtotal       REAL    NOT NULL
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
