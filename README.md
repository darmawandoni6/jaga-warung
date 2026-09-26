# Jaga Warung 🏪

Point of Sale (POS) and inventory management mobile application built for neighborhood grocery stores (*warung kelontong*). Designed with an offline-first architecture for fast, reliable daily operations.

## ✨ Features

- **POS/Kasir** — Fast product search (name/barcode), barcode scanner, real-time cart, checkout with change calculation
- **Inventory Management** — Product CRUD with barcode as primary key, category management, quick restock, stock adjustment, movement history
- **Debt Tracking** — Customer debt recording, partial/full payment, payment history with cash flow sync
- **Cash Flow** — Income/expense tracking with automatic sales and debt payment sync
- **Financial Reports** — Weekly, monthly, yearly analytics (revenue, COGS, gross profit, net profit, margin %)
- **Dashboard** — Daily sales summary, stock alerts, quick actions, recent transactions
- **Backup & Restore** — Full database export/import via JSON with native device sharing

---

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev) (React Native) with [Expo Router](https://docs.expo.dev/router/introduction)
- **Styling**: [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS) — light mode only with Slate netrals, Emerald (success/profit), Amber (warning/debt), and Red (overdue debt/danger)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with Immer middleware
- **Local Database**: [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) (offline-first, WAL mode, transaction-safe)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Icons**: [lucide-react-native](https://lucide.dev/)

---

## 📚 Documentation & Architecture

All architectural specifications, coding rules, and development tasks are documented in:

| Document | Purpose |
|---|---|
| [`jaga-warung-pos-plan.md`](./jaga-warung-pos-plan.md) | Architectural design, tech stack decisions, database design, and verification strategy |
| [`jaga-warung-pos-plan-code.md`](./jaga-warung-pos-plan-code.md) | Comprehensive code blueprints, schema DDL, stores, and reusable component references |
| [`TODO.md`](./TODO.md) | Step-by-step implementation roadmap (25 tasks across 5 phases) |
| [`AGENTS.md`](./AGENTS.md) | Mandatory engineering rules, file size limits (max 500 lines), import conventions, and safety policies |

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
yarn install
```

### 2. Start the development server

```bash
npx expo start
```

### 3. Verification commands

```bash
npx tsc --noEmit     # TypeScript typecheck
yarn lint            # ESLint checks (enforces max-lines: 500)
yarn format:check    # Prettier formatting check
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
