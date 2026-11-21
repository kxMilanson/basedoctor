"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Info,
  Key,
  Package,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Warehouse,
} from "lucide-react";

function getFriendlyCategoryName(category: string): string {
  switch (category) {
    case "PRODUCT":
    case "PRICING":
      return "Produkty i oferty";
    case "INVENTORY":
      return "Magazyn i stany";
    case "ORDER":
    case "SHIPPING":
      return "Zamówienia i wysyłka";
    default:
      return "Ogólne";
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<any[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [latestScanDetail, setLatestScanDetail] = useState<any | null>(null);
  const [selectedConnId, setSelectedConnId] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [activeScanMsg, setActiveScanMsg] = useState<string | null>(null);
  const [issueFilter, setIssueFilter] = useState<"ALL" | "CRITICAL" | "WARNING" | "INFO">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      const [connRes, scanRes] = await Promise.all([
        fetch("/api/connections").then((res) => (res.ok ? res.json() : { connections: [] })),
        fetch("/api/scans").then((res) => (res.ok ? res.json() : { scans: [] })),
      ]);
      const connList = connRes.connections || [];
      const scanList = scanRes.scans || [];
      setConnections(connList);
      setScans(scanList);

      if (connList.length > 0 && !selectedConnId) {
        setSelectedConnId(connList[0].id);
      }

      if (scanList.length > 0) {
        const detailRes = await fetch(`/api/scans/${scanList[0].id}`);
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          setLatestScanDetail(detailData.report || detailData.scan || null);
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const latestScan = scans[0];
  const previousScan = scans[1];
  const score = latestScan?.healthScore ?? 100;
  const scoreDelta =
    latestScan && previousScan ? latestScan.healthScore - previousScan.healthScore : null;

  const activeConnection =
    connections.find((c) => c.id === selectedConnId) || connections[0] || null;

  const isDemoActive = Boolean(
    (latestScan &&
      (latestScan.shopConnection?.name?.toLowerCase().includes("demo") ||
        latestScan.shopConnection?.name?.toLowerCase().includes("syntetyczn") ||
        latestScan.shopConnection?.name?.toLowerCase().includes("przykładow") ||
        latestScan.id?.includes("demo"))) ||
      (connections.length > 0 &&
        connections.some(
          (c) =>
            c.name?.toLowerCase().includes("demo") ||
            c.name?.toLowerCase().includes("przykładow") ||
            c.maskedToken?.includes("demo")
        ))
  );

  const handleRunQuickScan = async () => {
    if (connections.length === 0) {
      router.push("/connections");
      return;
    }

    const targetConnId = selectedConnId || connections[0].id;
    setScanning(true);
    setActiveScanMsg(
      "Sprawdzamy Twój katalog produktów, stany magazynowe i zamówienia (bez żadnych zmian w sklepie)..."
    );

    try {
      const res = await fetch(`/api/connections/${targetConnId}/scan`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Nie udało się wykonać sprawdzenia sklepu.");
      }
      router.push(`/scans/${data.report.id}`);
    } catch (err: any) {
      alert(err.message);
      setScanning(false);
      setActiveScanMsg(null);
    }
  };

  const handleLoadDemo = async () => {
    setScanning(true);
    setActiveScanMsg("Przygotowujemy przykładowy sklep z gotowymi danymi do podglądu...");
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Sklep Przykładowy (Podgląd)",
          token: "demo_bl_token_8899aabbcc",
          testBeforeSave: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Nie udało się utworzyć sklepu przykładowego.");
      }
      const scanRes = await fetch(`/api/connections/${data.connection.id}/scan`, {
        method: "POST",
      });
      const scanData = await scanRes.json();
      if (!scanRes.ok) {
        throw new Error(scanData.error || "Nie udało się sprawdzić sklepu przykładowego.");
      }
      router.push(`/scans/${scanData.report.id}`);
    } catch (err: any) {
      alert(err.message);
      setScanning(false);
      setActiveScanMsg(null);
    }
  };

  const issues: any[] = useMemo(() => {
    return latestScanDetail?.issues || [];
  }, [latestScanDetail]);

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (issueFilter !== "ALL" && issue.severity !== issueFilter) return false;
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = issue.title?.toLowerCase().includes(q);
        const matchEntity = issue.entityName?.toLowerCase().includes(q);
        const matchIdentifier = issue.affectedIdentifier?.toLowerCase().includes(q);
        const matchDesc = issue.description?.toLowerCase().includes(q);
        return matchTitle || matchEntity || matchIdentifier || matchDesc;
      }
      return true;
    });
  }, [issues, issueFilter, searchQuery]);

  // Aggregate into 3 friendly merchant business areas
  const businessAreas = useMemo(() => {
    const productIssues = issues.filter(
      (i) => i.category === "PRODUCT" || i.category === "PRICING"
    );
    const inventoryIssues = issues.filter((i) => i.category === "INVENTORY");
    const orderIssues = issues.filter(
      (i) => i.category === "ORDER" || i.category === "SHIPPING"
    );

    const calcAreaScore = (list: any[]) => {
      if (list.length === 0) return 100;
      const penalty = list.reduce(
        (acc, item) =>
          acc + (item.severity === "CRITICAL" ? 18 : item.severity === "WARNING" ? 8 : 3),
        0
      );
      return Math.max(15, 100 - penalty);
    };

    return [
      {
        title: "Produkty i oferty",
        subtitle: "Kody SKU, EAN, ceny, wagi i zdjęcia w ofertach",
        icon: ShoppingBag,
        count: productIssues.length,
        urgentCount: productIssues.filter((i) => i.severity === "CRITICAL").length,
        score: calcAreaScore(productIssues),
      },
      {
        title: "Magazyn i dostępność",
        subtitle: "Zgodność stanów i ochrona przed sprzedażą braków",
        icon: Warehouse,
        count: inventoryIssues.length,
        urgentCount: inventoryIssues.filter((i) => i.severity === "CRITICAL").length,
        score: calcAreaScore(inventoryIssues),
      },
      {
        title: "Zamówienia i wysyłka",
        subtitle: "Terminowość nadań, płatności i numery przesyłek",
        icon: Truck,
        count: orderIssues.length,
        urgentCount: orderIssues.filter((i) => i.severity === "CRITICAL").length,
        score: calcAreaScore(orderIssues),
      },
    ];
  }, [issues]);

  const totalIssues =
    (latestScan?.criticalCount ?? 0) +
    (latestScan?.warningCount ?? 0) +
    (latestScan?.infoCount ?? 0);
  const critPct =
    totalIssues > 0 ? Math.round(((latestScan?.criticalCount ?? 0) / totalIssues) * 100) : 0;
  const warnPct =
    totalIssues > 0 ? Math.round(((latestScan?.warningCount ?? 0) / totalIssues) * 100) : 0;
  const infoPct = totalIssues > 0 ? Math.max(0, 100 - critPct - warnPct) : 0;

  const chartPoints = useMemo(() => {
    if (scans.length === 0) return [];
    return [...scans].slice(0, 6).reverse();
  }, [scans]);

  const healthHeadline =
    score >= 80
      ? "Twój sklep działa stabilnie i bezpiecznie"
      : score >= 50
      ? "Sklep działa, ale kilka spraw wymaga uporządkowania"
      : "Uwaga — wykryliśmy błędy, które mogą blokować sprzedaż";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF8F5] text-[#18181B]">
      {/* Persistent Left Sidebar */}
      <AppSidebar
        connectionsCount={connections.length}
        activeStoreName={
          activeConnection?.name ||
          latestScan?.shopConnection?.name ||
          "Brak połączonego sklepu"
        }
        isDemo={isDemoActive}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean Top Header */}
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-8 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E4DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-[#18181B] truncate">
              Przegląd kondycji sklepu
            </h1>
            {isDemoActive && (
              <span className="pill-demo hidden sm:inline-flex">
                Sklep przykładowy
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {connections.length > 1 && (
              <select
                value={selectedConnId}
                onChange={(e) => setSelectedConnId(e.target.value)}
                aria-label="Wybierz sklep"
                className="px-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs font-medium text-[#18181B] focus:outline-none focus:border-[#0F766E]"
              >
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            <Link href="/connections" className="btn-studio-secondary hidden sm:inline-flex">
              <Store className="w-3.5 h-3.5 text-[#71717A]" />
              <span>Sklepy ({connections.length})</span>
            </Link>

            <button
              onClick={handleRunQuickScan}
              disabled={scanning || connections.length === 0}
              className="btn-studio-brand cursor-pointer"
            >
              {scanning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white" />
              )}
              <span>{scanning ? "Sprawdzanie..." : "Sprawdź sklep teraz"}</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Active Scan Banner */}
          {activeScanMsg && (
            <div className="p-4 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#134E4A] text-xs flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-[#0F766E] animate-spin shrink-0" />
              <span className="font-medium">{activeScanMsg}</span>
            </div>
          )}

          {/* Friendly Demo Notice */}
          {isDemoActive && (
            <div className="p-4 rounded-2xl bg-white border border-[#99F6E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="pill-demo shrink-0">Tryb przykładowy</span>
                <p className="text-xs text-[#3F3F46]">
                  Oglądasz symulację sklepu, aby zobaczyć jak BaseDoctor wskazuje problemy i podpowiada rozwiązania.
                </p>
              </div>
              <Link
                href="/connections"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:text-[#115E59] shrink-0"
              >
                <span>Podłącz swój sklep Base.com</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="space-y-4">
              <div className="h-48 rounded-2xl bg-white border border-[#E8E4DC] p-6 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-white border border-[#E8E4DC] p-5 animate-pulse" />
                ))}
              </div>
            </div>
          ) : connections.length === 0 ? (
            /* Warm Onboarding Empty State */
            <div className="studio-card p-8 sm:p-12 text-center">
              <div className="max-w-lg mx-auto space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight text-[#18181B]">
                    Sprawdź, czy w Twoim sklepie wszystko działa jak należy
                  </h2>
                  <p className="text-sm text-[#52525B] leading-relaxed">
                    Podłącz swój sklep w Base.com, aby w 30 sekund wykryć błędy w produktach,
                    braki w stanach magazynowych i opóźnione wysyłki. BaseDoctor działa tylko
                    w trybie podglądu — nigdy niczego nie zmienia w Twoim sklepie.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link href="/connections" className="btn-studio-brand px-5 py-3">
                    <Key className="w-4 h-4" />
                    <span>Połącz swój sklep Base.com</span>
                  </Link>
                  <button
                    onClick={handleLoadDemo}
                    disabled={scanning}
                    className="btn-studio-secondary px-5 py-3 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#0F766E]" />
                    <span>Zobacz na sklepie przykładowym</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 1. HERO STORE HEALTH BANNER — Answers: "Is my store operating correctly?" */}
              <section className="studio-card p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={
                          score >= 80
                            ? "pill-healthy"
                            : score >= 50
                            ? "pill-warning"
                            : "pill-urgent"
                        }
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            score >= 80
                              ? "bg-[#10B981]"
                              : score >= 50
                              ? "bg-[#D97706]"
                              : "bg-[#E11D48]"
                          }`}
                        />
                        {score >= 80
                          ? "Sklep w dobrej kondycji"
                          : score >= 50
                          ? "Wymaga kilku poprawek"
                          : "Pilne sprawy do poprawy"}
                      </span>
                      {latestScan && (
                        <span className="text-xs text-[#71717A]">
                          Ostatnie sprawdzenie:{" "}
                          {new Date(
                            latestScan.completedAt || latestScan.startedAt
                          ).toLocaleString("pl-PL")}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B]">
                        {latestScan ? healthHeadline : "Sklep gotowy do pierwszego sprawdzenia"}
                      </h2>
                      <p className="text-sm text-[#52525B] leading-relaxed max-w-2xl">
                        {latestScan ? (
                          <>
                            Przejrzeliśmy{" "}
                            <strong className="font-semibold text-[#18181B]">
                              {latestScan.productsScanned} produktów
                            </strong>{" "}
                            oraz{" "}
                            <strong className="font-semibold text-[#18181B]">
                              {latestScan.ordersScanned} zamówień
                            </strong>
                            .{" "}
                            {latestScan.criticalCount > 0 ? (
                              <>
                                Znaleźliśmy{" "}
                                <strong className="text-[#BE123C]">
                                  {latestScan.criticalCount} pilnych spraw
                                </strong>
                                , które mogą blokować sprzedaż lub wysyłkę, oraz{" "}
                                <strong className="text-[#B45309]">
                                  {latestScan.warningCount} rzeczy do poprawy
                                </strong>
                                .
                              </>
                            ) : (
                              "Nie wykryliśmy żadnych pilnych błędów blokujących sprzedaż."
                            )}
                          </>
                        ) : (
                          "Kliknij przycisk poniżej, aby sprawdzić produkty, magazyn i zamówienia w połączonym sklepie."
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={handleRunQuickScan}
                        disabled={scanning}
                        className="btn-studio-primary cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${scanning ? "animate-spin" : ""}`} />
                        <span>{scanning ? "Sprawdzanie..." : "Sprawdź sklep ponownie"}</span>
                      </button>

                      {latestScan && (
                        <>
                          <a
                            href={`/api/scans/${latestScan.id}/pdf`}
                            download
                            className="btn-studio-secondary"
                          >
                            <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                            <span>Pobierz raport PDF</span>
                          </a>
                          <Link
                            href={`/scans/${latestScan.id}`}
                            className="text-xs font-semibold text-[#0F766E] hover:text-[#115E59] px-2 py-1.5 inline-flex items-center gap-1 transition"
                          >
                            <span>Otwórz pełny raport</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Visual Score Meter */}
                  <div className="lg:col-span-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#52525B]">
                        Ogólna kondycja sklepu
                      </span>
                      {scoreDelta !== null && (
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            scoreDelta >= 0
                              ? "bg-[#ECFDF5] text-[#047857]"
                              : "bg-[#FFF1F2] text-[#BE123C]"
                          }`}
                        >
                          {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pkt
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline gap-1.5">
                      <span className="text-5xl font-bold tracking-tight text-[#18181B] tabular-nums">
                        {latestScan ? score : "—"}
                      </span>
                      <span className="text-lg font-medium text-[#71717A]">/ 100</span>
                    </div>

                    {/* 3-Segment Health Breakdown Bar */}
                    {latestScan && (
                      <div className="space-y-2 pt-2 border-t border-[#E8E4DC]">
                        <div className="w-full h-2.5 rounded-full bg-[#EAE6DF] overflow-hidden flex gap-0.5">
                          {critPct > 0 && (
                            <div
                              className="h-full bg-[#E11D48]"
                              style={{ width: `${critPct}%` }}
                              title={`Pilne: ${latestScan.criticalCount}`}
                            />
                          )}
                          {warnPct > 0 && (
                            <div
                              className="h-full bg-[#D97706]"
                              style={{ width: `${warnPct}%` }}
                              title={`Warto poprawić: ${latestScan.warningCount}`}
                            />
                          )}
                          {infoPct > 0 && (
                            <div
                              className="h-full bg-[#0F766E]"
                              style={{ width: `${infoPct}%` }}
                              title={`Wskazówki: ${latestScan.infoCount}`}
                            />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#52525B]">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#E11D48]" />
                            Pilne: <strong className="text-[#18181B]">{latestScan.criticalCount}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                            Do poprawy: <strong className="text-[#18181B]">{latestScan.warningCount}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                            Wskazówki: <strong className="text-[#18181B]">{latestScan.infoCount}</strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* 2. 3 BUSINESS AREA CARDS — Answers: "What needs my attention?" */}
              {latestScan && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[#18181B]">
                      Stan trzech głównych obszarów sklepu
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {businessAreas.map((area) => {
                      const Icon = area.icon;
                      const statusPill =
                        area.urgentCount > 0
                          ? { cls: "pill-urgent", label: "Wymaga działania" }
                          : area.count > 0
                          ? { cls: "pill-warning", label: "Warto sprawdzić" }
                          : { cls: "pill-healthy", label: "Wszystko dobrze" };

                      return (
                        <div key={area.title} className="studio-card p-5 space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-9 h-9 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-center text-[#0F766E]">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className={statusPill.cls}>{statusPill.label}</span>
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold text-[#18181B]">{area.title}</h3>
                            <p className="text-xs text-[#71717A] mt-0.5 leading-relaxed">
                              {area.subtitle}
                            </p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#F1EFEA]">
                            <div className="w-full h-1.5 bg-[#F3F0EA] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  area.urgentCount > 0
                                    ? "bg-[#E11D48]"
                                    : area.count > 0
                                    ? "bg-[#D97706]"
                                    : "bg-[#10B981]"
                                }`}
                                style={{ width: `${area.score}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[#52525B]">
                                {area.count === 0
                                  ? "Brak wykrytych problemów"
                                  : area.count === 1
                                  ? "1 sprawa do przejrzenia"
                                  : `${area.count} spraw do przejrzenia`}
                              </span>
                              <span className="font-semibold text-[#18181B] tabular-nums">
                                {area.score}%
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 3. ACTIONABLE RECOMMENDATIONS — Answers: "What should I do next?" */}
              {latestScan && (
                <section className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-base font-bold text-[#18181B]">
                        Co warto teraz naprawić w sklepie
                      </h2>
                      <p className="text-xs text-[#71717A]">
                        Najważniejsze sprawy ułożone od tych, które najbardziej wpływają na sprzedaż i wysyłkę.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex p-1 rounded-xl bg-[#F3F0EA] border border-[#E8E4DC] text-xs">
                        {(
                          [
                            { key: "ALL", label: "Wszystkie" },
                            { key: "CRITICAL", label: `Pilne (${latestScan.criticalCount})` },
                            { key: "WARNING", label: `Do poprawy (${latestScan.warningCount})` },
                            { key: "INFO", label: "Wskazówki" },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setIssueFilter(tab.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                              issueFilter === tab.key
                                ? "bg-white text-[#18181B] font-semibold shadow-xs"
                                : "text-[#52525B] hover:text-[#18181B]"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Szukaj produktu lub zamówienia..."
                          className="pl-8 pr-3 py-2 rounded-xl bg-white border border-[#E8E4DC] text-xs text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] w-52 sm:w-60"
                        />
                      </div>
                    </div>
                  </div>

                  {filteredIssues.length === 0 ? (
                    <div className="studio-card p-10 text-center space-y-2">
                      <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
                      <p className="text-sm font-semibold text-[#18181B]">
                        Brak spraw pasujących do wybranych filtrów
                      </p>
                      <p className="text-xs text-[#71717A]">
                        Zmień filtr powyżej lub uruchom kolejne sprawdzenie sklepu.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredIssues.slice(0, 5).map((issue, idx) => {
                        const isUrgent = issue.severity === "CRITICAL";
                        const isWarning = issue.severity === "WARNING";

                        return (
                          <div
                            key={issue.id || idx}
                            className="studio-card-hover p-5 sm:p-6 space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={
                                    isUrgent
                                      ? "pill-urgent"
                                      : isWarning
                                      ? "pill-warning"
                                      : "pill-neutral"
                                  }
                                >
                                  {isUrgent
                                    ? "Pilne — blokuje sprzedaż"
                                    : isWarning
                                    ? "Warto poprawić"
                                    : "Wskazówka"}
                                </span>
                                <span className="pill-neutral">
                                  {getFriendlyCategoryName(issue.category)}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-xs text-[#71717A]">
                                {(issue.affectedIdentifier || issue.entityName) && (
                                  <span className="font-mono text-[11px] bg-[#FAF8F5] border border-[#E8E4DC] text-[#18181B] px-2.5 py-0.5 rounded-full">
                                    {issue.entityName || issue.affectedIdentifier}
                                  </span>
                                )}
                                {issue.estimatedFixTime && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#52525B]">
                                    <Clock className="w-3 h-3 text-[#0F766E]" />
                                    Zajmie ok. {issue.estimatedFixTime}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div>
                              <h3 className="text-sm sm:text-base font-semibold text-[#18181B]">
                                {issue.title}
                              </h3>
                              {issue.description && (
                                <p className="text-xs text-[#52525B] mt-1 leading-relaxed">
                                  {issue.description}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                              <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                                <div className="text-[11px] font-semibold text-[#B45309] flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                  <span>Co to oznacza dla sprzedaży</span>
                                </div>
                                <p className="text-xs text-[#3F3F46] leading-relaxed">
                                  {issue.businessImpact ||
                                    "Może obniżać widoczność ofert lub wydłużać obsługę zamówień."}
                                </p>
                              </div>

                              <div className="p-3.5 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1">
                                <div className="text-[11px] font-semibold text-[#0F766E] flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                  <span>Co należy zrobić</span>
                                </div>
                                <p className="text-xs text-[#134E4A] leading-relaxed">
                                  {issue.suggestedFix ||
                                    "Uzupełnij brakujące dane w karcie produktu lub zamówienia w Base.com."}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-[#71717A]">
                          Pokazujemy {Math.min(5, filteredIssues.length)} z {filteredIssues.length} spraw
                        </span>
                        <Link
                          href={`/scans/${latestScan.id}`}
                          className="btn-studio-secondary"
                        >
                          <span>Zobacz wszystkie sprawy ({issues.length})</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* 4. SECONDARY SECTION: STORE HEALTH HISTORY & TREND */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
                {/* Visual Health Trend */}
                <div className="lg:col-span-6 studio-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-[#18181B]">
                        Jak zmieniała się kondycja sklepu
                      </h2>
                      <p className="text-xs text-[#71717A]">
                        Wyniki ostatnich sprawdzeń (im wyższy słupek, tym zdrowszy sklep)
                      </p>
                    </div>
                  </div>

                  {chartPoints.length > 0 ? (
                    <div className="h-44 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] p-4 flex items-end justify-between gap-3">
                      {chartPoints.map((pt, idx) => {
                        const barHeight = Math.max(18, Math.min(100, pt.healthScore));
                        const isLatest = idx === chartPoints.length - 1;
                        return (
                          <div
                            key={pt.id}
                            className="flex-1 flex flex-col items-center justify-end h-full"
                          >
                            <span className="text-xs font-semibold text-[#18181B] mb-1.5 tabular-nums">
                              {pt.healthScore}%
                            </span>
                            <div className="w-full max-w-[44px] h-24 bg-[#EAE6DF] rounded-xl flex items-end overflow-hidden p-0.5">
                              <div
                                className={`w-full rounded-lg transition-all duration-300 ${
                                  isLatest
                                    ? "bg-[#0F766E]"
                                    : pt.healthScore >= 80
                                    ? "bg-[#10B981]/80"
                                    : "bg-[#71717A]/60"
                                }`}
                                style={{ height: `${barHeight}%` }}
                              />
                            </div>
                            <span className="mt-2 text-[11px] text-[#71717A] tabular-nums">
                              {new Date(pt.completedAt || pt.startedAt).toLocaleDateString(
                                "pl-PL",
                                { day: "2-digit", month: "2-digit" }
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-44 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-center text-xs text-[#71717A]">
                      Wykres pojawi się po wykonaniu pierwszego sprawdzenia sklepu.
                    </div>
                  )}
                </div>

                {/* Recent Checks List */}
                <div className="lg:col-span-6 studio-card p-6 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-[#18181B]">
                        Ostatnie raporty
                      </h2>
                      <p className="text-xs text-[#71717A]">
                        Poprzednie sprawdzenia zapisane na Twoim koncie
                      </p>
                    </div>
                    <Link
                      href="/scans"
                      className="text-xs font-semibold text-[#0F766E] hover:underline"
                    >
                      Wszystkie ({scans.length})
                    </Link>
                  </div>

                  {scans.length === 0 ? (
                    <div className="py-10 text-center text-xs text-[#71717A]">
                      Brak wcześniejszych raportów.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F1EFEA]">
                      {scans.slice(0, 4).map((scan) => (
                        <div
                          key={scan.id}
                          className="py-3 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold tabular-nums shrink-0 ${
                                scan.healthScore >= 80
                                  ? "bg-[#ECFDF5] text-[#047857]"
                                  : scan.healthScore >= 50
                                  ? "bg-[#FFFBEB] text-[#B45309]"
                                  : "bg-[#FFF1F2] text-[#BE123C]"
                              }`}
                            >
                              {scan.healthScore}%
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-[#18181B] truncate">
                                {scan.shopConnection?.name || "Sklep Base.com"}
                              </div>
                              <div className="text-[11px] text-[#71717A]">
                                {new Date(
                                  scan.completedAt || scan.startedAt
                                ).toLocaleDateString("pl-PL")}{" "}
                                • {scan.issuesCount} spraw
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <a
                              href={`/api/scans/${scan.id}/pdf`}
                              download
                              className="p-2 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF8F5] transition"
                              title="Pobierz PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <Link
                              href={`/scans/${scan.id}`}
                              className="btn-studio-secondary py-1.5 px-3 text-[11px]"
                            >
                              Otwórz
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
