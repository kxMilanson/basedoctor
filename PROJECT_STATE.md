# BaseDoctor — Project State & Architectural Summary

**Last Updated:** 2026-11-21  
**Project:** BaseDoctor (Production-oriented SaaS MVP)  
**Status:** MVP Fully Implemented, Tested & Verified (All 15 Vitest tests passing, Next.js 14 production build passing)

---

## 1. Executive Overview
BaseDoctor is a commercial diagnostic tool for e-commerce stores integrated with Base.com (BaseLinker). It connects via the official Base.com connector API (`connector.php`) using a strict **Read-Only** model to identify product/SKU catalog discrepancies, multi-warehouse inventory desynchronization, and order fulfillment/payment risks without making destructive changes.

---

## 2. Implemented Features & Architecture

### 2.1 Authentication & Authorization
- **Location:** `src/lib/auth.ts`, `src/middleware.ts`, `src/app/api/auth/*`
- **Password Security:** Salted hashing with `bcryptjs` (cost 10).
- **Session Tokens:** Stateless HTTP-only JWTs using `jose` (`HS256`, 7-day expiration).
- **Route Protection:** Next.js Edge Middleware (`src/middleware.ts`) guarding `/dashboard`, `/connections`, `/scans`, and `/admin`.
- **RBAC:** Roles `USER` and `ADMIN` with administrative privilege checks on `/api/admin/overview` and `/admin`.
- **Tenant Isolation:** Enforced at repository level (`dataStore` and API routes scoped to authenticated `userId`).

### 2.2 Credentials Encryption & Server-side Security
- **Location:** `src/lib/crypto.ts`
- **Algorithm:** Authenticated symmetric encryption `AES-256-GCM` using 256-bit server key (`ENCRYPTION_KEY`).
- **Tamper Protection:** Unique 12-byte random IV (`crypto.randomBytes(12)`) and 16-byte authentication tag per stored token.
- **Exposure Prevention:** API tokens are decrypted strictly server-side immediately before dispatching requests. The browser and UI only receive masked identifiers (e.g., `1234••••••••abcd`).

### 2.3 Official Base.com API Client (Read-Only)
- **Location:** `src/lib/base-com/client.ts`
- **Endpoint:** `https://api.baselinker.com/connector.php`
- **Protocol:** `POST` with `X-BLToken` header and `application/x-www-form-urlencoded` body (`method` + JSON-encoded `parameters`).
- **Read-Only Whitelist:** Enforces `ALLOWED_READ_ONLY_METHODS`. Any attempt to call mutating methods (`set*`, `add*`, `delete*`) immediately aborts with `ReadOnlyViolationError`.
- **Rate-Limiting:** Sliding-window rate limiter (95 req/min) preventing Base.com 100 req/min threshold violations.
- **Resilience:** Automatic 3-stage exponential backoff retry on HTTP 429 (`ERROR_RATE_LIMIT`).
- **Pagination & Batching:**
  - `getInventoryProductsListPaginated(inventoryId, maxPages)`: Retrieves multi-page catalogs.
  - `getInventoryProductsDataBatched(inventoryId, productIds, 100)`: Chunks product IDs into max 100 per call (Base.com API constraint).
  - `getOrdersPaginated(params)`: Retrieves orders across batches with timestamp/order ID bounds.

### 2.4 Deterministic Diagnostic Engine
- **Location:** `src/lib/diagnostics/engine.ts`, `src/lib/diagnostics/rules/*`
- **Product & SKU Rules (`products.ts`):**
  - `PROD_MISSING_SKU` (CRITICAL): Missing SKU preventing ERP/marketplace syncing.
  - `PROD_DUPLICATE_SKU` (CRITICAL): Same SKU assigned to multiple products/variants.
  - `PROD_ZERO_PRICE` (CRITICAL): Gross price &le; 0 PLN (accidental free giveaways).
  - `PROD_MISSING_EAN` / `PROD_INVALID_EAN` (WARNING): Missing or malformed EAN-8/12/13/14 barcodes.
  - `PROD_DUPLICATE_EAN` (WARNING): Identical EAN assigned to distinct products.
  - `PROD_MISSING_WEIGHT` (WARNING): Product weight is 0.00 kg (incurs courier penalty surcharges).
  - `PROD_MISSING_IMAGES` (WARNING): Zero images attached in Base.com.
  - `PROD_INVALID_TAX` (WARNING): Negative or unassigned VAT rate.
- **Inventory Rules (`inventory.ts`):**
  - `INV_NEGATIVE_STOCK` (CRITICAL): Overall inventory &lt; 0 (overselling).
  - `INV_WAREHOUSE_NEGATIVE_STOCK` (CRITICAL): Negative stock in specific warehouse.
  - `INV_WAREHOUSE_DESYNC` (WARNING): Checked *only* when authoritative sources are present (&ge; 2 warehouses defined in product stock breakdown).
  - `INV_ZERO_STOCK` (INFO): Out-of-stock warning for active catalog items.
- **Order Rules (`orders.ts`):**
  - `ORD_STUCK_PROCESSING_CRITICAL` (CRITICAL): Orders in progress &gt; 14 days.
  - `ORD_STUCK_PROCESSING_WARNING` (WARNING): Orders in progress &gt; 7 days.
  - `ORD_MISSING_TRACKING` (CRITICAL): Shipped orders without `delivery_package_nr`.
  - `ORD_UNPAID_SHIPPED` (CRITICAL): Order marked shipped with 0 PLN received and not Cash on Delivery.
  - `ORD_PAID_UNSHIPPED` (WARNING): 100% paid orders unfulfilled &gt; 72h.
  - `ORD_PARTIAL_PAYMENT` (WARNING): Underpaid transfer orders.
- **Health Score Algorithm:** Weighted average: Catalog (35%), Inventory (30%), Orders (35%).

### 2.5 PDF Export Engine
- **Location:** `src/lib/reports/pdf.ts`, `src/app/api/scans/[id]/pdf/route.ts`
- **Format:** Formatted A4 PDF generated server-side using `PDFKit`.
- **Contents:** Executive Health Score, metadata, category summary cards, transparent data source label (`BASE_COM_LIVE` vs `DEMO_FIXTURES`), and itemized table of findings with actionable remediation recommendations.

### 2.6 Persistence & PostgreSQL Database
- **Location:** `prisma/schema.prisma`, `prisma/migrations/20261121000000_init/migration.sql`, `src/lib/services/data-store.ts`
- **Database Support:** Full PostgreSQL schema with foreign keys, indexes, cascades, and enum definitions.
- **Self-Healing Fallback:** `dataStore` checks PostgreSQL connectivity via Prisma. If a PostgreSQL instance is not yet running (e.g. initial offline setup), it automatically switches to an in-memory repository pre-seeded with test accounts and demo data.

---

## 3. Test Coverage & Verification

Automated test suite runs with **Vitest**:
- `src/lib/base-com/client.test.ts` (3 tests) — Read-only whitelist enforcement, parameter formatting, error handling.
- `src/lib/crypto.test.ts` (3 tests) — AES-256-GCM encryption, decryption, authentication tag anti-tampering verification, token masking.
- `src/lib/diagnostics/engine.test.ts` (2 tests) — Comprehensive diagnostics verification with fixtures, 100% clean store verification.
- `src/lib/reports/pdf.test.ts` (1 test) — Binary PDF stream generation with `%PDF-` header.
- `src/test/integration.test.ts` (6 tests) — Multi-page product retrieval pagination, 100-ID chunking, client rate limiting, tenant data isolation (anti-IDOR), authoritative warehouse discrepancy checks, and EAN barcode validation.

**Total:** 5 test suites, 15 tests, 100% passing.
**Production Build:** Next.js 14.2 compiled with 17 static/dynamic routes and active Edge Middleware (`Exit code: 0`).
