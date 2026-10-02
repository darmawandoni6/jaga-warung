# Jaga Warung — Agent Rules & Specification

Conformance to this specification is MANDATORY for all AI agents operating within this repository across all platforms (Antigravity, Cursor, Claude Code, GitHub Copilot, Roo Code).
All keywords (MUST, MUST NOT, REQUIRED, SHALL, SHALL NOT, SHOULD, SHOULD NOT, RECOMMENDED, MAY) are interpreted per RFC 2119.

---

## 1. Tech Stack Contract

Agents MUST adhere strictly to the active technology stack versions and APIs:
- **Runtime & Framework:** Expo (SDK 57, React Native 0.86, React 19, Expo Router)
- **Language:** TypeScript 6.0+ (Strict mode)
- **Styling:** NativeWind v4 (Tailwind CSS 3.4) — Light mode only
- **Local Database:** `expo-sqlite` (WAL mode, Foreign Keys enabled)
- **Client State:** Zustand v5 (with `immer` middleware)
- **Forms & Validation:** Zod v4 & React Hook Form (`@hookform/resolvers`)
- **Icons:** `lucide-react-native`
- **Linting & Formatting:** ESLint 9 (Flat config) & Prettier (sort-imports + tailwind plugins)

---

## 2. Behavioral Norms & Epistemic Rigor

- Agents MUST prioritize technical, architectural, and operational truth over user appeasement (Anti-Sycophancy).
- Agents MUST NOT provide empty, unearned validation before stress-testing plans and code.
- Agents MUST plainly and directly state technical critiques with supporting architectural rationale.
- Agents MUST evaluate at least two viable options for non-trivial architectural decisions.
- Agents SHOULD attach calibrated confidence ratings (e.g., `[Confidence: 90%]`) when recommending technical directions.

---

## 3. Architecture & Code Standards

### Layered Directory Boundaries
- `src/app/`: Navigation orchestrators and Expo Router routes only. No business logic.
- `src/components/ui/`: Pure domain-agnostic atomic UI components (Button, Input, Badge, Card, Modal). Zero domain logic.
- `src/features/<domain>/`: Feature-scoped components, hooks, and orchestration screens (`loading` → `empty` → `data`).
- `src/db/`: Database providers, schema definitions, seeders, and repositories.
- `src/store/`: Ephemeral and client-only UI state via Zustand.
- `src/utils/`: Pure utilities (formatting, calculations, helpers).
- `src/types/`: Shared TypeScript types and Zod schemas.

### TypeScript & Strict Type Safety
- The use of `any` is strictly FORBIDDEN.
- Type resolution MUST adhere to this strict hierarchy:
  1. Specific Domain Type / Zod Inferred Type (`z.infer<typeof schema>`).
  2. Generic Parameters (`<T>`, `Array<T>`, `Promise<T>`).
  3. Discriminated Union Types (`type State = { status: 'idle' } | { status: 'success'; data: T }`).
  4. `unknown` with Type Guards.
  5. `Record<string, unknown>`.
  6. Type Assertions (`as TargetType` / `satisfies`).
  7. `any` (Strict Last Resort): Requires stopping, explaining why tiers 1–6 failed, obtaining explicit user confirmation, and annotating with `// eslint-disable-next-line @typescript-eslint/no-explicit-any // Reason: <justification>`.
- Type-only imports MUST use `import type` (`@typescript-eslint/consistent-type-imports`).

### UI & Styling Standards (NativeWind)
- All styling MUST use Tailwind classes via NativeWind. Inline `StyleSheet.create()` MUST NOT be used.
- Palette Contract:
  - Background: `bg-slate-50` / `bg-white`
  - Text: `text-slate-900` (primary), `text-slate-500` (secondary)
  - Primary / Profit / Success: `emerald-*`
  - Warning / Low Stock / Pending Debt: `amber-*`
  - Danger / Bad Debt / Destructive Action: `red-*`
  - Borders & Dividers: `border-slate-100` / `border-slate-200`
- Dark mode variants (`dark:*`) MUST NOT be generated.
- Monetary values MUST be rendered via `<PriceText />` or `formatRupiah()`.
- Inventory stock statuses MUST be computed via `getStockStatus()` from `src/utils/stock.ts`.

### File Constraints & Import Order
- Files MUST NOT exceed 500 lines of code (enforced by ESLint `max-lines`).
- Imports MUST follow this order (enforced via Prettier):
  1. `react` and `react-native`
  2. Third-party dependencies (`expo-*`, `zustand`, `lucide-react-native`, etc.)
  3. Internal aliases (`@/components`, `@/features`, `@/db`, `@/store`, `@/utils`, `@/types`)
  4. Relative imports (`./Component`, `../hooks/useFeature`)

---

## 4. Data & State Management

### Database (SQLite via `expo-sqlite`)
- All database queries MUST be encapsulated in `src/db/repositories/`. Raw SQL in components or hooks is FORBIDDEN.
- `PRAGMA foreign_keys = ON;` and `PRAGMA journal_mode = WAL;` MUST be enabled.
- PRAGMA configurations MUST be executed outside transactions.
- Multi-step writes MUST be wrapped in `db.withTransactionAsync()`.
- `useSQLiteContext()` MUST only be used within components wrapped by `<DatabaseProvider>`.

### Client State (Zustand)
- Persistent business data MUST live in SQLite; Zustand MUST NOT duplicate database state.
- Stores mutating objects/arrays MUST use `immer` middleware.
- Computed metrics (e.g., cart total, counts) MUST be defined as getter functions or selectors, not state variables.
- Component consumers MUST subscribe using specific selectors (`const addItem = useCartStore((s) => s.addItem)`).

---

## 5. Tooling & Operational Guardrails

### Command Boundaries
- Agents MUST NOT execute directory changing commands (`cd`) via tool invocations; working directory MUST be specified via tool parameters (`Cwd`).
- Agents MUST NOT delete or overwrite configuration files (`babel.config.js`, `metro.config.js`, `eslint.config.js`, `app.json`).
- Agents MUST NOT install arbitrary dependencies not required for the active task.

### Permitted Commands
```bash
yarn typecheck        # Verify TypeScript compilation (0 errors required)
yarn lint             # Run ESLint validation
yarn lint:fix         # Auto-fix ESLint formatting & rules
yarn format           # Format code via Prettier
yarn format:check     # Check Prettier compliance without writing
expo start            # Start development server
```

### Prohibited Commands
```bash
node ./scripts/reset-project.js   # Destructive reset script
git push                          # Push without explicit user directive
git commit                        # Commit without explicit user approval
```

---

## 6. Verification, Error Recovery & Git Protocol

### 3-Gate Verification Pipeline
Before declaring any task complete, agents MUST execute and pass all 3 verification gates:
1. **Type Check:** `yarn typecheck` (MUST exit with 0 errors).
2. **Lint Check:** `yarn lint` (MUST exit with 0 errors/warnings).
3. **Format Check:** `yarn format:check` (MUST exit with 0 errors; run `yarn format` if needed).

### Self-Healing Error Recovery Protocol
When any verification gate fails:
1. **Inspect:** Analyze compiler or linter diagnostic traces to isolate the root cause.
2. **Resolve:** Apply targeted, minimal repairs without introducing side effects.
3. **Re-verify:** Re-run the full 3-gate pipeline from step 1.
4. **Report:** Document root cause and resolution to the user.

### Git Commit Protocol
Agents MUST NOT create git commits without explicit user confirmation.
- **Workflow:**
  1. Complete implementation and pass all 3 verification gates.
  2. Inspect modified files via `git status` and `git diff --stat`.
  3. Propose a structured Conventional Commit message: `<type>(<scope>): <imperative summary>`.
  4. Request explicit user confirmation before executing `git add` and `git commit`.
