# BaseDoctor — Project State & Architectural Summary

**Last Updated:** 2026-11-21  
**Project:** BaseDoctor (Commercial SaaS Diagnostic Platform for E-commerce & Base.com)  
**Status:** Production Ready & Enterprise UI/UX Standard (Linear/Vercel Design)  
**Tests:** 18/18 Vitest passing | Next.js 14 Production Build passing  
**Deployments:** Vercel Production (`https://basedoctor.vercel.app` & `https://basedoctor-milan-a45c.vercel.app`)

---

## 1. Executive Overview
BaseDoctor is a commercial SaaS diagnostic platform for online stores and agencies operating on Base.com (BaseLinker). It connects via the official Base.com connector API (`connector.php`) using a strict **Read-Only** model to identify product/SKU catalog discrepancies, multi-warehouse inventory desynchronization, and order fulfillment/payment risks without making destructive changes.

The application has been completely redesigned following modern 2027 enterprise B2B SaaS design standards (inspired by Linear, Vercel, and Stripe Dashboard) — featuring hairline borders, clean typography, monospace numeric metrics, high contrast hierarchy, and responsive desktop/mobile layouts.

---

## 2. Customer Journey & Core Modules

### 2.1 Complete Customer Flow
1. **User Registration & Login:** Email/password registration with salted bcrypt hash (cost 10), stateless HTTP-only JWT session cookies (`jose`, HS256), and Next.js Edge Middleware route guarding. Includes 1-click test credential auto-fill for frictionless demo evaluation.
2. **Secure Connection:** Customer connects their Base.com token via `/connections`. The token is immediately encrypted with authenticated symmetric AES-256-GCM.
3. **Step-by-Step Onboarding:** Visual guidance inside the connection view showing how to retrieve the API token from BaseLinker (`Konto -> Moje konto -> API`) with read-only permissions.
4. **Demonstration Mode:** 1-click "Wypróbuj w trybie demonstracyjnym" creates an isolated demo store with realistic synthetic fixtures, clearly tagged `[TRYB DEMO - DANE SYNTETYCZNE]`.
5. **Deterministic Diagnostics:** Evaluates 15 deterministic diagnostic rules across Products, Inventory, and Orders with rate-limit protection (95 req/min) and paginated chunking (100 IDs/call).
6. **Commercial Value & Health Score:** Clear score (0–100%) and issue cards enriched with business impact (`businessImpact`), suggested fix (`suggestedFix`), auto-repair feasibility (`canAutoFix`), and repair duration estimates (`estimatedFixTime`).
7. **Official PDF Export:** Professional server-side generated A4 PDF report with corporate branding, category summaries, and full issue register.
8. **Diagnostic History & Isolation:** Scans and connections are strictly scoped to the authenticated tenant (anti-IDOR protection).
9. **User Settings & Security Spec:** Dedicated settings page with tenant profile, AES-256-GCM technical specifications, API rate limiter parameters, and alert notification preferences.
10. **Admin Dashboard:** High-level tenant oversight, encrypted credential counts, platform scan activity, and role segregation.
11. **Landing Page:** 2027-style SaaS presentation with hero, live interactive issue inspector, persona cards, and contact consultation form.

---

## 3. Design System & UI/UX Standards

- **Color System:** Pure white surface (`#ffffff`), neutral gray base (`#fafafa`, `#f4f4f5`), high contrast text (`#09090b`), electric blue/indigo primary accent (`#0066FF` / `#2563eb`).
- **Borders & Elevation:** Hairline borders (`border-zinc-200/80`), subtle single-pixel shadows (`shadow-xs`), card hover elevation.
- **Typography & Metrics:** Clean typography with Geist/Inter, strict uppercase tracking for category labels, monospace tabular numerals (`font-mono tabular-nums`) for scores, counts, durations, and identifiers.
- **Status Badges:** Semantically differentiated chips:
  - Critical: `bg-rose-50 text-rose-700 border-rose-200`
  - Warning: `bg-amber-50 text-amber-700 border-amber-200`
  - Neutral / Info: `bg-zinc-100 text-zinc-700 border-zinc-200`
  - Demo: `bg-amber-50 text-amber-800 border-amber-300`
  - Active: `bg-emerald-50 text-emerald-700 border-emerald-200`

---

## 4. Diagnostic Rules & Commercial Enrichment

| Rule Code | Severity | Description (PL) | Business Impact | Fix Time Estimate |
|---|---|---|---|---|
| `PROD_MISSING_SKU` | CRITICAL | Brak kodu SKU w produkcie | Blokuje synchronizację z Allegro, Amazon, ERP i wstrzymuje automatyczne wznawianie aukcji. | ~5 minut |
| `PROD_DUPLICATE_SKU` | CRITICAL | Zdublowany identyfikator SKU | Ryzyko wysyłki złego wariantu, błędne stany w marketplace, chaos w inwentaryzacji. | ~10 minut |
| `PROD_ZERO_PRICE` | CRITICAL | Cena brutto &le; 0.00 PLN | Ryzyko sprzedaży towaru za darmo przy błędnym wznowieniu aukcji. | ~3 minuty |
| `PROD_MISSING_EAN` | WARNING | Brak kodu kreskowego EAN | Obniżenie trafności na marketplace, brak możliwości wystawiania na Allegro/Amazon. | ~5 minut |
| `PROD_INVALID_EAN` | WARNING | Niepoprawny format kodu EAN | Odrzucenie oferty przez walidatory marketplace, błędy skanerów kodów kreskowych. | ~5 minut |
| `PROD_DUPLICATE_EAN` | WARNING | Zdublowany kod kreskowy EAN | Błędy automatycznego łączenia ofert z katalogiem produktów Allegro/Google Shopping. | ~5 minut |
| `PROD_MISSING_WEIGHT` | WARNING | Brak wagi produktu (0.00 kg) | Błędy doboru gabarytu paczki w InPost/DPD/DHL i dotkliwe dopłaty weryfikacyjne na sortowni. | ~5 minut |
| `PROD_MISSING_IMAGES` | WARNING | Brak zdjęć w galerii | Drastyczny spadek konwersji i blokada wystawiania na platformach marketplace. | ~15 minut |
| `PROD_INVALID_TAX` | WARNING | Nieprawidłowa stawka VAT | Błędy fakturowania, rozbieżności w JPK_V7 i ryzyko sankcji karnoskarbowych. | ~5 minut |
| `INV_NEGATIVE_STOCK` | CRITICAL | Ujemny stan magazynowy | Overselling (sprzedaż towaru widmo), opóźnienia, negatywne opinie i anulacje zamówień. | ~15 minut |
| `INV_WAREHOUSE_NEGATIVE_STOCK` | CRITICAL | Ujemny stan w magazynie składowym | Rozbieżności w inwentaryzacji fizycznej poszczególnych lokalizacji magazynowych. | ~10 minut |
| `INV_WAREHOUSE_DESYNC` | WARNING | Niespójność sumy stanów z magazynów | Błędy wyliczania stanów dyspozycyjnych pomiędzy magazynami a kanałami sprzedaży. | ~15 minut |
| `INV_ZERO_STOCK` | INFO | Zerowy stan magazynowy | Ryzyko utraty pozycji w wynikach wyszukiwania po wyczerpaniu zapasów. | ~5 minut |
| `ORD_STUCK_PROCESSING_CRITICAL` | CRITICAL | Zamówienie zablokowane &gt; 14 dni | Ryzyko rezygnacji klienta, obciążenia zwrotem i spory w Centrum Rozstrzygania. | ~15 minut |
| `ORD_STUCK_PROCESSING_WARNING` | WARNING | Zamówienie w realizacji &gt; 7 dni | Spadek zaufania kupującego i potencjalne opóźnienia łańcucha dostaw. | ~10 minut |
| `ORD_MISSING_TRACKING` | CRITICAL | Wysłane zamówienie bez listu przewozowego | Utrata statusu Super Sprzedawcy i brak automatycznych powiadomień dla klienta. | ~5 minut |
| `ORD_UNPAID_SHIPPED` | CRITICAL | Wysłane zamówienie bez zapłaty (nie pobranie) | Bezpośrednia strata finansowa (towar wydany bez odnotowania środków na koncie). | ~20 minut |
| `ORD_PAID_UNSHIPPED` | WARNING | Opłacone zamówienie nienadane &gt; 72h | Niezadowolenie klienta i przekroczenie deklarowanego czasu wysyłki na marketplace. | ~10 minut |
| `ORD_PARTIAL_PAYMENT` | WARNING | Częściowa wpłata na zamówieniu | Ryzyko wydania towaru o pełnej wartości przy niepełnej płatności przelewowej. | ~10 minut |

---

## 5. Automated Test Suite & Build Verification

- `src/lib/base-com/client.test.ts` (3 tests) — Read-only whitelist enforcement, parameter formatting, error handling.
- `src/lib/crypto.test.ts` (3 tests) — AES-256-GCM encryption, decryption, authentication tag anti-tampering verification, token masking.
- `src/lib/diagnostics/engine.test.ts` (2 tests) — Comprehensive diagnostics verification with fixtures, 100% clean store verification.
- `src/lib/reports/pdf.test.ts` (1 test) — Binary PDF stream generation with `%PDF-` header.
- `src/test/integration.test.ts` (9 tests) — Multi-page product retrieval pagination, 100-ID chunking, client rate limiting, tenant data isolation (anti-IDOR), authoritative warehouse discrepancy checks, EAN barcode validation, API error & invalid credential handling (ERROR_AUTH), commercial issue enrichment (businessImpact & suggestedFix), and connection deletion security.

**Total:** 5 test suites, 18 tests, 100% passing.
