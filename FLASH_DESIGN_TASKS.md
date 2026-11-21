# Gemini Flash Design Handoff — BaseDoctor ("Precision Commerce Intelligence")

## 1. Existing Frontend Architecture Summary

- **Framework:** Next.js 14.2 (App Router, TypeScript, Tailwind CSS).
- **Design System Foundation:** Configured in `tailwind.config.ts`, `src/app/globals.css`, and documented in `DESIGN_SYSTEM.md`.
- **Reference Implementation Completed by Argon:**
  - `src/app/dashboard/page.tsx` — Flagship "Precision Commerce Intelligence" dashboard with 4-column KPI matrix, SVG trajectory & severity distribution chart, 4-domain health matrix, interactive Priority Issue Triage table, and historical audit log.
  - `src/components/AppSidebar.tsx` — Persistent left navigation sidebar (`252px` desktop, slide-over drawer on mobile) with active store context switcher, categorized nav groups, and AES-256-GCM / rate-limit telemetry box.
  - `src/components/Navbar.tsx` — Top navigation bar (currently hidden on `/dashboard` so `/dashboard` uses `AppSidebar`).

---

## 2. Screens Requiring Redesign by Gemini Flash

1. **Diagnostic Scan Report & Issue Details (`src/app/scans/[id]/page.tsx`)**
2. **Store Integration Management (`src/app/connections/page.tsx`)**
3. **Diagnostic Scan History (`src/app/scans/page.tsx`)**
4. **User Settings & Security Spec (`src/app/settings/page.tsx`)**
5. **Admin Management Portal (`src/app/admin/page.tsx`)**
6. **Authentication Screens (`src/app/login/page.tsx`, `src/app/register/page.tsx`)**
7. **Public Landing Page (`src/app/page.tsx`)**

---

## 3. Reusable Components & Layout Patterns to Apply

- **`AppSidebar` (`src/components/AppSidebar.tsx`):**
  - Wrap all authenticated workspace screens (`/connections`, `/scans`, `/scans/[id]`, `/settings`, `/admin`) in the same flex shell used in `src/app/dashboard/page.tsx`:
    ```tsx
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F7F4] text-[#111315]">
      <AppSidebar connectionsCount={...} activeStoreName={...} isDemo={...} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky 56px Top Header + Workspace Body */}
      </div>
    </div>
    ```
  - Update `src/components/Navbar.tsx` to return `null` on all authenticated routes (`/dashboard`, `/connections`, `/scans`, `/settings`, `/admin`) once they are wrapped with `AppSidebar`, keeping `Navbar.tsx` exclusively for the public landing page (`/`) or auth pages.
- **CSS Primitives from `src/app/globals.css`:**
  - Cards: `.pci-card`, `.pci-card-interactive`
  - Buttons: `.btn-primary-cobalt`, `.btn-primary-ink`, `.btn-secondary-surface`
  - Badges: `.badge-critical`, `.badge-warning`, `.badge-active`, `.badge-demo`, `.badge-neutral`
  - Typography: `.pci-eyebrow` for uppercase section labels; `font-mono tabular-nums` for all numbers, IDs, SKUs, scores, and dates.

---

## 4. Recommended Implementation Order (Small Independent Tasks)

### Task 1: Workspace Shell Migration & `src/app/scans/[id]/page.tsx` (Scan Detail Report)
- Wrap the scan report screen in the `AppSidebar` layout with a sticky top breadcrumb header (`Diagnostyka / Rejestr Audytów / Raport #ID`).
- Style the Health Score summary header, category score cards, segmented severity filter bar, and detailed issue cards using `.pci-card`, `#FAF9F6` sub-panels for business impact (`Konsekwencje Biznesowe`) and remediation steps (`Rekomendowane Rozwiązanie`), `.badge-demo` for `Auto-Fix API`, and `.btn-primary-cobalt` for PDF download.

### Task 2: Store Integration Management (`src/app/connections/page.tsx`)
- Wrap in the `AppSidebar` layout with top header (`Infrastruktura Danych / Integracje Base.com`).
- Style the connected stores table/list and the token connection form using `.pci-card`, `#FAF9F6` inputs with `focus:border-[#0052FF]`, step-by-step Base.com token retrieval instructions, and 1-click synthetic demo store loader.

### Task 3: Scan History (`src/app/scans/page.tsx`)
- Wrap in the `AppSidebar` layout (`Diagnostyka / Rejestr Audytów`).
- Convert the scan history list into a high-density `.pci-card` data table matching Row 4 of `src/app/dashboard/page.tsx` with monospace Health Score badges, entity counts (`productsScanned`, `ordersScanned`), severity breakdown, PDF download, and report links.

### Task 4: User Settings (`src/app/settings/page.tsx`) & Admin Portal (`src/app/admin/page.tsx`)
- Wrap both screens in the `AppSidebar` layout.
- Apply `.pci-card` panels, `#FAF9F6` table headers, monospace technical parameters (AES-256-GCM, 95 req/min rate limiter, tenant isolation table), and semantic role badges.
- Update `src/components/Navbar.tsx` so it renders only on `/`, `/login`, and `/register`.

### Task 5: Auth Screens (`src/app/login/page.tsx`, `src/app/register/page.tsx`) & Public Landing Page (`src/app/page.tsx`)
- Align background to `#F8F7F4`, cards to `.pci-card` (`#FFFFFF`, `border-[#E5E3DC]`), primary CTAs to `.btn-primary-cobalt` (`#0052FF`), and quick-fill test account buttons to `.btn-secondary-surface`.
- Ensure the Landing Page hero, interactive diagnostic preview widget, persona cards, and consultation form use the exact HEX tokens from `DESIGN_SYSTEM.md`.

---

## 5. Files That Must NOT Be Modified

Do **NOT** modify any backend, database, encryption, diagnostic engine, or test files:
- `src/app/api/**` (all API routes)
- `src/lib/**` (Base.com client, AES-256-GCM crypto, diagnostic engine, PDF generator, memory/Prisma store)
- `src/middleware.ts`
- `prisma/**`
- `src/test/**` and `**/*.test.ts`

---

## 6. Rules for Maintaining Design Consistency

1. **No Purple or Neon Gradients:** Never use `purple-*` or gradient backgrounds. Demo mode and technical badges must use Cobalt subtle (`#EDF2FF` bg, `#0040CC` text, `#C7D7FE` border via `.badge-demo`).
2. **Warm Alabaster Canvas:** Every page background must be `#F8F7F4` (`bg-[#F8F7F4]`), never cold slate or pure white.
3. **Tabular Monospace Numerals:** Every metric, percentage, SKU, EAN, Order ID, and date must use `font-mono tabular-nums`.
4. **1px Structural Hairlines:** All cards and tables use `border-[#E5E3DC]` with internal dividers in `border-[#EFECE6]`.

---

## 7. Functional & Visual Acceptance Criteria

- [ ] All authenticated pages use `AppSidebar` without duplicate top navbars.
- [ ] All existing API fetches, form submissions, demo store creation, scan execution, and PDF downloads work without regression.
- [ ] `npm test` passes (18/18 Vitest tests).
- [ ] `npm run build` succeeds with zero TypeScript or ESLint errors.
