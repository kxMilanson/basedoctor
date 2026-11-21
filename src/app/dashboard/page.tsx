"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Database,
  Download,
  FileText,
  Filter,
  Info,
  Key,
  Layers,
  Lock,
  Package,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  TrendingUp,
  Wrench,
} from "lucide-react";

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
          setLatestScanDetail(detailData.report || null);
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

  const isDemoActive =
    (latestScan &&
      (latestScan.shopConnection?.name?.toLowerCase().includes("demo") ||
        latestScan.shopConnection?.name?.toLowerCase().includes("syntetyczn") ||
        latestScan.id?.includes("demo"))) ||
    (connections.length > 0 &&
      connections.some(
        (c) => c.name?.toLowerCase().includes("demo") || c.maskedToken?.includes("demo")
      ));

  const handleRunQuickScan = async () => {
    if (connections.length === 0) {
      router.push("/connections");
      return;
    }

    const targetConnId = selectedConnId || connections[0].id;
    setScanning(true);
    setActiveScanMsg(
      "Pobieranie katalogu i zamówień z Base.com (Read-Only) oraz ewaluacja 15 reguł diagnostycznych..."
    );

    try {
      const res = await fetch(`/api/connections/${targetConnId}/scan`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd wykonania skanu.");
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
    setActiveScanMsg("Inicjalizacja izolowanego środowiska demonstracyjnego i audytu...");
    try {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Sklep Demonstracyjny (Dane Syntetyczne)",
          token: "demo_bl_token_8899aabbcc",
          testBeforeSave: false,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Błąd tworzenia demo.");
      }
      const scanRes = await fetch(`/api/connections/${data.connection.id}/scan`, {
        method: "POST",
      });
      const scanData = await scanRes.json();
      if (!scanRes.ok) {
        throw new Error(scanData.error || "Błąd skanowania demo.");
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
        const matchId = issue.entityId?.toLowerCase().includes(q);
        const matchCode = issue.code?.toLowerCase().includes(q);
        return matchTitle || matchEntity || matchId || matchCode;
      }
      return true;
    });
  }, [issues, issueFilter, searchQuery]);

  // Compute severity distribution and chart series
  const totalIssues =
    (latestScan?.criticalCount ?? 0) +
    (latestScan?.warningCount ?? 0) +
    (latestScan?.infoCount ?? 0);
  const critPct = totalIssues > 0 ? Math.round(((latestScan?.criticalCount ?? 0) / totalIssues) * 100) : 0;
  const warnPct = totalIssues > 0 ? Math.round(((latestScan?.warningCount ?? 0) / totalIssues) * 100) : 0;
  const infoPct = totalIssues > 0 ? Math.max(0, 100 - critPct - warnPct) : 0;

  // Trend chart data points (up to 7 most recent scans in chronological order)
  const chartPoints = useMemo(() => {
    if (scans.length === 0) return [];
    return [...scans].slice(0, 7).reverse();
  }, [scans]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F7F4] text-[#111315]">
      {/* Persistent Left Sidebar */}
      <AppSidebar
        connectionsCount={connections.length}
        activeStoreName={
          activeConnection?.name ||
          latestScan?.shopConnection?.name ||
          "Brak podłączonego sklepu"
        }
        isDemo={Boolean(isDemoActive)}
      />

      {/* Main Workspace Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Workspace Header Bar */}
        <header className="sticky top-0 z-30 h-14 px-4 sm:px-8 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#E5E3DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-medium text-[#5C6168] hidden sm:inline">
              Diagnostyka
            </span>
            <span className="text-[#CFCBC2] hidden sm:inline">/</span>
            <h1 className="text-xs sm:text-sm font-semibold text-[#111315] truncate">
              Pulpit Diagnostyczny Sklepu
            </h1>
            {isDemoActive ? (
              <span className="badge-demo font-mono text-[10px]">
                TRYB DEMO • DANE SYNTETYCZNE
              </span>
            ) : (
              <span className="badge-active font-mono text-[10px] hidden md:inline-flex">
                <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                READ-ONLY ZWERYFIKOWANY
              </span>
            )}
          </div>

          {/* Right Controls: Store Picker + Scan CTA */}
          <div className="flex items-center gap-2.5 shrink-0">
            {connections.length > 1 && (
              <select
                value={selectedConnId}
                onChange={(e) => setSelectedConnId(e.target.value)}
                aria-label="Wybierz sklep do skanowania"
                className="px-2.5 py-1.5 rounded-md bg-[#FFFFFF] border border-[#E5E3DC] text-xs font-medium text-[#111315] focus:outline-none focus:border-[#0052FF]"
              >
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            <Link href="/connections" className="btn-secondary-surface hidden sm:inline-flex">
              <Key className="w-3.5 h-3.5 text-[#5C6168]" />
              <span>Klucze API ({connections.length})</span>
            </Link>

            <button
              onClick={handleRunQuickScan}
              disabled={scanning || connections.length === 0}
              className="btn-primary-cobalt cursor-pointer"
            >
              {scanning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-white" />
              )}
              <span>{scanning ? "Trwa audyt..." : "Uruchom Audyt"}</span>
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Active Scan Progress Banner */}
          {activeScanMsg && (
            <div className="p-3.5 rounded-lg bg-[#EDF2FF] border border-[#C7D7FE] text-[#0A2158] text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-[#0052FF] animate-spin shrink-0" />
                <span className="font-medium">{activeScanMsg}</span>
              </div>
              <span className="font-mono text-[11px] text-[#0040CC] font-semibold">
                connector.php • TLS 1.3
              </span>
            </div>
          )}

          {/* Demo Telemetry Notice Bar */}
          {isDemoActive && (
            <div className="px-4 py-3 rounded-lg bg-[#FFFFFF] border border-[#C7D7FE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#EDF2FF] text-[#0052FF] border border-[#C7D7FE]">
                  ŚRODOWISKO SYNTETYCZNE
                </span>
                <p className="text-xs text-[#373B40]">
                  Analizujesz wzorcowy zbiór diagnostyczny prezentujący 15 reguł walidacyjnych.
                  Żadne dane produkcyjne nie są modyfikowane.
                </p>
              </div>
              <Link
                href="/connections"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0052FF] hover:text-[#0040CC] shrink-0"
              >
                <span>Podłącz produkcyjny token Base.com</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-36 rounded-xl bg-[#FFFFFF] border border-[#E5E3DC] p-5 animate-pulse flex flex-col justify-between"
                >
                  <div className="h-3 w-28 bg-[#EAE7E0] rounded" />
                  <div className="h-8 w-20 bg-[#EAE7E0] rounded" />
                  <div className="h-2.5 w-full bg-[#F2F0EB] rounded" />
                </div>
              ))}
            </div>
          ) : connections.length === 0 ? (
            /* Precision Onboarding Empty State */
            <div className="pci-card p-8 sm:p-10">
              <div className="max-w-2xl mx-auto text-center space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4F2ED] border border-[#E5E3DC] text-[11px] font-mono font-semibold text-[#373B40]">
                  <Lock className="w-3 h-3 text-[#0052FF]" />
                  ARCHITEKTURA ZERO-WRITE • TYLKO DO ODCZYTU
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold tracking-tight text-[#111315]">
                    Skonfiguruj pierwsze źródło diagnostyczne Base.com
                  </h2>
                  <p className="text-xs sm:text-sm text-[#5C6168] leading-relaxed">
                    Podłącz swój klucz API Base.com (zaszyfrowany algorytmem AES-256-GCM) lub uruchom
                    natychmiastowy audyt na danych syntetycznych, aby zweryfikować działanie 15 reguł
                    integralności katalogu, stanów magazynowych i zamówień.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link href="/connections" className="btn-primary-cobalt px-5 py-2.5">
                    <Key className="w-3.5 h-3.5" />
                    <span>Podłącz sklep Base.com</span>
                  </Link>
                  <button
                    onClick={handleLoadDemo}
                    disabled={scanning}
                    className="btn-secondary-surface px-5 py-2.5 cursor-pointer"
                  >
                    <Database className="w-3.5 h-3.5 text-[#0052FF]" />
                    <span>Załaduj sklep demonstracyjny (1-klik)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* ROW 1: 4-COLUMN ARCHITECTURAL KPI MATRIX */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* KPI 1: Health Score */}
                <div className="pci-card p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="pci-eyebrow">Indeks Integralności</span>
                      <h2 className="text-xs font-semibold text-[#111315] mt-0.5">
                        Health Score Katalogu
                      </h2>
                    </div>
                    <span
                      className={
                        score >= 80
                          ? "badge-active"
                          : score >= 50
                          ? "badge-warning"
                          : "badge-critical"
                      }
                    >
                      {score >= 80 ? "Optymalny" : score >= 50 ? "Wymaga uwagi" : "Krytyczny"}
                    </span>
                  </div>

                  <div className="my-4 flex items-baseline justify-between">
                    <div className="font-mono text-4xl font-bold tracking-tight text-[#111315] tabular-nums">
                      {latestScan ? `${score}%` : "—"}
                    </div>
                    {scoreDelta !== null && (
                      <span
                        className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                          scoreDelta >= 0
                            ? "bg-[#ECFDF5] text-[#046C4E]"
                            : "bg-[#FEF2F2] text-[#B91C1C]"
                        }`}
                      >
                        {scoreDelta >= 0 ? `+${scoreDelta}%` : `${scoreDelta}%`} vs poprz.
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 pt-3 border-t border-[#EFECE6]">
                    <div className="w-full h-1.5 bg-[#F2F0EB] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          score >= 80
                            ? "bg-[#059669]"
                            : score >= 50
                            ? "bg-[#D97706]"
                            : "bg-[#DC2626]"
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#5C6168]">
                      <span>15 reguł deterministycznych</span>
                      {latestScan && (
                        <span className="font-mono">
                          {new Date(
                            latestScan.completedAt || latestScan.startedAt
                          ).toLocaleDateString("pl-PL")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* KPI 2: Critical Blockers */}
                <div className="pci-card p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="pci-eyebrow text-[#B91C1C]">Blokady Operacyjne</span>
                      <h2 className="text-xs font-semibold text-[#111315] mt-0.5">
                        Błędy Krytyczne (P1)
                      </h2>
                    </div>
                    <div className="w-7 h-7 rounded-md bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#B91C1C]">
                      <AlertOctagon className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="my-4 flex items-baseline justify-between">
                    <div className="font-mono text-4xl font-bold tracking-tight text-[#111315] tabular-nums">
                      {latestScan?.criticalCount ?? 0}
                    </div>
                    <span className="text-[11px] font-mono text-[#B91C1C] font-semibold">
                      {critPct}% wszystkich wad
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#EFECE6] flex items-center justify-between text-[11px] text-[#5C6168]">
                    <span>Duplikaty SKU, stany &lt; 0, brak listu</span>
                    <button
                      onClick={() => setIssueFilter("CRITICAL")}
                      className="font-semibold text-[#0052FF] hover:underline cursor-pointer"
                    >
                      Filtruj P1 →
                    </button>
                  </div>
                </div>

                {/* KPI 3: Operational Warnings */}
                <div className="pci-card p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="pci-eyebrow text-[#B45309]">Ryzyko Marży i SLA</span>
                      <h2 className="text-xs font-semibold text-[#111315] mt-0.5">
                        Ostrzeżenia (P2) i Info
                      </h2>
                    </div>
                    <div className="w-7 h-7 rounded-md bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#B45309]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="my-4 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-4xl font-bold tracking-tight text-[#111315] tabular-nums">
                        {latestScan?.warningCount ?? 0}
                      </span>
                      <span className="text-xs font-mono text-[#5C6168]">
                        + {latestScan?.infoCount ?? 0} info
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-[#B45309] font-semibold">
                      {warnPct}% udziału
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#EFECE6] flex items-center justify-between text-[11px] text-[#5C6168]">
                    <span>Braki EAN, waga 0 kg, rozjazd WMS</span>
                    <button
                      onClick={() => setIssueFilter("WARNING")}
                      className="font-semibold text-[#0052FF] hover:underline cursor-pointer"
                    >
                      Filtruj P2 →
                    </button>
                  </div>
                </div>

                {/* KPI 4: Catalog & Order Throughput */}
                <div className="pci-card p-5 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="pci-eyebrow">Wolumen Audytu</span>
                      <h2 className="text-xs font-semibold text-[#111315] mt-0.5">
                        Przeskanowane Obiekty
                      </h2>
                    </div>
                    <div className="w-7 h-7 rounded-md bg-[#EDF2FF] border border-[#C7D7FE] flex items-center justify-center text-[#0052FF]">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="my-4 grid grid-cols-2 gap-3">
                    <div className="p-2 rounded-md bg-[#FAF9F6] border border-[#EFECE6]">
                      <div className="text-[10px] font-mono uppercase text-[#5C6168]">
                        Produkty SKU
                      </div>
                      <div className="font-mono text-xl font-bold text-[#111315] mt-0.5 tabular-nums">
                        {latestScan?.productsScanned ?? 0}
                      </div>
                    </div>
                    <div className="p-2 rounded-md bg-[#FAF9F6] border border-[#EFECE6]">
                      <div className="text-[10px] font-mono uppercase text-[#5C6168]">
                        Zamówienia
                      </div>
                      <div className="font-mono text-xl font-bold text-[#111315] mt-0.5 tabular-nums">
                        {latestScan?.ordersScanned ?? 0}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EFECE6] flex items-center justify-between text-[11px]">
                    {latestScan ? (
                      <>
                        <a
                          href={`/api/scans/${latestScan.id}/pdf`}
                          download
                          className="font-semibold text-[#111315] hover:text-[#0052FF] inline-flex items-center gap-1 transition"
                        >
                          <Download className="w-3 h-3 text-[#0052FF]" />
                          <span>Eksportuj Raport PDF</span>
                        </a>
                        <Link
                          href={`/scans/${latestScan.id}`}
                          className="font-semibold text-[#0052FF] hover:underline"
                        >
                          Pełny raport →
                        </Link>
                      </>
                    ) : (
                      <span className="text-[#868C94]">Brak wykonanego skanu</span>
                    )}
                  </div>
                </div>
              </div>

              {/* ROW 2: ANALYTICAL CHARTS & DOMAIN TELEMETRY (7:5 SPLIT) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left 7 Cols: Analytical Trajectory & Severity Distribution Chart */}
                <div className="lg:col-span-7 pci-card p-5 flex flex-col justify-between space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EFECE6] pb-4">
                    <div>
                      <span className="pci-eyebrow">Telemetria Jakości Danych</span>
                      <h2 className="text-sm font-semibold text-[#111315] mt-0.5">
                        Trajektoria Health Score i Struktura Nieprawidłowości
                      </h2>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="inline-flex items-center gap-1.5 text-[#373B40]">
                        <span className="w-2 h-2 rounded-xs bg-[#0052FF]" />
                        Health Score (%)
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[#5C6168]">
                        <span className="w-2 h-2 rounded-xs bg-[#DC2626]" />
                        Krytyczne
                      </span>
                    </div>
                  </div>

                  {/* SVG Analytical Bar/Line Hybrid Visualization */}
                  <div className="pt-1">
                    {chartPoints.length > 0 ? (
                      <div className="space-y-4">
                        <div className="h-44 w-full bg-[#FAF9F6] border border-[#EFECE6] rounded-lg p-4 flex items-end justify-between gap-3 relative">
                          {/* Horizontal Reference Grid Lines */}
                          <div className="absolute inset-x-4 top-4 border-b border-dashed border-[#E5E3DC] flex justify-between text-[9px] font-mono text-[#868C94] pb-0.5">
                            <span>100% (Wzorzec)</span>
                            <span>SLA Target: 85%</span>
                          </div>
                          <div className="absolute inset-x-4 top-1/2 border-b border-dashed border-[#E5E3DC] text-[9px] font-mono text-[#868C94]" />

                          {chartPoints.map((pt, idx) => {
                            const barHeight = Math.max(14, Math.min(100, pt.healthScore));
                            const isLatest = idx === chartPoints.length - 1;
                            return (
                              <div
                                key={pt.id}
                                className="flex-1 flex flex-col items-center justify-end h-full z-10 group"
                              >
                                <div className="text-[10px] font-mono font-bold text-[#111315] mb-1">
                                  {pt.healthScore}%
                                </div>
                                <div className="w-full max-w-[44px] bg-[#EAE7E0] rounded-t h-28 flex items-end overflow-hidden p-0.5">
                                  <div
                                    className={`w-full rounded-t transition-all duration-300 ${
                                      isLatest
                                        ? "bg-[#0052FF]"
                                        : pt.healthScore >= 80
                                        ? "bg-[#059669]/80"
                                        : "bg-[#373B40]/70"
                                    }`}
                                    style={{ height: `${barHeight}%` }}
                                  />
                                </div>
                                <div className="mt-2 text-[10px] font-mono text-[#5C6168] truncate max-w-[72px]">
                                  {new Date(pt.completedAt || pt.startedAt).toLocaleDateString(
                                    "pl-PL",
                                    { day: "2-digit", month: "2-digit" }
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Stacked Severity Distribution Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#373B40]">
                              Rozkład wykrytych nieprawidłowości wg klasy ryzyka
                            </span>
                            <span className="font-mono text-xs text-[#5C6168]">
                              Łącznie: <strong className="text-[#111315]">{totalIssues}</strong>
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-[#F2F0EB] overflow-hidden flex gap-0.5 p-0.5 border border-[#E5E3DC]">
                            {critPct > 0 && (
                              <div
                                className="h-full bg-[#DC2626] rounded-l-full"
                                style={{ width: `${critPct}%` }}
                                title={`Krytyczne: ${critPct}%`}
                              />
                            )}
                            {warnPct > 0 && (
                              <div
                                className="h-full bg-[#D97706]"
                                style={{ width: `${warnPct}%` }}
                                title={`Ostrzeżenia: ${warnPct}%`}
                              />
                            )}
                            {infoPct > 0 && (
                              <div
                                className="h-full bg-[#0052FF] rounded-r-full"
                                style={{ width: `${infoPct}%` }}
                                title={`Informacyjne: ${infoPct}%`}
                              />
                            )}
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#5C6168]">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                              Krytyczne: {latestScan?.criticalCount ?? 0} ({critPct}%)
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                              Ostrzeżenia: {latestScan?.warningCount ?? 0} ({warnPct}%)
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-[#0052FF]" />
                              Informacyjne: {latestScan?.infoCount ?? 0} ({infoPct}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 flex items-center justify-center text-xs text-[#868C94] font-mono">
                        Uruchom pierwszy skan, aby wygenerować wykres trajektorii.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right 5 Cols: Domain Health Matrix */}
                <div className="lg:col-span-5 pci-card p-5 flex flex-col justify-between space-y-4">
                  <div className="border-b border-[#EFECE6] pb-4 flex items-center justify-between">
                    <div>
                      <span className="pci-eyebrow">Macierz Domenowa</span>
                      <h2 className="text-sm font-semibold text-[#111315] mt-0.5">
                        Kondycja Obszarów Operacyjnych
                      </h2>
                    </div>
                    <span className="text-[11px] font-mono text-[#5C6168]">4 domeny</span>
                  </div>

                  {latestScan?.summary && (latestScan.summary as any[]).length > 0 ? (
                    <div className="space-y-3 flex-1 flex flex-col justify-center">
                      {(latestScan.summary as any[]).map((cat, idx) => {
                        const isHealthy = cat.score >= 80;
                        const isWarn = cat.score >= 50 && cat.score < 80;
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-[#FAF9F6] border border-[#EFECE6] space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-[#111315]">{cat.title}</span>
                              <div className="flex items-center gap-2">
                                {cat.criticalCount > 0 && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
                                    {cat.criticalCount} kryt.
                                  </span>
                                )}
                                <span className="font-mono font-bold text-[#111315] tabular-nums">
                                  {cat.score}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-[#EAE7E0] h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isHealthy
                                    ? "bg-[#059669]"
                                    : isWarn
                                    ? "bg-[#D97706]"
                                    : "bg-[#DC2626]"
                                }`}
                                style={{ width: `${cat.score}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[#5C6168]">
                              <span>Wykryte nieprawidłowości: {cat.totalIssues}</span>
                              <span className="font-mono text-[10px]">
                                {cat.warningCount > 0 ? `${cat.warningCount} ostrz.` : "Brak ostrzeżeń"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-xs text-[#868C94]">
                      Brak danych domenowych dla wybranego sklepu.
                    </div>
                  )}
                </div>
              </div>

              {/* ROW 3: PRIORITY ISSUE TRIAGE TABLE (DIRECTLY ACTIONABLE ON DASHBOARD) */}
              {latestScan && (
                <div className="pci-card overflow-hidden">
                  <div className="p-5 border-b border-[#E5E3DC] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FFFFFF]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="pci-eyebrow">Rejestr Diagnostyczny</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#F4F2ED] text-[#373B40] border border-[#E5E3DC]">
                          {filteredIssues.length} z {issues.length} pozycji
                        </span>
                      </div>
                      <h2 className="text-sm font-semibold text-[#111315] mt-0.5">
                        Wykryte Nieprawidłowości i Rekomendacje Naprawcze
                      </h2>
                    </div>

                    {/* Filter Pills & Search */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex p-0.5 rounded-md bg-[#F4F2ED] border border-[#E5E3DC] text-xs">
                        {(
                          [
                            { key: "ALL", label: "Wszystkie" },
                            { key: "CRITICAL", label: `Krytyczne (${latestScan.criticalCount})` },
                            { key: "WARNING", label: `Ostrzeżenia (${latestScan.warningCount})` },
                            { key: "INFO", label: "Info" },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setIssueFilter(tab.key)}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                              issueFilter === tab.key
                                ? "bg-[#FFFFFF] text-[#111315] font-semibold shadow-xs"
                                : "text-[#5C6168] hover:text-[#111315]"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#868C94] absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Szukaj SKU, ID, reguły..."
                          className="pl-8 pr-3 py-1.5 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] focus:bg-[#FFFFFF] w-48 sm:w-56"
                        />
                      </div>
                    </div>
                  </div>

                  {filteredIssues.length === 0 ? (
                    <div className="p-10 text-center text-xs text-[#5C6168]">
                      Brak nieprawidłowości spełniających wybrane kryteria filtrowania.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#FAF9F6] border-b border-[#E5E3DC] text-[10px] font-mono uppercase tracking-wider text-[#5C6168]">
                            <th className="py-2.5 px-4">Priorytet / Kod</th>
                            <th className="py-2.5 px-4">Nieprawidłowość i Wpływ Biznesowy</th>
                            <th className="py-2.5 px-4">Obiekt (SKU / Zamówienie)</th>
                            <th className="py-2.5 px-4">Naprawa</th>
                            <th className="py-2.5 px-4 text-right">Szac. Czas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EFECE6] text-xs">
                          {filteredIssues.slice(0, 8).map((issue) => (
                            <tr
                              key={issue.id}
                              onClick={() => router.push(`/scans/${latestScan.id}`)}
                              className="hover:bg-[#FAF9F6] transition cursor-pointer group"
                            >
                              <td className="py-3 px-4 align-top whitespace-nowrap">
                                <div className="flex flex-col items-start gap-1">
                                  <span
                                    className={
                                      issue.severity === "CRITICAL"
                                        ? "badge-critical"
                                        : issue.severity === "WARNING"
                                        ? "badge-warning"
                                        : "badge-neutral"
                                    }
                                  >
                                    {issue.severity === "CRITICAL"
                                      ? "KRYTYCZNY"
                                      : issue.severity === "WARNING"
                                      ? "OSTRZEŻENIE"
                                      : "INFO"}
                                  </span>
                                  <span className="text-[10px] font-mono text-[#868C94]">
                                    {issue.code}
                                  </span>
                                </div>
                              </td>

                              <td className="py-3 px-4 align-top max-w-md">
                                <div className="font-semibold text-[#111315] group-hover:text-[#0052FF] transition">
                                  {issue.title}
                                </div>
                                <p className="text-[11px] text-[#5C6168] mt-0.5 line-clamp-2">
                                  {issue.businessImpact || issue.description}
                                </p>
                              </td>

                              <td className="py-3 px-4 align-top whitespace-nowrap">
                                <div className="font-medium text-[#111315] text-xs">
                                  {issue.entityName || "Obiekt systemowy"}
                                </div>
                                <div className="text-[11px] font-mono text-[#5C6168]">
                                  ID: {issue.entityId}
                                </div>
                              </td>

                              <td className="py-3 px-4 align-top whitespace-nowrap">
                                {issue.canAutoFix ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#EDF2FF] text-[#0052FF] border border-[#C7D7FE]">
                                    <Wrench className="w-2.5 h-2.5" />
                                    Auto-Fix API
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-[#5C6168] bg-[#F4F2ED] border border-[#E5E3DC]">
                                    Weryfikacja ręczna
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 align-top text-right whitespace-nowrap font-mono text-xs text-[#373B40]">
                                {issue.estimatedFixTime || "~5 min"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="px-5 py-3 bg-[#FAF9F6] border-t border-[#E5E3DC] flex items-center justify-between text-xs">
                    <span className="text-[#5C6168]">
                      Wyświetlono {Math.min(8, filteredIssues.length)} z {filteredIssues.length}{" "}
                      wykrytych pozycji
                    </span>
                    <Link
                      href={`/scans/${latestScan.id}`}
                      className="font-semibold text-[#0052FF] hover:text-[#0040CC] inline-flex items-center gap-1"
                    >
                      <span>Otwórz pełny arkusz naprawczy ({issues.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* ROW 4: HISTORICAL AUDIT LOG TABLE */}
              <div className="pci-card overflow-hidden">
                <div className="p-5 border-b border-[#E5E3DC] flex items-center justify-between">
                  <div>
                    <span className="pci-eyebrow">Archiwum Operacyjne</span>
                    <h2 className="text-sm font-semibold text-[#111315] mt-0.5">
                      Ostatnie Audyty Diagnostyczne
                    </h2>
                  </div>
                  <Link
                    href="/scans"
                    className="btn-secondary-surface text-xs"
                  >
                    <span>Pełny rejestr ({scans.length})</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {scans.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#868C94]">
                    Brak zapisanych audytów. Użyj przycisku &bdquo;Uruchom Audyt&rdquo; powyżej.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#FAF9F6] border-b border-[#E5E3DC] text-[10px] font-mono uppercase tracking-wider text-[#5C6168]">
                          <th className="py-2.5 px-4">Health Score</th>
                          <th className="py-2.5 px-4">Źródło / Sklep Base.com</th>
                          <th className="py-2.5 px-4">Data Wykonania</th>
                          <th className="py-2.5 px-4">Rozkład Usterek</th>
                          <th className="py-2.5 px-4 text-right">Eksport / Szczegóły</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFECE6] text-xs">
                        {scans.slice(0, 5).map((scan) => (
                          <tr key={scan.id} className="hover:bg-[#FAF9F6] transition">
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`inline-flex items-center justify-center px-2 py-0.5 rounded font-mono font-bold text-xs border ${
                                  scan.healthScore >= 80
                                    ? "bg-[#ECFDF5] text-[#046C4E] border-[#A7F3D0]"
                                    : scan.healthScore >= 50
                                    ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                                    : "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]"
                                }`}
                              >
                                {scan.healthScore}%
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold text-[#111315]">
                              <div className="flex items-center gap-2">
                                <span>{scan.shopConnection?.name || "Sklep Base.com"}</span>
                                {(scan.id?.includes("demo") ||
                                  scan.shopConnection?.name?.toLowerCase().includes("demo")) && (
                                  <span className="badge-demo text-[10px]">DEMO</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono text-[#5C6168] whitespace-nowrap">
                              {new Date(scan.completedAt || scan.startedAt).toLocaleString("pl-PL")}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 font-mono text-[11px]">
                                <span className="text-[#B91C1C] font-semibold">
                                  {scan.criticalCount ?? 0} kryt.
                                </span>
                                <span className="text-[#CFCBC2]">•</span>
                                <span className="text-[#B45309] font-semibold">
                                  {scan.warningCount ?? 0} ostrz.
                                </span>
                                <span className="text-[#CFCBC2]">•</span>
                                <span className="text-[#5C6168]">
                                  {scan.issuesCount} łącznie
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2">
                                <a
                                  href={`/api/scans/${scan.id}/pdf`}
                                  download
                                  className="btn-secondary-surface py-1 px-2.5 text-[11px]"
                                  title="Pobierz raport PDF"
                                >
                                  <Download className="w-3 h-3 text-[#5C6168]" />
                                  <span>PDF</span>
                                </a>
                                <Link
                                  href={`/scans/${scan.id}`}
                                  className="btn-primary-ink py-1 px-2.5 text-[11px]"
                                >
                                  <span>Inspekcja</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
