# BaseDoctor — Project State & Architectural Summary

**Last Updated:** 2026-11-21  
**Project:** BaseDoctor (Commercial SaaS Diagnostic Platform for E-commerce & Base.com)  
**Status:** Production Ready — Complete "Precision Commerce Intelligence" UI/UX Implementation  
**Design System:** PCI-2.4 (Linear precision, Vercel typography, Stripe high-density telemetry)  
**Tests:** 18/18 Vitest passing | Next.js 14 Production Build passing (Exit code: 0)  
**Deployments:** Vercel Production (`https://basedoctor.vercel.app` & `https://basedoctor-milan-a45c.vercel.app`)

---

## 1. Executive Overview
BaseDoctor is a commercial SaaS diagnostic platform for online stores and agencies operating on Base.com (BaseLinker). It connects via the official Base.com connector API (`connector.php`) using a strict **Read-Only** model to identify product/SKU catalog discrepancies, multi-warehouse inventory desynchronization, and order fulfillment/payment risks without making destructive changes.

The application has been unified under the **"Precision Commerce Intelligence" (PCI-2.4)** visual standard:
- Warm architectural surfaces (`#F8F7F4` canvas, `#F4F2ED` sidebar, `#FFFFFF` cards).
- Deep charcoal ink typography (`#111315`, `#373B40`, `#5C6168`).
- Cobalt blue interactive focus (`#0052FF`, `#0040CC`).
- Persistent left navigation sidebar (`AppSidebar`, 252px) across all workspace views with real-time target store context (`READ-ONLY` / `DEMO`) and cryptographic telemetry (AES-256-GCM, 95 req/min limiter).
- High-density monospace tabular numerals (`font-mono tabular-nums`) across all metrics, IDs, SKUs, and durations.

---

## 2. Customer Journey & Core Modules

### 2.1 Complete Customer Flow
1. **User Registration & Login:** Email/password registration with salted bcrypt hash (cost 10), stateless HTTP-only JWT session cookies (`jose`, HS256), and Next.js Edge Middleware route guarding. Includes 1-click test credential auto-fill (`jan@twojsklep.pl` or `admin@basedoctor.pl`).
2. **Persistent Workspace & Navigation Shell:** Unified `AppSidebar` layout across `/dashboard`, `/connections`, `/scans`, `/scans/[id]`, `/settings`, and `/admin`. Clean separation from public marketing and auth headers.
3. **Secure Connection Management:** Customer connects their Base.com token via `/connections`. The token is immediately encrypted with authenticated symmetric AES-256-GCM.
4. **Step-by-Step Onboarding:** Visual guidance inside the connection view showing how to retrieve the API token from BaseLinker (`Konto -> Moje konto -> API`) with read-only permissions.
5. **Demonstration Mode:** 1-click "Załaduj Sklep Demonstracyjny" creates an isolated demo store with realistic synthetic fixtures, clearly tagged `[DEMO • SYNTETYCZNE]`.
6. **Deterministic Diagnostics:** Evaluates 15 deterministic diagnostic rules across Products, Inventory, and Orders with rate-limit protection (95 req/min) and paginated chunking (100 IDs/call).
7. **Commercial Value & Health Score:** Clear score (0–100%) and issue cards enriched with business impact (`businessImpact`), suggested fix (`suggestedFix`), auto-repair feasibility (`canAutoFix`), and repair duration estimates (`estimatedFixTime`).
8. **Priority Issue Triage:** Actionable issue inspection directly from the main dashboard with severity filtering and live search.
9. **Official PDF Export:** Professional server-side generated A4 PDF report with corporate branding, category summaries, and full issue register.
10. **Diagnostic History & Isolation:** Scans and connections are strictly scoped to the authenticated tenant (anti-IDOR protection).
11. **User Settings & Security Spec:** Dedicated settings page with tenant profile, AES-256-GCM technical specifications, API rate limiter parameters, and alert notification preferences.
12. **Admin Dashboard:** High-level tenant oversight, encrypted credential counts, platform scan activity, and role segregation.
13. **Landing Page:** High-contrast SaaS presentation with hero, live interactive issue inspector widget, persona cards, and consultation lead capture.

---

## 3. Design System & UI/UX Standards (PCI-2.4)

- **Color Tokens:** Canvas `#F8F7F4`, Sidebar `#F4F2ED`, Surface `#FFFFFF`, Hairline Borders `#E5E3DC`, Internal Lines `#EFECE6`, Cobalt `#0052FF`.
- **Components:** `.pci-card`, `.pci-card-interactive`, `.pci-eyebrow`, `.btn-primary-cobalt`, `.btn-primary-ink`, `.btn-secondary-surface`.
- **Badges:** `.badge-critical` (P1), `.badge-warning` (P2), `.badge-active` (Read-Only), `.badge-demo` (Demo), `.badge-neutral` (Info).

---

## 4. Automated Test Suite & Build Verification

- `src/lib/base-com/client.test.ts` (3 tests) — Read-only whitelist enforcement, parameter formatting, error handling.
- `src/lib/crypto.test.ts` (3 tests) — AES-256-GCM encryption, decryption, authentication tag anti-tampering verification, token masking.
- `src/lib/diagnostics/engine.test.ts` (2 tests) — Comprehensive diagnostics verification with fixtures, 100% clean store verification.
- `src/lib/reports/pdf.test.ts` (1 test) — Binary PDF stream generation with `%PDF-` header.
- `src/test/integration.test.ts` (9 tests) — Multi-page product retrieval pagination, 100-ID chunking, client rate limiting, tenant data isolation (anti-IDOR), authoritative warehouse discrepancy checks, EAN barcode validation, API error & invalid credential handling (ERROR_AUTH), commercial issue enrichment (businessImpact & suggestedFix), and connection deletion security.

**Total:** 5 test suites, 18 tests, 100% passing.  
**Production Build:** Next.js 14.2 compiled with 19 static/dynamic routes and active Edge Middleware (`Exit code: 0`).
