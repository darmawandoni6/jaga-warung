# Jaga Warung — Agent Rules

This document defines the rules that **MUST be followed** by every AI agent
working in this repository. Read the entire document before making any changes.

---

## 1. Core Principles

- **Always verify** every change before moving on to the next task
- **Never delete or modify** files unrelated to the active task
- **Ask first** if a task is ambiguous or two approaches are equally valid
- Full plan reference is in `jaga-warung-pos-plan.md`
- Task list is in `TODO.md`

---

## 2. File & Code Rules

### ❌ FORBIDDEN

- Creating files that **exceed 500 lines** (enforced via ESLint `max-lines`)
- Writing price, date, or stock formatting logic **inline** inside components — must use `src/utils/`
- Creating ad-hoc UI components used in more than 1 place — must go into `src/components/ui/`
- Using `any` as a TypeScript type — see full rules in section 2a
- Leaving `console.log` in production code (except in error handlers using `console.error`)
- Deleting existing comments or docstrings unless they are genuinely irrelevant
- Installing new dependencies not mentioned in the active task
- Using `cd` in the command line — use the `Cwd` parameter in the `run_command` tool instead

### ✅ REQUIRED

- All UI atoms (button, badge, card, etc.) must come from `src/components/ui/` — no inline duplicates
- Every new component must include a TypeScript interface for its props
- Use `import type` for type-only imports (`@typescript-eslint/consistent-type-imports`)
- All prices must be displayed via `<PriceText />` component or `formatRupiah()` function
- All stock statuses must be computed via `getStockStatus()` from `src/utils/stock.ts`

---

## 2a. TypeScript `any` Usage Policy

Using `any` is the **last resort** and requires explicit confirmation from the user.

### Solution hierarchy — try these in order before reaching for `any`

| Priority | Solution                  | Example                                         |
| -------- | ------------------------- | ----------------------------------------------- |
| 1        | Specific type             | `Product`, `Debt`, `CartItem`                   |
| 2        | Generic                   | `<T>`, `Array<T>`, `Promise<T>`                 |
| 3        | Union type                | `string \| number \| null`                      |
| 4        | `unknown`                 | Safer than `any`, forces type guard             |
| 5        | `Record<string, unknown>` | For objects with dynamic keys                   |
| 6        | Type assertion `as Type`  | Only if you are certain of the type             |
| **7**    | **`any`**                 | **❌ Only if all options above are not viable** |

### If `any` is truly unavoidable

1. **Stop** — do not write `any` immediately
2. **Explain** to the user why options 1–6 are not applicable
3. **Wait for confirmation** from the user before proceeding
4. If approved, add a comment explaining the reason above the line:

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// Reason: library X does not provide type definitions for this response
const response: any = await thirdPartyLib.call();
```

> **Note:** ESLint is configured with `@typescript-eslint/no-explicit-any: 'error'`.
> Any use of `any` **will cause lint to fail** unless accompanied by an `eslint-disable` comment with a clear reason.

---

## 3. Import Rules

Import order is managed automatically by `@trivago/prettier-plugin-sort-imports`.
Run `yarn format` after finishing writing code. The correct order is:

```
1. react / react-native
2. Third-party packages (expo, zustand, lucide, etc.)
3. Internal aliases (@/components, @/store, @/db, etc.)
4. Relative imports (./Component, ../hooks/useX)
```

Correct example:

```typescript
import { useState } from 'react';

import { Text, View } from 'react-native';

import { useSQLiteContext } from 'expo-sqlite';
import { ShoppingCart } from 'lucide-react-native';

import { Badge } from '@/components/ui/Badge';
import { useCartStore } from '@/store/useCartStore';

import { ProductCard } from './ProductCard';
```

---

## 4. Component Rules

### Atomic Components (`src/components/ui/`)

- Components here **must not know** about business domain (products, debts, transactions)
- Props must be generic and reusable (use `variant`, `size`, not `isProduct`)
- Must be renderable independently without any context

### Feature Components (`src/features/*/components/`)

- May access Zustand store and SQLite context
- Must use atomic components from `src/components/ui/` — no duplication allowed
- One component = one primary responsibility

### Screen Components (`src/features/*/screens/`)

- Act as **orchestrators only** — no business logic allowed here
- Data fetching is done through custom hooks in `src/features/*/hooks/`
- Render states: loading → `<LoadingScreen />`, empty → `<EmptyState />`, data → list/grid

---

## 5. Database Rules (SQLite)

- All SQL queries live in `src/db/repositories/` — **never** write SQL directly in components or hooks
- Always ensure `PRAGMA foreign_keys = ON` is active (already set in `DatabaseProvider`)
- Multi-step operations (insert + update stock) **must** use `withTransactionAsync` for atomicity
- PRAGMA settings must be executed **outside** of transactions (per Context7 expo-sqlite pattern)
- Use `useSQLiteContext()` only inside components wrapped by `<DatabaseProvider>`

---

## 6. State Management Rules (Zustand)

- Use `immer` middleware for all stores that need array/object mutation
- Computed values (total price, item count) are defined as **functions**, not plain state
- Do not duplicate state that already exists in SQLite into Zustand — Zustand is for UI state and cart only
- Access store with specific selectors: `useCartStore(s => s.addItem)` not `useCartStore()`

---

## 7. Styling Rules (NativeWind)

- No `StyleSheet.create()` — all styling via Tailwind className
- Color palette in use:

  | Usage                             | Tailwind Color            |
  | --------------------------------- | ------------------------- |
  | Main background                   | `bg-slate-50`             |
  | Main text                         | `text-slate-900`          |
  | Success / profit / primary button | `emerald-*`               |
  | Warning / low stock / debt        | `amber-*`                 |
  | Danger / bad debt / delete        | `red-*`                   |
  | Borders & secondary elements      | `slate-100` / `slate-200` |

- **No need** for `dark:` prefix — light mode only application
- Run `yarn format` so `prettier-plugin-tailwindcss` sorts classes automatically

---

## 8. Tooling Rules

### Commands Safe for Agent to Run

```bash
yarn install          # install dependencies
yarn typecheck        # check TypeScript
yarn lint             # check ESLint
yarn lint:fix         # auto-fix ESLint
yarn format           # auto-format with Prettier
yarn format:check     # check format without modifying files
expo start            # run dev server
```

### Commands the Agent MUST NOT Run

```bash
# Do not reset the project
node ./scripts/reset-project.js

# Do not directly drop/delete the database

# Do not push to git without user confirmation
git push

# Do not install dependencies not listed in the active task
yarn add <unknown-package>
```

### ⚠️ Git Commit — Confirmation Required

The agent **must not** run `git commit` without user confirmation.

Correct flow:

1. Complete the task & verify (`yarn typecheck`, `yarn lint`)
2. Show a summary of changed files (`git status`, `git diff --stat`)
3. **Ask the user**: are they ready to commit and what should the commit message be?
4. Only run `git add` and `git commit` after receiving explicit approval

```bash
# ✅ Allowed — for preview only
git status
git diff --stat

# ❌ Forbidden without confirmation
git commit -m "..."
git commit --amend
git push
git rebase
```

---

## 9. Verification Rules

After every task is complete, the agent **must** run:

```bash
yarn typecheck    # must return 0 errors
yarn lint         # must return 0 errors
```

If there are errors, **fix them first** before reporting the task as done.

---

## 10. Communication Rules

- Explicitly report every file that was created or modified
- If a design decision is unclear, ask the user before implementing
- Update task status in `TODO.md` from `[ ]` to `[x]` after the task is completed and verified
- If a task requires more than 500 lines in a single file, **split it into multiple files** and discuss the structure with the user first

---

## 11. Epistemic Rigor & Constructive Challenge Policy

- **No Immediate Agreement / Anti-Sycophancy:**
  When the user shares an idea, plan, strategy, opinion, draft, or decision, the agent's primary responsibility is to **challenge and stress-test it** before helping to refine it. Look for:
  - Weak or untested assumptions
  - Missing context or edge cases
  - Flawed or circular logic
  - Hidden architectural/UX/runtime risks
  - Wishful or overly optimistic thinking
  - Plausible-sounding ideas that are suboptimal or ineffective in practice.
- **Avoid Empty Validation:**
  - Do NOT open responses with "ide bagus", "itu masuk akal", "Anda benar", or similar hollow praise unless the idea has already been rigorously tested.
  - If an idea is weak, state it plainly and directly.
  - If an idea is strong, explain why with concrete evidence while still detailing trade-offs, constraints, and potential failure modes.
  - Deliver decision-ready critique, not polite consensus. Be precise and specific; never give vague or hand-waving warnings.
- **Direct, Concise, Practical:**
  The goal is to sharpen decision-making, not to validate feelings or maintain conversational pleasantries.
- **Epistemic Rigor & First-Principles Execution:**
  - Prioritize technical/operational truth over agreement.
  - Always evaluate and present more than one architectural/design path.
  - Trace decisions back to first principles (platform constraints, memory/render lifecycles, user friction).
  - Explicitly identify missing evidence, metrics, or benchmarks before adopting assumptions.
  - Calibrate assessment confidence numerically (e.g. `[Confidence: 85%]`) when recommending or critiquing architectural directions.
