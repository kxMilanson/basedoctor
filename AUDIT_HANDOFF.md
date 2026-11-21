# BaseDoctor — Audit Handoff Document

**Date:** 2026-11-21  
**Target:** Security, Architecture & Code Review Audit (Claude / Senior Reviewer)  
**Repository:** BaseDoctor SaaS MVP  

---

## 1. Executive Summary
This document summarizes the current implementation state, security controls, untested paths, and architectural handoff notes for the BaseDoctor platform. The application is a fully functional, testable MVP built with Next.js 14, TypeScript, Prisma (PostgreSQL), and Tailwind CSS.

---

## 2. Key Security Controls Implemented

| Security Control | Implementation | Verification Status |
|---|---|---|
| **Read-Only API Access** | Whitelist (`ALLOWED_READ_ONLY_METHODS`) in `BaseComClient`. Write methods throw `ReadOnlyViolationError`. | **Verified** (`src/lib/base-com/client.test.ts`) |
| **Credential Storage (AES-256-GCM)** | Encrypted using 256-bit key (`ENCRYPTION_KEY`) + random 12-byte IV + 16-byte Auth Tag. Anti-tampering checked. | **Verified** (`src/lib/crypto.test.ts`) |
| **Zero Token Exposure** | Tokens are masked (`1234••••••••abcd`) in API responses. Plain tokens are never sent to the browser or stored in logs. | **Verified** (`src/lib/crypto.ts`) |
| **Authentication & Route Guarding** | HTTP-only session cookies with HS256 JWT (`jose`) guarded via Next.js Edge Middleware (`src/middleware.ts`). | **Verified** (`src/middleware.ts`) |
| **Customer Data Isolation (Anti-IDOR)** | Queries to `shop_connections` and `diagnostic_scans` are strictly scoped to the authenticated `userId`. | **Verified** (`src/test/integration.test.ts`) |
| **Rate Limit Protection** | Token-bucket sliding window rate limiter (95 req/min) with 3-stage exponential backoff for HTTP 429. | **Verified** (`src/lib/base-com/client.ts`) |
| **Transparent Data Provenance** | Clear separation and tagging between `BASE_COM_LIVE` (real Base.com API) and `DEMO_FIXTURES` (mock/demo mode). | **Verified** (`src/lib/services/diagnostic-service.ts`) |

---

## 3. Untested Paths & Testing Boundaries

The following paths were verified via mock fixtures and integration tests, but require specific external credentials for live end-to-end execution:

1. **Live Production Base.com Account with Active Inventory:**
   - **Reason:** Testing against the live `https://api.baselinker.com/connector.php` endpoint requires active customer API credentials. As per the security specification, no customer or production credentials were fabricated or hardcoded.
   - **Mitigation:** The client was verified using realistic fixtures adhering exactly to the official API JSON payloads. When a real token is provided via the `/connections` UI, `client.testConnection()` and `DiagnosticService.executeScan()` execute live HTTP requests.
2. **Distributed Rate Limiting (Multi-Instance Scaling):**
   - **Reason:** The current rate limiter operates in-memory per Node process.
   - **Recommendation:** If the application is scaled horizontally across multiple serverless or cluster instances, integrate Upstash Redis or Memcached as a distributed token bucket.
3. **Database Connection String under Heavy Production Load:**
   - **Reason:** Automated tests verify both the Prisma schema and the self-healing fallback memory store.
   - **Recommendation:** Run `npx prisma migrate deploy` in the production CI/CD pipeline when connecting to a production PostgreSQL database.

---

## 4. Unresolved Items & Post-MVP Roadmap

1. **Scheduled Automated Audits (Background Cron):**
   - Currently, scans are executed on-demand via the dashboard or connection screen.
   - *Roadmap:* Add scheduled background jobs (e.g. daily/weekly cron via Vercel Cron or BullMQ) to send email/Slack digest alerts.
2. **Key Rotation Utility:**
   - Implement an administrative CLI script to re-encrypt stored tokens in the event that `ENCRYPTION_KEY` needs rotation.
3. **External ERP & Courier API Webhooks:**
   - BaseDoctor currently audits data present in Base.com (e.g. `delivery_package_nr`). Direct carrier status checks (e.g. InPost tracking webhook, DPD API) are documented as unsupported in MVP.

---

## 5. Deployment & Configuration Checklist

Before promoting to production:
- [ ] Set `DATABASE_URL` to a valid PostgreSQL connection string (PostgreSQL 14+).
- [ ] Generate a cryptographically secure 64-hex-character `ENCRYPTION_KEY`:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Set `JWT_SECRET` to a random string of at least 32 characters.
- [ ] Run database migration:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Run test suite to verify green status:
  ```bash
  npm test
  ```
- [ ] Build and start:
  ```bash
  npm run build
  npm run start
  ```
