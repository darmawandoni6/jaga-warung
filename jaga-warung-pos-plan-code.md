# Jaga Warung — POS Plan: Code Snippets & Examples

> This file contains all code examples referenced from [`jaga-warung-pos-plan.md`](./jaga-warung-pos-plan.md).

---

## Dependency Installation

```bash
# Core
npx expo install expo-sqlite

# State management
yarn add zustand immer

# Styling
yarn add nativewind tailwindcss

# Forms & Validation
yarn add react-hook-form @hookform/resolvers zod

# Icons
yarn add lucide-react-native react-native-svg

# Dev / Tooling
yarn add --dev eslint eslint-config-expo
yarn add --dev prettier @trivago/prettier-plugin-sort-imports prettier-plugin-tailwindcss
```

---

## ESLint + Prettier Setup

### [NEW] `.prettierrc`

```json
{
  "plugins": [
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss"
  ],
  "arrowParens": "avoid",
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 120,
  "endOfLine": "auto",
  "importOrder": [
    "^(react/(.*)$)|^(react$)",
    "^(react-native/(.*)$)|^(react-native$)",
    "<THIRD_PARTY_MODULES>",
    "^@/(.*)$",
    "^[./]"
  ],
  "importOrderSeparation": true,
  "importOrderSortSpecifiers": true
}
```

### [NEW] `.prettierignore`

```
node_modules/
.expo/
dist/
*.lock
```

### [NEW] `eslint.config.js`

```js
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    rules: {
      // === File Size — enforced at lint time ===
      'max-lines': ['error', {
        max: 500,
        skipBlankLines: true,
        skipComments: true,
      }],

      // === TypeScript ===
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // === React ===
      'react/self-closing-comp': 'warn',
    },
  },
  {
    ignores: ['node_modules/', '.expo/', 'dist/', '*.config.js'],
  },
]);
```

### [MODIFY] `package.json` — add scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,css}\"",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## NativeWind v4 Configuration

### [NEW] `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // All brand colors are available via Tailwind defaults:
      // slate-*, emerald-*, amber-*, red-*
      // Add semantic aliases if needed:
      colors: {
        brand: {
          bg: '#F8FAFC',       // slate-50
          text: '#0F172A',     // slate-900
          success: '#10B981',  // emerald-500
          warning: '#F59E0B',  // amber-500
          danger: '#EF4444',   // red-500
        },
      },
    },
  },
  plugins: [],
};
```

### [NEW] `metro.config.js`

```js
// Context7 NativeWind: must wrap with withNativewind
const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

module.exports = withNativewind(getDefaultConfig(__dirname), {
  input: './src/global.css',
});
```

### [MODIFY] `babel.config.js`

```js
module.exports = {
  presets: [
    ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
  ],
  plugins: ['react-native-reanimated/plugin'],
};
```

### [MODIFY] `src/global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-display: Spline Sans, Inter, ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  --font-rounded: 'SF Pro Rounded', 'Hiragino Maru Gothic ProN', sans-serif;
  --font-serif: Georgia, 'Times New Roman', serif;
}
```

---

## Reusable UI Components

### [NEW] `src/utils/currency.ts`
```typescript
// Used throughout the app — single source of truth for price formatting
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
}
```

### [NEW] `src/utils/stock.ts`
```typescript
export type StockStatus = 'ok' | 'low' | 'empty';

export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock === 0) return 'empty';
  if (stock <= minStock) return 'low';
  return 'ok';
}
```

### [NEW] `src/components/ui/Button.tsx`
```tsx
import { Pressable, Text, ActivityIndicator } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, { container: string; text: string }> = {
  primary:   { container: 'bg-emerald-500 active:bg-emerald-600', text: 'text-white' },
  secondary: { container: 'bg-slate-100 active:bg-slate-200',     text: 'text-slate-700' },
  danger:    { container: 'bg-red-500 active:bg-red-600',         text: 'text-white' },
  ghost:     { container: 'bg-transparent',                        text: 'text-slate-600' },
};

const SIZE_STYLES: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'px-3 py-1.5 rounded-lg',  text: 'text-sm' },
  md: { container: 'px-5 py-2.5 rounded-xl',  text: 'text-base' },
  lg: { container: 'px-6 py-3.5 rounded-xl',  text: 'text-lg' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
}: ButtonProps) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`
        flex-row items-center justify-center gap-2
        ${v.container} ${s.container}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
      `}
    >
      {loading && <ActivityIndicator size="small" color="white" />}
      <Text className={`font-semibold ${v.text} ${s.text}`}>{label}</Text>
    </Pressable>
  );
}
```

### [NEW] `src/components/ui/Badge.tsx`
```tsx
import { View, Text } from 'react-native';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
}

const BADGE_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  warning: { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  danger:  { bg: 'bg-red-100',     text: 'text-red-700'     },
  neutral: { bg: 'bg-slate-100',   text: 'text-slate-600'   },
  info:    { bg: 'bg-blue-100',    text: 'text-blue-700'    },
};

export function Badge({ label, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const style = BADGE_STYLES[variant];
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <View className={`px-2 py-0.5 rounded-full ${style.bg}`}>
      <Text className={`${textSize} font-medium ${style.text}`}>{label}</Text>
    </View>
  );
}
```

### [NEW] `src/components/ui/SearchBar.tsx`
```tsx
import { View, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-slate-100 rounded-xl px-3 py-2 gap-2">
      <Search size={18} color="#94A3B8" />
      <TextInput
        className="flex-1 text-slate-900 text-sm"
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}
```

### [NEW] `src/components/ui/QuantityControl.tsx`
```tsx
import { View, Text, Pressable } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

interface QuantityControlProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

export function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
  min = 0,
  max = 999,
}: QuantityControlProps) {
  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={onDecrement}
        disabled={quantity <= min}
        className="bg-slate-100 rounded-full p-1 active:bg-slate-200 disabled:opacity-40"
      >
        <Minus size={14} color="#475569" />
      </Pressable>

      <Text className="text-slate-900 font-bold w-6 text-center text-sm">
        {quantity}
      </Text>

      <Pressable
        onPress={onIncrement}
        disabled={quantity >= max}
        className="bg-emerald-100 rounded-full p-1 active:bg-emerald-200 disabled:opacity-40"
      >
        <Plus size={14} color="#059669" />
      </Pressable>
    </View>
  );
}
```

### [NEW] `src/components/ui/PriceText.tsx`
```tsx
import { Text } from 'react-native';

import { formatRupiah } from '@/utils/currency';

interface PriceTextProps {
  amount: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'success' | 'danger' | 'default';
  bold?: boolean;
}

const SIZE_MAP = { xs: 'text-xs', sm: 'text-sm', md: 'text-base', lg: 'text-lg', xl: 'text-xl' };
const COLOR_MAP = { success: 'text-emerald-600', danger: 'text-red-500', default: 'text-slate-900' };

export function PriceText({
  amount,
  size = 'md',
  color = 'default',
  bold = true,
}: PriceTextProps) {
  return (
    <Text className={`${SIZE_MAP[size]} ${COLOR_MAP[color]} ${bold ? 'font-bold' : ''}`}>
      {formatRupiah(amount)}
    </Text>
  );
}
```

### [NEW] `src/components/ui/EmptyState.tsx`
```tsx
import { View, Text } from 'react-native';

interface EmptyStateProps {
  emoji?: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ emoji = '📦', title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-2 p-8">
      <Text className="text-5xl">{emoji}</Text>
      <Text className="text-slate-700 font-semibold text-base text-center mt-1">{title}</Text>
      {subtitle && (
        <Text className="text-slate-400 text-sm text-center">{subtitle}</Text>
      )}
    </View>
  );
}
```

### [NEW] `src/components/ui/Card.tsx`
```tsx
import { View } from 'react-native';
import type { ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

export function Card({ children, className = '', elevated = false, ...props }: CardProps) {
  return (
    <View
      className={`
        bg-white rounded-xl border border-slate-100
        ${elevated ? 'shadow-sm shadow-slate-200' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </View>
  );
}
```

### [NEW] `src/components/ui/LoadingScreen.tsx`
```tsx
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3">
      <ActivityIndicator size="large" color="#10B981" />
      {message && <Text className="text-slate-400 text-sm">{message}</Text>}
    </View>
  );
}
```

---

## Database SQLite

### [NEW] `src/types/product.ts`
```typescript
export interface Product {
  id: number;
  name: string;
  buy_price: number;
  sell_price: number;
  stock: number;
  min_stock: number;
  created_at: string;
  updated_at: string;
}
```

### [NEW] `src/types/transaction.ts`
```typescript
export interface Transaction {
  id: number;
  total_amount: number;
  payment_amount: number;
  change_amount: number;
  note: string | null;
  created_at: string;
}

export interface TransactionItem {
  id: number;
  transaction_id: number;
  product_id: number;
  product_name: string;  // snapshot at time of transaction
  sell_price: number;    // snapshot at time of transaction
  quantity: number;
  subtotal: number;
}
```

### [NEW] `src/types/debt.ts`
```typescript
export type DebtStatus = 'active' | 'partial' | 'paid' | 'bad_debt';

export interface Debt {
  id: number;
  customer_name: string;
  phone: string | null;
  total_debt: number;
  paid_amount: number;
  status: DebtStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
}
```

### [NEW] `src/types/cash-flow.ts`
```typescript
export type CashFlowType = 'income' | 'expense';

export interface CashFlow {
  id: number;
  type: CashFlowType;
  amount: number;
  note: string;
  date: string;
  created_at: string;
}
```

### [NEW] `src/db/schema.ts`
```typescript
// Context7 expo-sqlite: execAsync for multi-statement DDL
export const CREATE_PRODUCTS_TABLE = `
  CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    buy_price   REAL    NOT NULL DEFAULT 0,
    sell_price  REAL    NOT NULL DEFAULT 0,
    stock       INTEGER NOT NULL DEFAULT 0,
    min_stock   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
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
```

### [NEW] `src/db/DatabaseProvider.tsx`
```tsx
// Context7 expo-sqlite SKILL.md:
// - PRAGMA outside transactions
// - Migrations inside withTransactionAsync
// - user_version for schema versioning
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import type { PropsWithChildren } from 'react';

import {
  CREATE_CASH_FLOWS_TABLE,
  CREATE_DEBTS_TABLE,
  CREATE_PRODUCTS_TABLE,
  CREATE_TRANSACTION_ITEMS_TABLE,
  CREATE_TRANSACTIONS_TABLE,
} from './schema';

const DB_NAME = 'jaga-warung.db';
const CURRENT_DB_VERSION = 1;

async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  // PRAGMA must be outside transactions (Context7 requirement)
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');

  if (result === null) throw new Error('Cannot read database schema version');
  if (result.user_version > CURRENT_DB_VERSION) {
    throw new Error(`DB schema v${result.user_version} is newer than app v${CURRENT_DB_VERSION}`);
  }
  if (result.user_version === CURRENT_DB_VERSION) return;

  await db.withTransactionAsync(async () => {
    if (result.user_version < 1) {
      await db.execAsync(CREATE_PRODUCTS_TABLE);
      await db.execAsync(CREATE_TRANSACTIONS_TABLE);
      await db.execAsync(CREATE_TRANSACTION_ITEMS_TABLE);
      await db.execAsync(CREATE_DEBTS_TABLE);
      await db.execAsync(CREATE_CASH_FLOWS_TABLE);
    }
    // v2 migration placeholder:
    // if (result.user_version < 2) { await db.execAsync('ALTER TABLE ...'); }
    await db.execAsync(`PRAGMA user_version = ${CURRENT_DB_VERSION}`);
  });
}

export function DatabaseProvider({ children }: PropsWithChildren) {
  return (
    <SQLiteProvider databaseName={DB_NAME} onInit={initializeDatabase}>
      {children}
    </SQLiteProvider>
  );
}
```

---

## Zustand Cart Store

### [NEW] `src/store/useCartStore.ts`
```typescript
// Context7 Zustand: create() + immer middleware for immutable mutations
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import type { Product } from '@/types/product';

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  totalItems: () => number;
  totalPrice: () => number;
  addItem: (product: Product) => void;
  decrementItem: (productId: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  immer((set, get) => ({
    items: [],

    totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: () => get().items.reduce((sum, item) => sum + item.subtotal, 0),

    addItem: (product) => {
      set((state) => {
        const existing = state.items.find((i) => i.product.id === product.id);
        if (existing) {
          existing.quantity += 1;
          existing.subtotal = existing.quantity * product.sell_price;
        } else {
          state.items.push({ product, quantity: 1, subtotal: product.sell_price });
        }
      });
    },

    decrementItem: (productId) => {
      set((state) => {
        const item = state.items.find((i) => i.product.id === productId);
        if (!item) return;
        if (item.quantity <= 1) {
          state.items = state.items.filter((i) => i.product.id !== productId);
        } else {
          item.quantity -= 1;
          item.subtotal = item.quantity * item.product.sell_price;
        }
      });
    },

    removeItem: (productId) => {
      set((state) => {
        state.items = state.items.filter((i) => i.product.id !== productId);
      });
    },

    updateQuantity: (productId, quantity) => {
      set((state) => {
        const item = state.items.find((i) => i.product.id === productId);
        if (!item) return;
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.product.id !== productId);
        } else {
          item.quantity = quantity;
          item.subtotal = quantity * item.product.sell_price;
        }
      });
    },

    clearCart: () => {
      set((state) => { state.items = []; });
    },
  }))
);
```

---

## Feature Components (POS)

### [NEW] `src/features/pos/hooks/useProducts.ts`
```typescript
import { useEffect, useState } from 'react';

import { useSQLiteContext } from 'expo-sqlite';

import type { Product } from '@/types/product';

export function useProducts(search: string = '') {
  const db = useSQLiteContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);

    const trimmed = search.trim();
    const query = trimmed
      ? 'SELECT * FROM products WHERE name LIKE ? ORDER BY name ASC'
      : 'SELECT * FROM products ORDER BY name ASC';
    const params = trimmed ? [`%${trimmed}%`] : [];

    db.getAllAsync<Product>(query, params)
      .then((rows) => { if (!cancelled) setProducts(rows); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [db, search]);

  return { products, isLoading };
}
```

### [NEW] `src/features/pos/components/ProductCard.tsx`
```tsx
// Uses atomic components: Card, Badge, PriceText, Button
// Max ~60 lines — well below the 500 limit
import { Pressable } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PriceText } from '@/components/ui/PriceText';
import { useCartStore } from '@/store/useCartStore';
import type { Product } from '@/types/product';
import { getStockStatus } from '@/utils/stock';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const stockStatus = getStockStatus(product.stock, product.min_stock);
  const isOutOfStock = stockStatus === 'empty';

  const badgeVariant = stockStatus === 'ok' ? 'neutral' : stockStatus === 'low' ? 'warning' : 'danger';

  return (
    <Pressable
      onPress={() => !isOutOfStock && addItem(product)}
      disabled={isOutOfStock}
      className={`flex-1 m-1.5 ${isOutOfStock ? 'opacity-40' : 'active:opacity-75'}`}
    >
      <Card className="p-3 gap-1.5">
        <PriceText amount={product.sell_price} size="sm" color="success" />
        <Badge label={`Stock: ${product.stock}`} variant={badgeVariant} />
        {stockStatus === 'low' && <AlertTriangle size={12} color="#F59E0B" />}
      </Card>
    </Pressable>
  );
}
```

### [NEW] `src/features/pos/components/CartItem.tsx`
```tsx
// Uses: QuantityControl, PriceText — lines < 50
import { View, Text, Pressable } from 'react-native';
import { Trash2 } from 'lucide-react-native';

import { PriceText } from '@/components/ui/PriceText';
import { QuantityControl } from '@/components/ui/QuantityControl';
import { useCartStore } from '@/store/useCartStore';
import type { CartItem as CartItemType } from '@/store/useCartStore';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { addItem, decrementItem, removeItem } = useCartStore();

  return (
    <View className="flex-row items-center py-2 border-b border-slate-50 gap-2">
      <Text className="flex-1 text-slate-800 text-sm" numberOfLines={1}>
        {item.product.name}
      </Text>
      <QuantityControl
        quantity={item.quantity}
        onIncrement={() => addItem(item.product)}
        onDecrement={() => decrementItem(item.product.id)}
      />
      <PriceText amount={item.subtotal} size="sm" />
      <Pressable onPress={() => removeItem(item.product.id)}>
        <Trash2 size={16} color="#EF4444" />
      </Pressable>
    </View>
  );
}
```

### [NEW] `src/features/pos/components/CartSummary.tsx`
```tsx
// Uses: CartItem, Button, PriceText — lines < 70
import { View, Text, FlatList } from 'react-native';

import { Button } from '@/components/ui/Button';
import { PriceText } from '@/components/ui/PriceText';
import { useCartStore } from '@/store/useCartStore';

import { CartItem } from './CartItem';

export function CartSummary() {
  const { items, totalPrice } = useCartStore();
  const isEmpty = items.length === 0;

  return (
    <View className="bg-white border-t border-slate-200 px-4 pt-3 pb-6">
      {!isEmpty && (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.product.id)}
          style={{ maxHeight: 200 }}
          renderItem={({ item }) => <CartItem item={item} />}
        />
      )}

      <View className="flex-row items-center justify-between mt-3">
        <View>
          <Text className="text-slate-500 text-xs">Total</Text>
          <PriceText amount={totalPrice()} size="xl" />
        </View>
        <Button
          label="Pay"
          onPress={() => { /* navigate to checkout modal */ }}
          variant="primary"
          size="lg"
          disabled={isEmpty}
        />
      </View>
    </View>
  );
}
```

### [NEW] `src/features/pos/screens/POSScreen.tsx`
```tsx
// Main cashier screen — delegates rendering to sub-components
// Uses: SearchBar, LoadingScreen, EmptyState, ProductCard, CartSummary
import { useState } from 'react';
import { FlatList, View, Text } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { SearchBar } from '@/components/ui/SearchBar';
import { useCartStore } from '@/store/useCartStore';

import { CartSummary } from '../components/CartSummary';
import { ProductCard } from '../components/ProductCard';
import { useProducts } from '../hooks/useProducts';

export function POSScreen() {
  const [search, setSearch] = useState('');
  const { products, isLoading } = useProducts(search);
  const totalItems = useCartStore((s) => s.totalItems());

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-4 pt-14 pb-3 border-b border-slate-100">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-slate-900 text-xl font-bold">🛒 Cashier</Text>
          {totalItems > 0 && (
            <View className="bg-emerald-500 px-3 py-1 rounded-full">
              <Text className="text-white text-sm font-semibold">{totalItems} item</Text>
            </View>
          )}
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." />
      </View>

      {/* Content */}
      {isLoading ? (
        <LoadingScreen message="Loading products..." />
      ) : products.length === 0 ? (
        <EmptyState
          emoji="🔍"
          title="No products found"
          subtitle={search ? `No results for "${search}"` : 'No products available yet'}
        />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerClassName="p-2 pb-4"
          renderItem={({ item }) => <ProductCard product={item} />}
        />
      )}

      {/* Cart (sticky bottom) */}
      <CartSummary />
    </View>
  );
}
```

---

## Root Layout Update

### [MODIFY] `src/app/_layout.tsx`
```tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { DatabaseProvider } from '@/db/DatabaseProvider';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* DatabaseProvider — ready before children render (Context7 expo-sqlite pattern) */}
      <DatabaseProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
      </DatabaseProvider>
    </ThemeProvider>
  );
}
```
