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

export const MIGRATE_V7_PRODUCT_BARCODE_UNIQUE = [
  // Normalize empty strings → NULL
  `UPDATE products SET barcode = NULL WHERE barcode IS NOT NULL AND TRIM(barcode) = '';`,
  // Deduplicate: keep row with lowest id per barcode, nullify the rest
  `UPDATE products SET barcode = NULL WHERE barcode IS NOT NULL AND id NOT IN (
    SELECT MIN(id) FROM products WHERE barcode IS NOT NULL GROUP BY barcode
  );`,
  // Partial unique index: allows NULL and empty (no barcode) but prevents duplicate barcodes
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode) WHERE barcode IS NOT NULL;`,
];

export const MIGRATE_V8_BARCODE_PRIMARY_KEY = [
  // 1. Fill null or empty barcode with unique random barcode (format: 899 + random digits + id)
  `UPDATE products
   SET barcode = '899' || substr(abs(random()), 1, 9) || id
   WHERE barcode IS NULL OR TRIM(barcode) = '';`,

  // 2. Create products_v8 table with barcode as PRIMARY KEY (no id column)
  `CREATE TABLE products_v8 (
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
  );`,

  // 3. Copy data from products to products_v8
  `INSERT OR REPLACE INTO products_v8 (barcode, name, buy_price, sell_price, stock, min_stock, type, image, created_at, updated_at)
   SELECT barcode, name, buy_price, sell_price, stock, min_stock, type, image, created_at, updated_at
   FROM products;`,

  // 4. Create transaction_items_v8 referencing product_barcode
  `CREATE TABLE transaction_items_v8 (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id  INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    product_barcode TEXT    NOT NULL REFERENCES products_v8(barcode) ON DELETE RESTRICT,
    product_name    TEXT    NOT NULL,
    sell_price      REAL    NOT NULL,
    quantity        INTEGER NOT NULL,
    subtotal        REAL    NOT NULL
  );`,

  // 5. Migrate transaction_items mapping old product_id to barcode
  `INSERT INTO transaction_items_v8 (id, transaction_id, product_barcode, product_name, sell_price, quantity, subtotal)
   SELECT ti.id, ti.transaction_id, COALESCE(p.barcode, 'UNKNOWN_' || ti.product_id), ti.product_name, ti.sell_price, ti.quantity, ti.subtotal
   FROM transaction_items ti
   LEFT JOIN products p ON ti.product_id = p.id;`,

  // 6. Create stock_movements_v8 referencing product_barcode
  `CREATE TABLE stock_movements_v8 (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    product_barcode TEXT    NOT NULL REFERENCES products_v8(barcode) ON DELETE CASCADE,
    type            TEXT    NOT NULL CHECK (type IN ('restock', 'sale', 'adjustment_loss', 'adjustment_gain')),
    quantity        INTEGER NOT NULL,
    previous_stock  INTEGER NOT NULL,
    final_stock     INTEGER NOT NULL,
    total_cost      REAL    DEFAULT 0,
    note            TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
  );`,

  // 7. Migrate stock_movements mapping old product_id to barcode
  `INSERT INTO stock_movements_v8 (id, product_barcode, type, quantity, previous_stock, final_stock, total_cost, note, created_at)
   SELECT sm.id, COALESCE(p.barcode, 'UNKNOWN_' || sm.product_id), sm.type, sm.quantity, sm.previous_stock, sm.final_stock, sm.total_cost, sm.note, sm.created_at
   FROM stock_movements sm
   LEFT JOIN products p ON sm.product_id = p.id;`,

  // 8. Swap tables
  `DROP TABLE transaction_items;`,
  `ALTER TABLE transaction_items_v8 RENAME TO transaction_items;`,

  `DROP TABLE stock_movements;`,
  `ALTER TABLE stock_movements_v8 RENAME TO stock_movements;`,
  `CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_barcode);`,

  `DROP TABLE products;`,
  `ALTER TABLE products_v8 RENAME TO products;`,
];
