import { prisma } from "@/lib/db";
import { encryptToken, decryptToken, maskToken } from "@/lib/crypto";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { SessionUser, UserRole } from "@/types";
import { BaseComClient } from "@/lib/base-com/client";
import { runDiagnostics } from "@/lib/diagnostics/engine";
import {
  mockInventories,
  mockOrders,
  mockProductsDataMap,
  mockProductsList,
  mockStatuses,
} from "@/test/fixtures/baselinker";

// In-memory fallback repository when PostgreSQL is not yet configured
class MemoryStore {
  public users: Map<string, any> = new Map();
  public connections: Map<string, any> = new Map();
  public scans: Map<string, any> = new Map();
  public issues: Map<string, any[]> = new Map();
  public auditLogs: any[] = [];
  public initialized = false;

  public async init() {
    if (this.initialized) return;
    this.initialized = true;

    // Seed default admin and demo user
    const adminHash = await hashPassword("Admin123!");
    const userHash = await hashPassword("User123!");

    const admin = {
      id: "usr_admin_01",
      email: "admin@basedoctor.pl",
      passwordHash: adminHash,
      name: "Administrator Systemu",
      role: "ADMIN" as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const demoUser = {
      id: "usr_demo_01",
      email: "jan@twojsklep.pl",
      passwordHash: userHash,
      name: "Jan Kowalski (Sklep Online)",
      role: "USER" as UserRole,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(admin.id, admin);
    this.users.set(admin.email, admin);
    this.users.set(demoUser.id, demoUser);
    this.users.set(demoUser.email, demoUser);

    // Seed demo connection
    const token = "demo_bl_token_8899aabbcc";
    const enc = encryptToken(token);
    const demoConn = {
      id: "conn_demo_01",
      userId: demoUser.id,
      name: "Sklep Główny Base.com",
      encryptedToken: enc.ciphertext,
      tokenIv: enc.iv,
      tokenTag: enc.tag,
      status: "ACTIVE",
      defaultInventoryId: "101",
      lastConnectedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.connections.set(demoConn.id, demoConn);

    // Run initial scan for demo
    const scanReport = runDiagnostics({
      shopConnectionId: demoConn.id,
      shopName: demoConn.name,
      productsList: mockProductsList,
      productsDataMap: mockProductsDataMap,
      orders: mockOrders,
      statuses: mockStatuses,
    });

    const scanId = "scan_demo_01";
    const scanRecord = {
      id: scanId,
      shopConnectionId: demoConn.id,
      userId: demoUser.id,
      status: "COMPLETED",
      healthScore: scanReport.healthScore,
      productsScanned: scanReport.productsScanned,
      ordersScanned: scanReport.ordersScanned,
      issuesCount: scanReport.issuesCount,
      criticalCount: scanReport.criticalCount,
      warningCount: scanReport.warningCount,
      infoCount: scanReport.infoCount,
      summary: scanReport.categories,
      startedAt: new Date(scanReport.startedAt),
      completedAt: new Date(scanReport.completedAt),
    };
    this.scans.set(scanId, scanRecord);
    this.issues.set(scanId, scanReport.issues);
  }
}

const memoryStore = new MemoryStore();

/**
 * Checks if Prisma can connect to PostgreSQL.
 */
let isDbConnected: boolean | null = null;
async function checkDbConnection(): Promise<boolean> {
  if (isDbConnected !== null) return isDbConnected;
  try {
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    return true;
  } catch {
    isDbConnected = false;
    await memoryStore.init();
    return false;
  }
}

export const dataStore = {
  // USER METHODS
  async findUserByEmail(email: string) {
    const hasDb = await checkDbConnection();
    if (hasDb) {
      return prisma.user.findUnique({ where: { email } });
    }
    await memoryStore.init();
    return memoryStore.users.get(email) || null;
  },

  async createUser(data: { email: string; password: string; name?: string; role?: UserRole }) {
    const passwordHash = await hashPassword(data.password);
    const hasDb = await checkDbConnection();
    if (hasDb) {
      return prisma.user.create({
        data: {
          email: data.email,
          passwordHash,
          name: data.name,
          role: data.role || "USER",
        },
      });
    }

    await memoryStore.init();
    const newUser = {
      id: `usr_${Date.now()}`,
      email: data.email,
      passwordHash,
      name: data.name || null,
      role: data.role || "USER",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.users.set(newUser.id, newUser);
    memoryStore.users.set(newUser.email, newUser);
    return newUser;
  },

  async getAllUsers() {
    const hasDb = await checkDbConnection();
    if (hasDb) {
      return prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          _count: { select: { connections: true, scans: true } },
        },
      });
    }
    await memoryStore.init();
    const list: any[] = [];
    const seen = new Set();
    for (const u of memoryStore.users.values()) {
      if (!seen.has(u.id)) {
        seen.add(u.id);
        list.push({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          createdAt: u.createdAt,
          _count: { connections: 1, scans: 1 },
        });
      }
    }
    return list;
  },

  // CONNECTION METHODS
  async createConnection(userId: string, name: string, token: string) {
    const encrypted = encryptToken(token);
    const hasDb = await checkDbConnection();

    if (hasDb) {
      return prisma.shopConnection.create({
        data: {
          userId,
          name,
          encryptedToken: encrypted.ciphertext,
          tokenIv: encrypted.iv,
          tokenTag: encrypted.tag,
          status: "ACTIVE",
          lastConnectedAt: new Date(),
        },
      });
    }

    await memoryStore.init();
    const conn = {
      id: `conn_${Date.now()}`,
      userId,
      name,
      encryptedToken: encrypted.ciphertext,
      tokenIv: encrypted.iv,
      tokenTag: encrypted.tag,
      status: "ACTIVE",
      defaultInventoryId: "101",
      lastConnectedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryStore.connections.set(conn.id, conn);
    return conn;
  },

  async getUserConnections(userId: string) {
    const hasDb = await checkDbConnection();
    if (hasDb) {
      const conns = await prisma.shopConnection.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { scans: true } },
        },
      });
      return conns.map((c) => ({
        ...c,
        maskedToken: maskToken(
          decryptToken({
            ciphertext: c.encryptedToken,
            iv: c.tokenIv,
            tag: c.tokenTag,
          })
        ),
      }));
    }

    await memoryStore.init();
    const result: any[] = [];
    for (const c of memoryStore.connections.values()) {
      if (c.userId === userId) {
        result.push({
          ...c,
          _count: { scans: 1 },
          maskedToken: maskToken(
            decryptToken({
              ciphertext: c.encryptedToken,
              iv: c.tokenIv,
              tag: c.tokenTag,
            })
          ),
        });
      }
    }
    return result;
  },

  async getConnectionById(id: string, userId?: string) {
    const hasDb = await checkDbConnection();
    if (hasDb) {
      return prisma.shopConnection.findFirst({
        where: { id, ...(userId ? { userId } : {}) },
      });
    }
    await memoryStore.init();
    const conn = memoryStore.connections.get(id);
    if (!conn) return null;
    if (userId && conn.userId !== userId) return null;
    return conn;
  },

  async deleteConnection(id: string, userId: string) {
    const hasDb = await checkDbConnection();
    if (hasDb) {
      return prisma.shopConnection.deleteMany({
        where: { id, userId },
      });
    }
    await memoryStore.init();
    const conn = memoryStore.connections.get(id);
    if (conn && conn.userId === userId) {
      memoryStore.connections.delete(id);
      return { count: 1 };
    }
    return { count: 0 };
  },

  // SCAN METHODS
  async createScanRecord(scanData: any, issues: any[]) {
    const hasDb = await checkDbConnection();
    if (hasDb) {
      const created = await prisma.diagnosticScan.create({
        data: {
          shopConnectionId: scanData.shopConnectionId,
          userId: scanData.userId,
          status: "COMPLETED",
          healthScore: scanData.healthScore,
          productsScanned: scanData.productsScanned,
          ordersScanned: scanData.ordersScanned,
          issuesCount: scanData.issuesCount,
          criticalCount: scanData.criticalCount,
          warningCount: scanData.warningCount,
          infoCount: scanData.infoCount,
          summary: scanData.categories,
          startedAt: new Date(scanData.startedAt),
          completedAt: new Date(scanData.completedAt),
          issues: {
            create: issues.map((iss) => ({
              category: iss.category,
              severity: iss.severity,
              code: iss.code,
              title: iss.title,
              description: iss.description,
              affectedEntityId: iss.affectedEntityId || null,
              affectedIdentifier: iss.affectedIdentifier || null,
              details: iss.details || {},
              suggestedFix: iss.suggestedFix,
            })),
          },
        },
        include: { issues: true },
      });
      return created;
    }

    await memoryStore.init();
    const id = `scan_${Date.now()}`;
    const record = {
      id,
      shopConnectionId: scanData.shopConnectionId,
      userId: scanData.userId,
      status: "COMPLETED",
      healthScore: scanData.healthScore,
      productsScanned: scanData.productsScanned,
      ordersScanned: scanData.ordersScanned,
      issuesCount: scanData.issuesCount,
      criticalCount: scanData.criticalCount,
      warningCount: scanData.warningCount,
      infoCount: scanData.infoCount,
      summary: scanData.categories,
      startedAt: new Date(scanData.startedAt),
      completedAt: new Date(scanData.completedAt),
    };
    memoryStore.scans.set(id, record);
    memoryStore.issues.set(id, issues);
    return { ...record, issues };
  },

  async getUserScans(userId: string) {
    const hasDb = await checkDbConnection();
    if (hasDb) {
      return prisma.diagnosticScan.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        include: {
          shopConnection: { select: { name: true } },
        },
      });
    }
    await memoryStore.init();
    const list: any[] = [];
    for (const s of memoryStore.scans.values()) {
      if (s.userId === userId) {
        const conn = memoryStore.connections.get(s.shopConnectionId);
        list.push({
          ...s,
          shopConnection: { name: conn?.name || "Sklep Base.com" },
        });
      }
    }
    return list.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  },

  async getScanById(id: string, userId?: string) {
    const hasDb = await checkDbConnection();
    if (hasDb) {
      return prisma.diagnosticScan.findFirst({
        where: { id, ...(userId ? { userId } : {}) },
        include: {
          shopConnection: { select: { name: true } },
          issues: true,
        },
      });
    }
    await memoryStore.init();
    const scan = memoryStore.scans.get(id);
    if (!scan) return null;
    if (userId && scan.userId !== userId) return null;
    const conn = memoryStore.connections.get(scan.shopConnectionId);
    const issues = memoryStore.issues.get(id) || [];
    return {
      ...scan,
      shopConnection: { name: conn?.name || "Sklep Base.com" },
      issues,
    };
  },

  async applyIssueFix(
    scanId: string,
    userId: string,
    issueId: string,
    newValue: string,
    fieldName: string,
    oldValue?: string
  ) {
    const hasDb = await checkDbConnection();
    const recalculateMetrics = (issuesList: any[]) => {
      const openIssues = issuesList.filter((i) => (i.status || i.details?.status) !== "FIXED");
      const criticalCount = openIssues.filter((i) => i.severity === "CRITICAL").length;
      const warningCount = openIssues.filter((i) => i.severity === "WARNING").length;
      const infoCount = openIssues.filter((i) => i.severity === "INFO").length;
      const healthScore = Math.max(
        0,
        Math.min(100, 100 - criticalCount * 10 - warningCount * 4 - infoCount * 1)
      );
      return { criticalCount, warningCount, infoCount, healthScore };
    };

    if (hasDb) {
      const scan = await prisma.diagnosticScan.findFirst({
        where: { id: scanId, userId },
        include: { issues: true, shopConnection: { select: { name: true } } },
      });
      if (!scan) return null;

      const targetIssue = scan.issues.find(
        (iss, idx) => iss.id === issueId || String(idx) === issueId
      );
      if (!targetIssue) return null;

      const prevDetails = (targetIssue.details as Record<string, any>) || {};
      const fixSnapshot = {
        oldValue: oldValue || prevDetails.currentValue || "Błędna wartość",
        newValue,
        fieldName,
        fixedAt: new Date().toISOString(),
      };

      await prisma.diagnosticIssue.update({
        where: { id: targetIssue.id },
        data: {
          details: {
            ...prevDetails,
            status: "FIXED",
            fixSnapshot,
          },
        },
      });

      const updatedIssues = scan.issues.map((iss) =>
        iss.id === targetIssue.id
          ? {
              ...iss,
              status: "FIXED",
              fixSnapshot,
              details: { ...prevDetails, status: "FIXED", fixSnapshot },
            }
          : {
              ...iss,
              status: (iss.details as any)?.status || "OPEN",
              fixSnapshot: (iss.details as any)?.fixSnapshot || null,
            }
      );

      const metrics = recalculateMetrics(updatedIssues);
      await prisma.diagnosticScan.update({
        where: { id: scan.id },
        data: metrics,
      });

      return { ...scan, ...metrics, issues: updatedIssues };
    }

    await memoryStore.init();
    const scan = memoryStore.scans.get(scanId);
    if (!scan || scan.userId !== userId) return null;

    const issues = memoryStore.issues.get(scanId) || [];
    let found = false;
    const updatedIssues = issues.map((iss: any, idx: number) => {
      if (iss.id === issueId || String(idx) === issueId || `${iss.code}_${idx}` === issueId) {
        found = true;
        return {
          ...iss,
          status: "FIXED",
          fixSnapshot: {
            oldValue: oldValue || iss.affectedIdentifier || "Wartość przed poprawką",
            newValue,
            fieldName,
            fixedAt: new Date().toISOString(),
          },
        };
      }
      return iss;
    });

    if (!found) return null;

    const metrics = recalculateMetrics(updatedIssues);
    const updatedScan = { ...scan, ...metrics };
    memoryStore.scans.set(scanId, updatedScan);
    memoryStore.issues.set(scanId, updatedIssues);

    const conn = memoryStore.connections.get(scan.shopConnectionId);
    return {
      ...updatedScan,
      shopConnection: { name: conn?.name || "Sklep Base.com" },
      issues: updatedIssues,
    };
  },

  async rollbackIssueFix(scanId: string, userId: string, issueId: string) {
    const hasDb = await checkDbConnection();
    const recalculateMetrics = (issuesList: any[]) => {
      const openIssues = issuesList.filter((i) => (i.status || i.details?.status) !== "FIXED");
      const criticalCount = openIssues.filter((i) => i.severity === "CRITICAL").length;
      const warningCount = openIssues.filter((i) => i.severity === "WARNING").length;
      const infoCount = openIssues.filter((i) => i.severity === "INFO").length;
      const healthScore = Math.max(
        0,
        Math.min(100, 100 - criticalCount * 10 - warningCount * 4 - infoCount * 1)
      );
      return { criticalCount, warningCount, infoCount, healthScore };
    };

    if (hasDb) {
      const scan = await prisma.diagnosticScan.findFirst({
        where: { id: scanId, userId },
        include: { issues: true, shopConnection: { select: { name: true } } },
      });
      if (!scan) return null;

      const targetIssue = scan.issues.find(
        (iss, idx) => iss.id === issueId || String(idx) === issueId
      );
      if (!targetIssue) return null;

      const prevDetails = (targetIssue.details as Record<string, any>) || {};
      const { fixSnapshot: _removed, ...restDetails } = prevDetails;

      await prisma.diagnosticIssue.update({
        where: { id: targetIssue.id },
        data: {
          details: {
            ...restDetails,
            status: "OPEN",
          },
        },
      });

      const updatedIssues = scan.issues.map((iss) =>
        iss.id === targetIssue.id
          ? {
              ...iss,
              status: "OPEN",
              fixSnapshot: null,
              details: { ...restDetails, status: "OPEN" },
            }
          : {
              ...iss,
              status: (iss.details as any)?.status || "OPEN",
              fixSnapshot: (iss.details as any)?.fixSnapshot || null,
            }
      );

      const metrics = recalculateMetrics(updatedIssues);
      await prisma.diagnosticScan.update({
        where: { id: scan.id },
        data: metrics,
      });

      return { ...scan, ...metrics, issues: updatedIssues };
    }

    await memoryStore.init();
    const scan = memoryStore.scans.get(scanId);
    if (!scan || scan.userId !== userId) return null;

    const issues = memoryStore.issues.get(scanId) || [];
    const updatedIssues = issues.map((iss: any, idx: number) => {
      if (iss.id === issueId || String(idx) === issueId || `${iss.code}_${idx}` === issueId) {
        const { fixSnapshot: _removed, ...rest } = iss;
        return { ...rest, status: "OPEN" };
      }
      return iss;
    });

    const metrics = recalculateMetrics(updatedIssues);
    const updatedScan = { ...scan, ...metrics };
    memoryStore.scans.set(scanId, updatedScan);
    memoryStore.issues.set(scanId, updatedIssues);

    const conn = memoryStore.connections.get(scan.shopConnectionId);
    return {
      ...updatedScan,
      shopConnection: { name: conn?.name || "Sklep Base.com" },
      issues: updatedIssues,
    };
  },

  async getAdminStats() {
    const hasDb = await checkDbConnection();
    if (hasDb) {
      const [totalUsers, totalConnections, totalScans, totalIssues] =
        await Promise.all([
          prisma.user.count(),
          prisma.shopConnection.count(),
          prisma.diagnosticScan.count(),
          prisma.diagnosticIssue.count(),
        ]);
      const recentScans = await prisma.diagnosticScan.findMany({
        take: 10,
        orderBy: { startedAt: "desc" },
        include: {
          user: { select: { email: true, name: true } },
          shopConnection: { select: { name: true } },
        },
      });
      return {
        totalUsers,
        totalConnections,
        totalScans,
        totalIssues,
        recentScans,
      };
    }

    await memoryStore.init();
    const userCount = new Set(Array.from(memoryStore.users.values()).map(u => u.id)).size;
    const connCount = memoryStore.connections.size;
    const scanCount = memoryStore.scans.size;
    let issuesCount = 0;
    for (const issList of memoryStore.issues.values()) {
      issuesCount += issList.length;
    }
    const recentScans = Array.from(memoryStore.scans.values()).map(s => {
      const u = memoryStore.users.get(s.userId);
      const conn = memoryStore.connections.get(s.shopConnectionId);
      return {
        ...s,
        user: { email: u?.email || "user@example.com", name: u?.name || "Użytkownik" },
        shopConnection: { name: conn?.name || "Sklep Base.com" },
      };
    });

    return {
      totalUsers: userCount,
      totalConnections: connCount,
      totalScans: scanCount,
      totalIssues: issuesCount,
      recentScans,
    };
  },
};
