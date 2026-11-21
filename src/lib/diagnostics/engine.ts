import {
  BaseLinkerOrder,
  BaseLinkerOrderStatus,
  BaseLinkerProductData,
  BaseLinkerProductListItem,
} from "@/types/baselinker";
import {
  DiagnosticIssueItem,
  DiagnosticScanReport,
  IssueCategory,
  ScanCategorySummary,
} from "@/types";
import { diagnoseProducts } from "./rules/products";
import { diagnoseInventory } from "./rules/inventory";
import { diagnoseOrders } from "./rules/orders";

export interface DiagnosticInputData {
  shopConnectionId: string;
  shopName: string;
  productsList: BaseLinkerProductListItem[];
  productsDataMap: Record<string, BaseLinkerProductData>;
  orders: BaseLinkerOrder[];
  statuses: BaseLinkerOrderStatus[];
  referenceTimestampMs?: number;
  dataSource?: "DEMO_FIXTURES" | "BASE_COM_LIVE";
}

/**
 * Documentation of checks supported and unsupported by BaseDoctor MVP:
 */
export const DIAGNOSTIC_CAPABILITIES_DOC = {
  supportedChecks: [
    {
      category: "PRODUCT",
      checks: [
        "Wykrywanie brakujących kodów SKU (krytyczne dla integracji)",
        "Weryfikacja kodów EAN (brak, niepoprawny format EAN-8/13/14)",
        "Wykrywanie duplikatów SKU pomiędzy różnymi produktami",
        "Wykrywanie duplikatów kodów kreskowych EAN",
        "Walidacja cen (ceny zerowe lub ujemne)",
        "Wykrywanie brakującej wagi produktu (0.00 kg - problem z etykietami kurierskimi)",
        "Wykrywanie brakujących zdjęć w galerii produktu",
        "Weryfikacja przypisania prawidłowej stawki podatku VAT",
      ],
    },
    {
      category: "INVENTORY",
      checks: [
        "Wykrywanie ujemnych stanów magazynowych ogólnych",
        "Weryfikacja ujemnych stanów w poszczególnych magazynach składowych",
        "Wykrywanie niespójności sumy stanów z magazynów z łącznym stanem w Base.com",
        "Informowanie o zerowych stanach magazynowych w aktywnym katalogu",
      ],
    },
    {
      category: "ORDER",
      checks: [
        "Wykrywanie zamówień zablokowanych w realizacji (> 7 oraz > 14 dni)",
        "Wykrywanie opłaconych zamówień bez nadania przesyłki (> 72h)",
        "Wykrywanie wysłanych zamówień bez zapisanego numeru listu przewozowego",
        "Identyfikacja ryzyka wysyłki bez zapłaty (status wysłane, kwota = 0, brak pobrania)",
        "Wykrywanie niedopłat w zamówieniach przelewowych",
      ],
    },
  ],
  unsupportedChecks: [
    {
      area: "Modyfikacje i zapis w API Base.com",
      reason:
        "BaseDoctor jest systemem ściśle read-only. Nie modyfikuje ani nie usuwa zamówień, produktów ani ofert w Base.com.",
    },
    {
      area: "Fizyczny stan na półce magazynowej (RFID / GPS)",
      reason:
        "BaseDoctor opiera się na danych z bazy Base.com; nie zastępuje fizycznej inwentaryzacji za pomocą skanerów RFID.",
    },
    {
      area: "Weryfikacja marży i kosztów zakupu ERP w czasie rzeczywistym",
      reason:
        "Wymaga integracji z zewnętrznymi systemami ERP (Subiekt, Comarch ERP Optima, SAP), które nie są częścią standardowego API Base.com.",
    },
    {
      area: "Weryfikacja statusów przesyłek bezpośrednio u API przewoźników (np. InPost API, Poczta Polska API)",
      reason:
        "MVP diagnozuje poprawność danych w Base.com (obecność modułu i numeru listu przewozowego); bezpośrednie webhooki przewoźników zaplanowano w roadmapie.",
    },
  ],
};

/**
 * Calculates category score (0-100) based on issues count and severity.
 */
function calculateCategoryScore(
  criticalCount: number,
  warningCount: number,
  infoCount: number,
  totalEntitiesCount: number
): number {
  if (totalEntitiesCount === 0 && criticalCount === 0 && warningCount === 0) {
    return 100;
  }

  // Base score 100 with deterministic deductions
  let penalty = criticalCount * 12 + warningCount * 4 + infoCount * 1;
  let score = Math.max(0, 100 - penalty);
  return Math.round(score);
}

/**
 * Runs complete diagnostic engine on retrieved Base.com data.
 */
export function runDiagnostics(input: DiagnosticInputData): DiagnosticScanReport {
  const startedAt = new Date().toISOString();
  const refTime = input.referenceTimestampMs || Date.now();

  // 1. Run all rule modules
  const productIssues = diagnoseProducts(input.productsList, input.productsDataMap);
  const inventoryIssues = diagnoseInventory(input.productsList, input.productsDataMap);
  const orderIssues = diagnoseOrders(input.orders, input.statuses, refTime);

  const allIssues: DiagnosticIssueItem[] = [
    ...productIssues,
    ...inventoryIssues,
    ...orderIssues,
  ];

  // 2. Count severities by category
  const categoriesList: Array<{ category: IssueCategory; title: string }> = [
    { category: "PRODUCT", title: "Katalog i kody SKU/EAN" },
    { category: "INVENTORY", title: "Stany magazynowe" },
    { category: "ORDER", title: "Zamówienia i Płatności" },
    { category: "SHIPPING", title: "Wysyłka i Tracking" },
    { category: "PRICING", title: "Ceny i Podatki" },
  ];

  const categorySummaries: ScanCategorySummary[] = categoriesList.map((cat) => {
    const catIssues = allIssues.filter(
      (i) =>
        i.category === cat.category ||
        (cat.category === "PRODUCT" && i.category === "PRICING") ||
        (cat.category === "ORDER" && i.category === "SHIPPING")
    );

    const critical = catIssues.filter((i) => i.severity === "CRITICAL").length;
    const warning = catIssues.filter((i) => i.severity === "WARNING").length;
    const info = catIssues.filter((i) => i.severity === "INFO").length;

    let entityCount = input.productsList.length;
    if (cat.category === "ORDER" || cat.category === "SHIPPING") {
      entityCount = input.orders.length;
    }

    const score = calculateCategoryScore(critical, warning, info, entityCount);

    return {
      category: cat.category,
      title: cat.title,
      criticalCount: critical,
      warningCount: warning,
      infoCount: info,
      totalIssues: catIssues.length,
      score,
    };
  });

  const totalCritical = allIssues.filter((i) => i.severity === "CRITICAL").length;
  const totalWarning = allIssues.filter((i) => i.severity === "WARNING").length;
  const totalInfo = allIssues.filter((i) => i.severity === "INFO").length;

  // Global Health Score (Weighted)
  const productScore =
    categorySummaries.find((c) => c.category === "PRODUCT")?.score ?? 100;
  const inventoryScore =
    categorySummaries.find((c) => c.category === "INVENTORY")?.score ?? 100;
  const orderScore =
    categorySummaries.find((c) => c.category === "ORDER")?.score ?? 100;

  const weightedScore = Math.round(
    productScore * 0.35 + inventoryScore * 0.3 + orderScore * 0.35
  );
  const healthScore = Math.max(0, Math.min(100, weightedScore));

  const completedAt = new Date().toISOString();

  return {
    shopConnectionId: input.shopConnectionId,
    shopName: input.shopName,
    dataSource: input.dataSource || "BASE_COM_LIVE",
    startedAt,
    completedAt,
    healthScore,
    productsScanned: input.productsList.length,
    ordersScanned: input.orders.length,
    issuesCount: allIssues.length,
    criticalCount: totalCritical,
    warningCount: totalWarning,
    infoCount: totalInfo,
    categories: categorySummaries,
    issues: allIssues,
  };
}
