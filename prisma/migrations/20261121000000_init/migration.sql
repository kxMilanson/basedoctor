-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ConnectionStatus" AS ENUM ('ACTIVE', 'INVALID_TOKEN', 'RATE_LIMITED', 'ERROR');

-- CreateEnum
CREATE TYPE "ScanStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('CRITICAL', 'WARNING', 'INFO');

-- CreateEnum
CREATE TYPE "IssueCategory" AS ENUM ('PRODUCT', 'INVENTORY', 'ORDER', 'SHIPPING', 'PRICING');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "encryptedToken" TEXT NOT NULL,
    "tokenIv" TEXT NOT NULL,
    "tokenTag" TEXT NOT NULL,
    "lastConnectedAt" TIMESTAMP(3),
    "status" "ConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "defaultInventoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_scans" (
    "id" TEXT NOT NULL,
    "shopConnectionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ScanStatus" NOT NULL DEFAULT 'PENDING',
    "healthScore" INTEGER NOT NULL DEFAULT 100,
    "productsScanned" INTEGER NOT NULL DEFAULT 0,
    "ordersScanned" INTEGER NOT NULL DEFAULT 0,
    "issuesCount" INTEGER NOT NULL DEFAULT 0,
    "criticalCount" INTEGER NOT NULL DEFAULT 0,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "infoCount" INTEGER NOT NULL DEFAULT 0,
    "summary" JSONB,
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "diagnostic_scans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_issues" (
    "id" TEXT NOT NULL,
    "scanId" TEXT NOT NULL,
    "category" "IssueCategory" NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affectedEntityId" TEXT,
    "affectedIdentifier" TEXT,
    "details" JSONB,
    "suggestedFix" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "diagnostic_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "shop_connections_userId_idx" ON "shop_connections"("userId");

-- CreateIndex
CREATE INDEX "diagnostic_scans_userId_idx" ON "diagnostic_scans"("userId");

-- CreateIndex
CREATE INDEX "diagnostic_scans_shopConnectionId_idx" ON "diagnostic_scans"("shopConnectionId");

-- CreateIndex
CREATE INDEX "diagnostic_issues_scanId_idx" ON "diagnostic_issues"("scanId");

-- CreateIndex
CREATE INDEX "diagnostic_issues_severity_idx" ON "diagnostic_issues"("severity");

-- CreateIndex
CREATE INDEX "diagnostic_issues_category_idx" ON "diagnostic_issues"("category");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- AddForeignKey
ALTER TABLE "shop_connections" ADD CONSTRAINT "shop_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_scans" ADD CONSTRAINT "diagnostic_scans_shopConnectionId_fkey" FOREIGN KEY ("shopConnectionId") REFERENCES "shop_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_scans" ADD CONSTRAINT "diagnostic_scans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_issues" ADD CONSTRAINT "diagnostic_issues_scanId_fkey" FOREIGN KEY ("scanId") REFERENCES "diagnostic_scans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
