# Jaga Warung — TODO

> Full plan reference: `jaga-warung-pos-plan.md`
>
> **Working principles:**
> - Maximum **500 lines per file** (enforced by ESLint `max-lines`)
> - All UI atoms must come from `src/components/ui/` — no inline creation
> - Imports managed by `@trivago`, Tailwind classes sorted by `prettier-plugin-tailwindcss`
> - Every task must be verifiable before moving on to the next one

---

## Phase 1 — Project Setup

### TASK-01 · Install Dependencies
**Status:** `[x]`
**Files:** `package.json`

```bash
# Runtime
npx expo install expo-sqlite
yarn add zustand immer
yarn add nativewind tailwindcss
yarn add react-hook-form @hookform/resolvers zod
yarn add lucide-react-native react-native-svg

# Dev / Tooling
yarn add --dev eslint eslint-config-expo
yarn add --dev prettier @trivago/prettier-plugin-sort-imports prettier-plugin-tailwindcss
```

**Verify:** `yarn install` succeeds without errors, all packages present in `node_modules/`

---

### TASK-02 · Tooling Config Files
**Status:** `[x]`
**Files:**
- `eslint.config.js` [NEW]
- `.prettierrc` [NEW]
- `.prettierignore` [NEW]
- `babel.config.js` [MODIFY]
- `metro.config.js` [NEW]
- `tailwind.config.js` [NEW]
- `src/global.css` [MODIFY]
- `app.json` [MODIFY] → `userInterfaceStyle: "light"`
- `package.json` [MODIFY] → add lint, format, typecheck scripts

**Verify:**
```bash
yarn typecheck    # no errors
yarn lint         # no errors
yarn format:check # no errors
```

---

## Phase 2 — Foundation (Types · Utils · DB · Stores)

### TASK-03 · TypeScript Types
**Status:** `[x]`
**Files:**
- `src/types/product.ts` [NEW]
- `src/types/transaction.ts` [NEW]
- `src/types/debt.ts` [NEW]
- `src/types/cash-flow.ts` [NEW]

**Verify:** `yarn typecheck` clean, all interfaces exported correctly

---

### TASK-04 · Utility Functions
**Status:** `[x]`
**Files:**
- `src/utils/currency.ts` [NEW] → `formatRupiah()`
- `src/utils/date.ts` [NEW] → `formatDate()`, `formatRelative()`
- `src/utils/stock.ts` [NEW] → `getStockStatus()` → `'ok' | 'low' | 'empty'`

**Verify:** No duplicate formatting logic found in any component

---

### TASK-05 · Mock Data
**Status:** `[x]`
**Files:**
- `src/mocks/products.ts` [NEW]
- `src/mocks/debts.ts` [NEW]
- `src/mocks/transactions.ts` [NEW]
- `src/mocks/cash-flows.ts` [NEW]

**Example `src/mocks/products.ts`:**
```typescript
import type { Product } from '@/types/product';

export const MOCK_PRODUCTS: Product[] = [
  { id: 1, name: 'Indomie Goreng', buy_price: 2800, sell_price: 3500, stock: 50, min_stock: 10, created_at: '', updated_at: '' },
  { id: 2, name: 'Aqua 600ml', buy_price: 2000, sell_price: 2500, stock: 5, min_stock: 10, created_at: '', updated_at: '' },
  { id: 3, name: 'Teh Botol 350ml', buy_price: 3000, sell_price: 4000, stock: 0, min_stock: 5, created_at: '', updated_at: '' },
  { id: 4, name: 'Rokok Sampoerna', buy_price: 20000, sell_price: 23000, stock: 20, min_stock: 5, created_at: '', updated_at: '' },
  { id: 5, name: 'Kopi Sachet', buy_price: 1500, sell_price: 2000, stock: 100, min_stock: 20, created_at: '', updated_at: '' },
  { id: 6, name: 'Sabun Mandi Lifebuoy', buy_price: 3500, sell_price: 5000, stock: 8, min_stock: 5, created_at: '', updated_at: '' },
];
```

**Verify:** All mocks importable without type errors

---

### TASK-06 · Atomic UI Components
**Status:** `[x]`
**Files (all NEW):**
- `src/components/ui/Button.tsx` — variant: primary | secondary | danger | ghost
- `src/components/ui/Badge.tsx` — variant: success | warning | danger | neutral
- `src/components/ui/Card.tsx` — wrapper with shadow & border
- `src/components/ui/EmptyState.tsx` — emoji + title + subtitle
- `src/components/ui/SearchBar.tsx` — TextInput + Search icon
- `src/components/ui/QuantityControl.tsx` — Minus | qty | Plus
- `src/components/ui/PriceText.tsx` — formatted Rupiah + styling
- `src/components/ui/LoadingScreen.tsx` — full-screen ActivityIndicator
- `src/components/ui/index.ts` [NEW] — re-export all components
- `src/components/layout/ScreenContainer.tsx` — SafeAreaView + padding wrapper

**Verify:** No type errors, all components render independently

---

### TASK-07 · Zustand Stores
**Status:** `[x]`
**Files:**
- `src/store/useCartStore.ts` [NEW] — items, add/decrement/remove/clear, totalItems(), totalPrice()
- `src/store/useAppStore.ts` [NEW] — `isPrinterEnabled: false`

**Verify:** Store state accessible and mutable from a component

---

### TASK-08 · SQLite Schema & DatabaseProvider
**Status:** `[x]`
**Files:**
- `src/db/schema.ts` [NEW]
- `src/db/DatabaseProvider.tsx` [NEW]
- `src/app/_layout.tsx` [MODIFY] → wrap with `<DatabaseProvider>`

**Verify:** App runs, open SQLite inspector (Expo DevTools), verify 5 tables created:
`products`, `transactions`, `transaction_items`, `debts`, `cash_flows`

---

## Phase 3 — UI Slicing (Mock Data)

> All screens in this phase use data from `src/mocks/`.
> No SQLite connection yet. Goal: verify layout & interactions.

---

### TASK-09 · Tab Navigator & App Shell
**Status:** `[x]`
**Files:**
- `src/app/(tabs)/_layout.tsx` [NEW]
- `src/app/(tabs)/index.tsx` [NEW] → placeholder
- `src/app/(tabs)/inventory.tsx` [NEW] → placeholder
- `src/app/(tabs)/debt.tsx` [NEW] → placeholder
- `src/app/(tabs)/cash-flow.tsx` [NEW] → placeholder

**Tab bar config (5 tabs):**
```
Tab 1: index      → icon: LayoutDashboard → label: Beranda
Tab 2: pos        → icon: ShoppingCart    → label: Kasir
Tab 3: inventory  → icon: Package         → label: Produk
Tab 4: debt       → icon: BookOpen        → label: Utang
Tab 5: cash-flow  → icon: Wallet          → label: Kas
```

**Verify:** 5 tabs visible, navigation between tabs works, bottom tab bar renders correctly

---

### TASK-10 · [SLICE] POS Screen — Cashier
**Status:** `[x]`
**Files:**
- `src/features/pos/screens/POSScreen.tsx` [NEW/MODIFY]
- `src/features/pos/components/ProductCard.tsx` [NEW/MODIFY]
- `src/features/pos/components/CartItem.tsx` [NEW]
- `src/features/pos/components/CartSummary.tsx` [NEW/MODIFY]
- `src/features/pos/components/BarcodeScannerModal.tsx` [NEW]
- `src/utils/product.ts` [NEW] → `getProductAlias()`
- `src/app/(tabs)/pos.tsx` [NEW] → render `<POSScreen />`

**Behaviour with mock data:**
- 2-column grid displaying `MOCK_PRODUCTS` dengan foto produk atau avatar alias nama produk (maksimal 2 huruf)
- Setiap kartu menampilkan: foto/alias, nama produk, tipe/kategori, harga (`PriceText`), sisa stok (badge)
- Pencarian produk multi-mode: berdasarkan nama atau kode barcode
- Tombol Scan Barcode di samping SearchBar: membuka modal scan & input cepat barcode
- Jendela keranjang & checkout (`CartSummary`) **hanya muncul ketika ada produk di dalam keranjang** (`totalItems > 0`)
- Tap produk → masuk ke keranjang (Zustand)
- `+` / `-` buttons update qty via Zustand
- SearchBar memfilter produk lokal dari nama atau barcode

**Verify:**
- [x] Pencarian dengan barcode atau nama produk berfungsi
- [x] Kartu menampilkan gambar atau inisial alias max 2 huruf jika tanpa gambar
- [x] Kartu menampilkan type produk, harga, dan sisa stok
- [x] Jendela checkout (`CartSummary`) hanya tampil saat ada produk di keranjang
- [x] Tap produk menambah kuantitas di keranjang belanja
- [x] Modal scan barcode dapat digunakan untuk simulasi scan/tambah barang instan

---

### TASK-11 · [SLICE] Checkout Modal
**Status:** `[x]`
**Files:**
- `src/app/(modals)/checkout.tsx` [NEW]
- `src/features/pos/components/CheckoutSheet.tsx` [NEW]

**Behaviour:**
- `Pay` button in CartSummary → opens checkout modal
- Display summary: item list, total amount
- Payment amount input (numeric TextInput)
- Change calculated automatically as input changes
- `Confirm Transaction` button (disabled if payment < total)
- `Cancel` → closes modal, cart remains unchanged

**Verify:**
- [ ] Modal opens from Pay button
- [ ] Change = payment − total, updates in real-time
- [ ] Confirm is disabled when payment is insufficient
- [ ] Cancel → modal closes, cart unchanged

---

### TASK-12 · [SLICE] Inventory Screen — Products
**Status:** `[x]`
**Files:**
- `src/features/inventory/screens/InventoryScreen.tsx` [NEW]
- `src/features/inventory/components/ProductListItem.tsx` [NEW]
- `src/app/(tabs)/inventory.tsx` [MODIFY] → render `<InventoryScreen />`

**Behaviour with mock data:**
- List products from `MOCK_PRODUCTS`
- Each item: name, buy price, sell price, stock badge (ok/low/empty)
- SearchBar filters by product name
- FAB `+` button → navigate to add-product modal
- Edit button per item → navigate to add-product modal with product data

**Verify:**
- [x] All mock products display correctly
- [x] Badge colors accurate (green/yellow/red)
- [x] Search works
- [x] FAB `+` visible and tappable
- [x] EmptyState shown when search has no results

---

### TASK-13 · [SLICE] Add/Edit Product Modal
**Status:** `[x]`
**Files:**
- `src/app/(modals)/add-product.tsx` [NEW]
- `src/features/inventory/components/ProductForm.tsx` [NEW]

**Form fields (React Hook Form + Zod):**
```
Product Name    : string, min 2 characters
Buy Price       : number, min 0
Sell Price      : number, must be > buy price
Stock           : number, min 0
Minimum Stock   : number, min 0
```

**Behaviour:**
- Add mode: empty form
- Edit mode: form pre-filled with selected product data (via route params)
- Inline validation on blur or submit
- Submit → `console.log` data (no DB yet)

**Verify:**
- [x] Form opens in both add and edit mode
- [x] Error messages shown for invalid fields
- [x] Sell price < buy price → error "Sell price must be greater than buy price"
- [x] Valid submit → `console.log` correct data

---

### TASK-14 · [SLICE] Debt Screen — Customer Debts
**Status:** `[x]`
**Files:**
- `src/features/debt/screens/DebtScreen.tsx` [NEW]
- `src/features/debt/components/DebtCard.tsx` [NEW]
- `src/app/(tabs)/debt.tsx` [MODIFY] → render `<DebtScreen />`

**Mock data (`MOCK_DEBTS`):**
```typescript
{ id: 1, customer_name: 'Ibu Sari', phone: '08123456789', total_debt: 75000, paid_amount: 25000, status: 'partial', note: null, created_at: '', updated_at: '' },
{ id: 2, customer_name: 'Pak Budi', phone: null, total_debt: 50000, paid_amount: 0, status: 'active', note: null, created_at: '', updated_at: '' },
{ id: 3, customer_name: 'Anak Warung', phone: null, total_debt: 30000, paid_amount: 30000, status: 'paid', note: 'Paid on Sep 19', created_at: '', updated_at: '' },
{ id: 4, customer_name: 'Pak RT', phone: '08987654321', total_debt: 200000, paid_amount: 0, status: 'bad_debt', note: 'Has not paid for a long time', created_at: '', updated_at: '' },
```

**Behaviour:**
- List of DebtCards per customer
- Status badge: active=amber, partial=blue, paid=emerald, bad_debt=red
- Remaining debt = total_debt − paid_amount
- FAB `+` → add-debt modal
- Filter tabs: All | Active | Paid

**Verify:**
- [x] All mock debts displayed
- [x] Badge colors match status
- [x] Remaining debt calculated correctly
- [x] Filter tabs work locally (filtering mock array)

---

### TASK-15 · [SLICE] Add Debt Modal
**Status:** `[x]`
**Files:**
- `src/app/(modals)/add-debt.tsx` [NEW]
- `src/features/debt/components/DebtForm.tsx` [NEW]

**Form fields (React Hook Form + Zod):**
```
Customer Name   : string, min 2 characters
Phone Number    : string, optional
Debt Amount     : number, min 1000
Notes           : string, optional
```

**Verify:**
- [x] Validation works correctly
- [x] Valid submit → `console.log` data

---

### TASK-16 · [SLICE] Cash Flow Screen
**Status:** `[x]`
**Files:**
- `src/features/cash-flow/screens/CashFlowScreen.tsx` [NEW]
- `src/features/cash-flow/components/CashFlowItem.tsx` [NEW]
- `src/features/cash-flow/components/CashFlowSummary.tsx` [NEW]
- `src/app/(tabs)/cash-flow.tsx` [MODIFY] → render `<CashFlowScreen />`

**Mock data (`MOCK_CASH_FLOWS`):**
```typescript
{ id: 1, type: 'income',  amount: 500000, note: 'Initial capital', date: '2026-09-20', created_at: '' },
{ id: 2, type: 'expense', amount: 150000, note: 'Restock Indomie', date: '2026-09-20', created_at: '' },
{ id: 3, type: 'income',  amount: 75000,  note: 'Afternoon sales', date: '2026-09-19', created_at: '' },
{ id: 4, type: 'expense', amount: 25000,  note: 'Electricity', date: '2026-09-19', created_at: '' },
```

**Behaviour:**
- Summary card: Total In (emerald), Total Out (red), Balance (emerald/red)
- Cash transactions list grouped by date
- Badge income=emerald, expense=red
- FAB `+` → add cash flow input

**Verify:**
- [x] Summary card accurate (total in: 575k, out: 175k, balance: 400k)
- [x] List shows date groups
- [x] Badge colors match type
- [x] FAB tappable

---

### TASK-16A · [SLICE] Dashboard Screen — Beranda
**Status:** `[x]`
**Files:**
- `src/types/dashboard.ts` [NEW]
- `src/features/dashboard/components/DailySalesCard.tsx` [NEW]
- `src/features/dashboard/components/StockAlertCard.tsx` [NEW]
- `src/features/dashboard/components/QuickActions.tsx` [NEW]
- `src/features/dashboard/components/RecentTransactionsCard.tsx` [NEW]
- `src/features/dashboard/hooks/useDashboardData.ts` [NEW]
- `src/features/dashboard/screens/DashboardScreen.tsx` [NEW]
- `src/features/dashboard/index.ts` [NEW]
- `src/app/(tabs)/index.tsx` [MODIFY] → render `<DashboardScreen />`
- `src/app/(tabs)/pos.tsx` [NEW] → render `<POSScreen />`
- `src/app/(tabs)/_layout.tsx` [MODIFY] → 5 tabs config

**Behaviour:**
- Header: Sapaan warung, tanggal hari ini, dan tombol ⚙️ Pengaturan
- Daily Sales Card: Total omset hari ini (`formatRupiah`), counter jumlah transaksi
- Stock Alert Card: Daftar produk stok menipis (`low`) & habis (`empty`), badge warna, tombol lihat semua produk
- Quick Actions: Pintasan 1-tap ke Kasir, Tambah Produk, Catat Utang, dan Kas
- Recent Transactions: Riwayat 3 transaksi terakhir

**Verify:**
- [x] Ringkasan penjualan dan transaksi terhitung dari data mock
- [x] Alert stok menampilkan produk yang butuh restock
- [x] Tombol aksi cepat dapat diklik dan menavigasi ke halaman terkait
- [x] Tombol ⚙️ membuka halaman pengaturan

---

### TASK-16B · [SLICE] Settings Screen — Pengaturan
**Status:** `[x]`
**Files:**
- `src/types/settings.ts` [NEW]
- `src/store/useAppStore.ts` [MODIFY] → state storeProfile, lastBackupDate
- `src/features/settings/components/StoreProfileCard.tsx` [NEW]
- `src/features/settings/components/PrinterSettingCard.tsx` [NEW]
- `src/features/settings/components/BackupSettingCard.tsx` [NEW]
- `src/features/settings/components/DatabaseActionsCard.tsx` [NEW]
- `src/features/settings/components/AppInfoCard.tsx` [NEW]
- `src/features/settings/screens/SettingsScreen.tsx` [NEW]
- `src/features/settings/index.ts` [NEW]
- `src/app/(modals)/settings.tsx` [NEW] → render `<SettingsScreen />`

**Contents:**
- Profil Warung (nama warung, nomor kontak, alamat)
- Pengaturan Printer Bluetooth (toggle `isPrinterEnabled`)
- Pencadangan & Pemulihan (simulasi ekspor data, status backup terakhir)
- Manajemen Database (reset data dengan konfirmasi keamanan, muat data demo)
- Informasi Aplikasi (versi aplikasi via `expo-constants`, status offline SQLite)

**Verify:**
- [x] Edit nama warung ter-update di header Dashboard
- [x] Toggle printer berfungsi dan memperbarui state
- [x] Klik cadangkan data menampilkan konfirmasi dan mengupdate tanggal terakhir cadangan
- [x] Versi aplikasi tampil sesuai app.json

---

## Phase 4 — SQLite Integration

> Replace all mock data with real SQLite queries.
> Use `useSQLiteContext()` hook inside every repository.

---

### TASK-17 · Repository Layer
**Status:** `[ ]`
**Files:**
- `src/db/repositories/productRepository.ts` [NEW]
- `src/db/repositories/transactionRepository.ts` [NEW]
- `src/db/repositories/debtRepository.ts` [NEW]
- `src/db/repositories/cashFlowRepository.ts` [NEW]

**Each repository exposes:**
```typescript
// productRepository.ts (example)
export async function getAllProducts(db: SQLiteDatabase, search?: string): Promise<Product[]>
export async function getProductById(db: SQLiteDatabase, id: number): Promise<Product | null>
export async function createProduct(db: SQLiteDatabase, data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<number>
export async function updateProduct(db: SQLiteDatabase, id: number, data: Partial<Product>): Promise<void>
export async function updateStock(db: SQLiteDatabase, id: number, delta: number): Promise<void>
export async function deleteProduct(db: SQLiteDatabase, id: number): Promise<void>
```

**Verify:** Call functions directly from a debug component, inspect data in SQLite inspector

---

### TASK-18 · [INTEGRATE] POS — Products from SQLite
**Status:** `[ ]`
**Files:**
- `src/features/pos/hooks/useProducts.ts` [NEW]
- `src/features/pos/screens/POSScreen.tsx` [MODIFY] → replace `MOCK_PRODUCTS` with `useProducts(search)`

**Verify:**
- [ ] Manually insert product via SQLite inspector
- [ ] Product appears in POS grid
- [ ] Search query works against DB (LIKE)
- [ ] Loading state shown while query runs

---

### TASK-19 · [INTEGRATE] POS — Save Transaction to SQLite
**Status:** `[ ]`
**Files:**
- `src/features/pos/components/CheckoutSheet.tsx` [MODIFY]

**Flow on transaction confirm:**
1. Insert into `transactions` table → get `transaction_id`
2. Insert each cart item into `transaction_items` (loop)
3. Decrement product stock via `updateStock()`
4. Call `clearCart()` on Zustand store
5. Close modal, show success toast

**Verify:**
- [ ] Transaction saved in DB (check via inspector)
- [ ] Product stock decremented by purchased qty
- [ ] Cart cleared after transaction
- [ ] On error → transaction rolled back (`withTransactionAsync`)

---

### TASK-20 · [INTEGRATE] Inventory — Product CRUD via SQLite
**Status:** `[ ]`
**Files:**
- `src/features/inventory/hooks/useInventory.ts` [NEW]
- `src/features/inventory/screens/InventoryScreen.tsx` [MODIFY] → replace mock
- `src/features/inventory/components/ProductForm.tsx` [MODIFY] → submit to DB

**Verify:**
- [ ] Add new product → appears in list
- [ ] Edit product → data updated
- [ ] Delete product → removed from list
- [ ] Product linked to a transaction cannot be deleted (FK RESTRICT)

---

### TASK-21 · [INTEGRATE] Debt — Debt CRUD via SQLite
**Status:** `[ ]`
**Files:**
- `src/features/debt/hooks/useDebt.ts` [NEW]
- `src/features/debt/screens/DebtScreen.tsx` [MODIFY] → replace mock
- `src/features/debt/components/DebtForm.tsx` [MODIFY] → submit to DB

**Partial payment feature:**
- `Pay` button on DebtCard → input payment amount
- `paid_amount += amount`
- Recalculate status: `paid >= total` → `'paid'`, `paid > 0` → `'partial'`

**Verify:**
- [ ] Add debt → appears in list
- [ ] Partial payment → status changes to `partial`
- [ ] Full payment → status changes to `paid`

---

### TASK-22 · [INTEGRATE] Cash Flow — CRUD via SQLite
**Status:** `[ ]`
**Files:**
- `src/features/cash-flow/hooks/useCashFlow.ts` [NEW]
- `src/features/cash-flow/screens/CashFlowScreen.tsx` [MODIFY] → replace mock

**Verify:**
- [ ] Add income/expense → appears in list
- [ ] Summary card (total in, out, balance) accurate from DB
- [ ] Data grouped by date

---

## Phase 5 — Polish & QA

### TASK-23 · Transaction History
**Status:** `[ ]`
**Files:**
- `src/features/pos/screens/TransactionHistoryScreen.tsx` [NEW]
- `src/app/(modals)/transaction-history.tsx` [NEW]

**Verify:** Daily transaction list shows with item details per transaction

---

### TASK-24 · Settings Screen
**Status:** `[ ]`
**Files:**
- `src/features/settings/screens/SettingsScreen.tsx` [NEW]

**Contents:**
- Toggle `isPrinterEnabled` (from `useAppStore`)
- App version info (`expo-constants`)
- Reset database button (with confirmation dialog)

**Verify:** Toggle printer → print button appears/disappears in checkout modal

---

### TASK-25 · Final QA & Linting
**Status:** `[ ]`

```bash
yarn typecheck    # 0 errors
yarn lint         # 0 errors (including max-lines check)
yarn format       # auto-format all files
```

**Checklist:**
- [ ] No file exceeds 500 lines
- [ ] All imports sorted by `@trivago` (react → react-native → third-party → @/ → ./)
- [ ] All Tailwind classes sorted by `prettier-plugin-tailwindcss`
- [ ] No leftover `console.log` (except error handlers)
- [ ] All `// TODO` comments in code resolved

---

## Progress Tracker

| Phase | Task | Status |
|---|---|---|
| Setup | TASK-01 Install Dependencies | `[x]` |
| Setup | TASK-02 Tooling Config | `[x]` |
| Foundation | TASK-03 TypeScript Types | `[x]` |
| Foundation | TASK-04 Utility Functions | `[x]` |
| Foundation | TASK-05 Mock Data | `[x]` |
| Foundation | TASK-06 Atomic UI Components | `[x]` |
| Foundation | TASK-07 Zustand Stores | `[x]` |
| Foundation | TASK-08 SQLite Schema & Provider | `[x]` |
| UI Slice | TASK-09 Tab Navigator Shell | `[x]` |
| UI Slice | TASK-10 POS Screen (Cashier) | `[x]` |
| UI Slice | TASK-11 Checkout Modal | `[x]` |
| UI Slice | TASK-12 Inventory Screen | `[x]` |
| UI Slice | TASK-13 Add/Edit Product Modal | `[x]` |
| UI Slice | TASK-14 Debt Screen | `[x]` |
| UI Slice | TASK-15 Add Debt Modal | `[x]` |
| UI Slice | TASK-16 Cash Flow Screen | `[x]` |
| UI Slice | TASK-16A Dashboard Screen (Beranda) | `[x]` |
| UI Slice | TASK-16B Settings Screen (Pengaturan) | `[x]` |
| DB Integration | TASK-17 Repository Layer | `[ ]` |
| DB Integration | TASK-18 POS ↔ SQLite | `[ ]` |
| DB Integration | TASK-19 Transaction ↔ SQLite | `[ ]` |
| DB Integration | TASK-20 Inventory ↔ SQLite | `[ ]` |
| DB Integration | TASK-21 Debt ↔ SQLite | `[ ]` |
| DB Integration | TASK-22 Cash Flow ↔ SQLite | `[ ]` |
| Polish | TASK-23 Transaction History | `[ ]` |
| Polish | TASK-24 Settings Screen (DB Integration) | `[ ]` |
| Polish | TASK-25 Final QA & Linting | `[ ]` |
