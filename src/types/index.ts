export type UserRole = "USER" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export type IssueSeverity = "CRITICAL" | "WARNING" | "INFO";

export type IssueCategory =
  | "PRODUCT"
  | "INVENTORY"
  | "ORDER"
  | "SHIPPING"
  | "PRICING";

export interface DiagnosticIssueItem {
  id?: string;
  category: IssueCategory;
  severity: IssueSeverity;
  code: string;
  title: string;
  description: string;
  affectedEntityId?: string;
  affectedIdentifier?: string;
  details?: Record<string, unknown>;
  suggestedFix: string;
  businessImpact?: string;
  canAutoFix?: boolean;
  autoFixNote?: string;
  estimatedFixTime?: string;
}

export interface ScanCategorySummary {
  category: IssueCategory;
  title: string;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  totalIssues: number;
  score: number; // 0-100
}

export interface DiagnosticScanReport {
  id?: string;
  shopConnectionId: string;
  shopName: string;
  dataSource?: "DEMO_FIXTURES" | "BASE_COM_LIVE";
  startedAt: string;
  completedAt: string;
  healthScore: number;
  productsScanned: number;
  ordersScanned: number;
  issuesCount: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  categories: ScanCategorySummary[];
  issues: DiagnosticIssueItem[];
}
