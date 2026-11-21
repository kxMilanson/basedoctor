"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { RadialHealthGauge } from "@/components/RadialHealthGauge";
import {
  FixSuggestion,
  getFixSuggestionForIssue,
  SafeFixModal,
} from "@/components/SafeFixModal";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  Key,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Warehouse,
  Wrench,
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

  // Safe Fix Modal state
  const [fixTarget, setFixTarget] = useState<{
    issue: any;
    issueKey: string;
    suggestion: FixSuggestion;
  } | null>(null);
  const [fixing, setFixing] = useState(false);

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

  const latestScan = latestScanDetail || scans[0];
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

  const handleApplyFix = async (newValue: string, fieldName: string, oldValue: string) => {
    if (!fixTarget || !latestScan) return;
    setFixing(true);
    try {
      const res = await fetch(`/api/scans/${latestScan.id}/fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "FIX",
          issueId: fixTarget.issueKey,
          newValue,
          fieldName,
          oldValue,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nie udało się zapisać poprawki.");
      setLatestScanDetail(data.scan);
      setScans((prev) =>
        prev.map((s) => (s.id === data.scan.id ? { ...s, ...data.scan } : s))
      );
      setFixTarget(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFixing(false);
    }
  };

  const handleRollbackFix = async (issueKey: string) => {
    if (!latestScan) return;
    setFixing(true);
    try {
      const res = await fetch(`/api/scans/${latestScan.id}/fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ROLLBACK",
          issueId: issueKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nie udało się cofnąć poprawki.");
      setLatestScanDetail(data.scan);
      setScans((prev) =>
        prev.map((s) => (s.id === data.scan.id ? { ...s, ...data.scan } : s))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFixing(false);
    }
  };

  const issues: any[] = useMemo(() => {
    return latestScanDetail?.issues || [];
  }, [latestScanDetail]);

  const fixedIssues = useMemo(() => {
    return issues.filter((i) => (i.status || i.details?.status) === "FIXED");
  }, [issues]);

  const handleExportCorrectionsCsv = () => {
    if (fixedIssues.length === 0) return;
    const rows = [
      ["Obiekt / ID", "Problem", "Poprawiane pole", "Wartość przed", "Nowa wartość", "Data poprawy"],
      ...fixedIssues.map((iss) => {
        const snap = iss.fixSnapshot || iss.details?.fixSnapshot || {};
        return [
          iss.entityName || iss.affectedIdentifier || iss.affectedEntityId || "",
          iss.title || "",
          snap.fieldName || "",
          snap.oldValue || "",
          snap.newValue || "",
          snap.fixedAt ? new Date(snap.fixedAt).toLocaleString("pl-PL") : "",
        ];
      }),
    ];
    const csvContent = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BaseDoctor-korekty-${latestScan?.id || "sklep"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredIssues = useMemo(() => {
    return issues
      .map((iss, idx) => ({ ...iss, _idx: idx }))
      .filter((issue) => {
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

  // 3 Friendly Business Area Cards
  const businessAreas = useMemo(() => {
    const openIssues = issues.filter((i) => (i.status || i.details?.status) !== "FIXED");
    const productIssues = openIssues.filter(
      (i) => i.category === "PRODUCT" || i.category === "PRICING"
    );
    const inventoryIssues = openIssues.filter((i) => i.category === "INVENTORY");
    const orderIssues = openIssues.filter(
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
      {/* Safe Fix Modal */}
      {fixTarget && (
        <SafeFixModal
          issue={fixTarget.issue}
          suggestion={fixTarget.suggestion}
          submitting={fixing}
          onClose={() => setFixTarget(null)}
          onConfirm={handleApplyFix}
        />
      )}

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
            <h1 className="text-base sm:text-lg font-bold text-[#18181B] truncate">
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
                className="px-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-sm font-medium text-[#18181B] focus:outline-none focus:border-[#0F766E]"
              >
                {connections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            <Link href="/connections" className="btn-studio-secondary hidden sm:inline-flex">
              <Store className="w-4 h-4 text-[#71717A]" />
              <span>Sklepy ({connections.length})</span>
            </Link>

            <button
              onClick={handleRunQuickScan}
              disabled={scanning || connections.length === 0}
              className="btn-studio-brand cursor-pointer"
            >
              {scanning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-white" />
              )}
              <span>{scanning ? "Sprawdzanie..." : "Sprawdź sklep teraz"}</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-7">
          {activeScanMsg && (
            <div className="p-4 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#134E4A] text-sm flex items-center gap-3">
              <RefreshCw className="w-4 h-4 text-[#0F766E] animate-spin shrink-0" />
              <span className="font-medium">{activeScanMsg}</span>
            </div>
          )}

          {isDemoActive && (
            <div className="p-4 rounded-2xl bg-white border border-[#99F6E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="pill-demo shrink-0">Tryb przykładowy</span>
                <p className="text-sm text-[#3F3F46]">
                  Oglądasz symulację sklepu. Możesz kliknąć <strong>„Napraw 1 kliknięciem”</strong> przy dowolnym błędzie, aby przetestować Asystenta Napraw.
                </p>
              </div>
              <Link
                href="/connections"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F766E] hover:text-[#115E59] shrink-0"
              >
                <span>Podłącz swój sklep</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              <div className="h-52 rounded-2xl bg-white border border-[#E8E4DC] p-6 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-36 rounded-2xl bg-white border border-[#E8E4DC] p-5 animate-pulse" />
                ))}
              </div>
            </div>
          ) : connections.length === 0 ? (
            <div className="studio-card p-10 sm:p-14 text-center">
              <div className="max-w-lg mx-auto space-y-5">
                <div className="w-14 h-14 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] mx-auto flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-[#18181B]">
                    Sprawdź, czy w Twoim sklepie wszystko działa jak należy
                  </h2>
                  <p className="text-sm sm:text-base text-[#52525B] leading-relaxed">
                    Podłącz swój sklep w Base.com, aby w 30 sekund wykryć błędy w produktach,
                    braki w stanach magazynowych i opóźnione wysyłki.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Link href="/connections" className="btn-studio-brand px-6 py-3">
                    <Key className="w-4 h-4" />
                    <span>Połącz swój sklep Base.com</span>
                  </Link>
                  <button
                    onClick={handleLoadDemo}
                    disabled={scanning}
                    className="btn-studio-secondary px-6 py-3 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#0F766E]" />
                    <span>Zobacz na sklepie przykładowym</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 1. DARK OBSIDIAN HERO COMMAND MODULE */}
              <section className="cockpit-hero-card p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          score >= 80
                            ? "bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30"
                            : score >= 50
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            score >= 80
                              ? "bg-[#10B981]"
                              : score >= 50
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                        />
                        {score >= 80
                          ? "Sklep w dobrej kondycji"
                          : score >= 50
                          ? "Wymaga kilku poprawek"
                          : "Pilne sprawy do poprawy"}
                      </span>
                      {latestScan && (
                        <span className="text-xs sm:text-sm text-zinc-400">
                          Ostatnie sprawdzenie:{" "}
                          {new Date(
                            latestScan.completedAt || latestScan.startedAt
                          ).toLocaleString("pl-PL")}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                        {latestScan ? healthHeadline : "Sklep gotowy do pierwszego sprawdzenia"}
                      </h2>
                      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl">
                        {latestScan ? (
                          <>
                            Przejrzeliśmy{" "}
                            <strong className="font-semibold text-white">
                              {latestScan.productsScanned} produktów
                            </strong>{" "}
                            oraz{" "}
                            <strong className="font-semibold text-white">
                              {latestScan.ordersScanned} zamówień
                            </strong>
                            .{" "}
                            {latestScan.criticalCount > 0 ? (
                              <>
                                Pozostało{" "}
                                <strong className="text-rose-300">
                                  {latestScan.criticalCount} pilnych spraw
                                </strong>{" "}
                                oraz{" "}
                                <strong className="text-amber-300">
                                  {latestScan.warningCount} rzeczy do poprawy
                                </strong>
                                .
                              </>
                            ) : (
                              "Wszystkie pilne błędy blokujące sprzedaż zostały rozwiązane!"
                            )}
                          </>
                        ) : (
                          "Kliknij przycisk poniżej, aby sprawdzić produkty, magazyn i zamówienia w połączonym sklepie."
                        )}
                      </p>
                    </div>

                    {latestScan && (
                      <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs sm:text-sm text-zinc-300">
                        <Clock className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                        <span>
                          Ręcznie w Base.com: <strong className="text-white">~45 min</strong> • Z Asystentem BaseDoctor:{" "}
                          <strong className="text-[#2DD4BF]">ok. 2 min</strong>
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={handleRunQuickScan}
                        disabled={scanning}
                        className="btn-studio-brand cursor-pointer"
                      >
                        <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
                        <span>{scanning ? "Sprawdzanie..." : "Sprawdź sklep ponownie"}</span>
                      </button>

                      {latestScan && (
                        <>
                          <a
                            href={`/api/scans/${latestScan.id}/pdf`}
                            download
                            className="px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-200 bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] transition inline-flex items-center gap-2"
                          >
                            <Download className="w-4 h-4 text-[#2DD4BF]" />
                            <span>Pobierz raport PDF</span>
                          </a>

                          {fixedIssues.length > 0 && (
                            <button
                              type="button"
                              onClick={handleExportCorrectionsCsv}
                              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-[#5EEAD4] bg-[#0F766E]/25 hover:bg-[#0F766E]/40 border border-[#14B8A6]/40 transition inline-flex items-center gap-2 cursor-pointer"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                              <span>Korekty CSV ({fixedIssues.length})</span>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Visual Radial Health Gauge on Dark Glass */}
                  <div className="lg:col-span-4 p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col items-center space-y-4">
                    <RadialHealthGauge score={latestScan ? score : 100} size={156} theme="dark" />

                    {scoreDelta !== null && (
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          scoreDelta >= 0
                            ? "bg-[#10B981]/20 text-[#34D399]"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {scoreDelta >= 0 ? `+${scoreDelta}` : scoreDelta} pkt od poprzedniego sprawdzenia
                      </span>
                    )}

                    {latestScan && (
                      <div className="w-full space-y-2 pt-2 border-t border-white/[0.08]">
                        <div className="w-full h-2.5 rounded-full bg-white/[0.08] overflow-hidden flex gap-0.5">
                          {critPct > 0 && (
                            <div className="h-full bg-[#F43F5E]" style={{ width: `${critPct}%` }} />
                          )}
                          {warnPct > 0 && (
                            <div className="h-full bg-[#F59E0B]" style={{ width: `${warnPct}%` }} />
                          )}
                          {infoPct > 0 && (
                            <div className="h-full bg-[#14B8A6]" style={{ width: `${infoPct}%` }} />
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <span>Pilne: <strong className="text-white">{latestScan.criticalCount}</strong></span>
                          <span>Poprawa: <strong className="text-white">{latestScan.warningCount}</strong></span>
                          <span>Naprawione: <strong className="text-[#34D399]">{fixedIssues.length}</strong></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* 2. 3 BUSINESS AREA CARDS */}
              {latestScan && (
                <section className="space-y-3">
                  <h2 className="text-base font-bold text-[#18181B]">
                    Stan trzech głównych obszarów sklepu
                  </h2>

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
                        <div key={area.title} className="studio-card p-6 space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-center text-[#0F766E]">
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={statusPill.cls}>{statusPill.label}</span>
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-[#18181B]">{area.title}</h3>
                            <p className="text-xs sm:text-sm text-[#71717A] mt-1 leading-relaxed">
                              {area.subtitle}
                            </p>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-[#F1EFEA]">
                            <div className="w-full h-2 bg-[#F3F0EA] rounded-full overflow-hidden">
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
                            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="text-[#52525B]">
                                {area.count === 0
                                  ? "Brak otwartych spraw"
                                  : area.count === 1
                                  ? "1 sprawa do przejrzenia"
                                  : `${area.count} spraw do przejrzenia`}
                              </span>
                              <span className="font-bold text-[#18181B] tabular-nums">
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

              {/* 3. ACTIONABLE RECOMMENDATIONS WITH 1-CLICK SAFE FIX */}
              {latestScan && (
                <section className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-[#18181B]">
                        Co warto teraz naprawić w sklepie
                      </h2>
                      <p className="text-sm text-[#71717A]">
                        Przy sprawach katalogowych i magazynowych możesz kliknąć „Napraw 1 kliknięciem”, zobaczyć podgląd i zatwierdzić zmianę.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="inline-flex p-1 rounded-xl bg-[#F3F0EA] border border-[#E8E4DC]">
                        {(
                          [
                            { key: "ALL", label: "Wszystkie" },
                            { key: "CRITICAL", label: `Pilne (${latestScan.criticalCount})` },
                            { key: "WARNING", label: `Poprawa (${latestScan.warningCount})` },
                            { key: "INFO", label: "Wskazówki" },
                          ] as const
                        ).map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setIssueFilter(tab.key)}
                            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
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
                        <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Szukaj produktu..."
                          className="pl-9 pr-3.5 py-2 rounded-xl bg-white border border-[#E8E4DC] text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] w-48 sm:w-56"
                        />
                      </div>
                    </div>
                  </div>

                  {filteredIssues.length === 0 ? (
                    <div className="studio-card p-10 text-center space-y-2">
                      <CheckCircle2 className="w-9 h-9 text-[#10B981] mx-auto" />
                      <p className="text-base font-semibold text-[#18181B]">
                        Brak spraw pasujących do wybranych filtrów
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredIssues.slice(0, 6).map((issue) => {
                        const issueKey = issue.id || String(issue._idx);
                        const isFixed = (issue.status || issue.details?.status) === "FIXED";
                        const fixSnapshot = issue.fixSnapshot || issue.details?.fixSnapshot;
                        const suggestion = getFixSuggestionForIssue(issue);
                        const isUrgent = issue.severity === "CRITICAL";
                        const isWarning = issue.severity === "WARNING";

                        return (
                          <div
                            key={issueKey}
                            className={`studio-card-hover p-6 space-y-4 ${
                              isFixed ? "border-[#A7F3D0] bg-[#ECFDF5]/35" : ""
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-2">
                                {isFixed ? (
                                  <span className="pill-healthy">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Naprawiono bezpiecznie
                                  </span>
                                ) : (
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
                                )}
                                <span className="pill-neutral">
                                  {getFriendlyCategoryName(issue.category)}
                                </span>
                                {(issue.affectedIdentifier || issue.entityName) && (
                                  <span className="font-mono text-xs bg-[#FAF8F5] border border-[#E8E4DC] text-[#18181B] px-2.5 py-0.5 rounded-full">
                                    {issue.entityName || issue.affectedIdentifier}
                                  </span>
                                )}
                              </div>

                              {/* Action Button: Fix 1-Click OR Rollback */}
                              <div className="flex items-center gap-2.5 shrink-0">
                                {isFixed ? (
                                  <button
                                    type="button"
                                    disabled={fixing}
                                    onClick={() => handleRollbackFix(issueKey)}
                                    className="btn-studio-secondary py-2 px-3.5 text-xs cursor-pointer"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Cofnij zmianę</span>
                                  </button>
                                ) : (
                                  suggestion && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setFixTarget({ issue, issueKey, suggestion })
                                      }
                                      className="btn-studio-brand py-2 px-4 text-xs cursor-pointer"
                                    >
                                      <Wrench className="w-3.5 h-3.5" />
                                      <span>Napraw 1 kliknięciem</span>
                                    </button>
                                  )
                                )}
                              </div>
                            </div>

                            {isFixed && fixSnapshot && (
                              <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs sm:text-sm text-[#047857] flex flex-wrap items-center justify-between gap-2">
                                <span>
                                  <strong>Zapisana poprawka ({fixSnapshot.fieldName}):</strong>{" "}
                                  zmieniono z <span className="line-through opacity-75">{fixSnapshot.oldValue}</span> na{" "}
                                  <strong>{fixSnapshot.newValue}</strong>
                                </span>
                              </div>
                            )}

                            <div>
                              <h3 className="text-base font-bold text-[#18181B]">
                                {issue.title}
                              </h3>
                              {issue.description && (
                                <p className="text-sm text-[#52525B] mt-1 leading-relaxed">
                                  {issue.description}
                                </p>
                              )}
                              {!isFixed && suggestion && (
                                <div className="mt-2.5 inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E8E4DC] font-mono text-xs">
                                  <span className="text-[#71717A] font-sans font-medium">Proponowana korekta:</span>
                                  <span className="text-[#BE123C] line-through">{suggestion.oldValue}</span>
                                  <ArrowRight className="w-3 h-3 text-[#71717A]" />
                                  <span className="text-[#0F766E] font-semibold">{suggestion.suggestedValue}</span>
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                                <div className="text-xs font-semibold text-[#B45309] flex items-center gap-1.5">
                                  <AlertTriangle className="w-4 h-4 shrink-0" />
                                  <span>Co to oznacza dla sprzedaży</span>
                                </div>
                                <p className="text-xs sm:text-sm text-[#3F3F46] leading-relaxed">
                                  {issue.businessImpact ||
                                    "Może obniżać widoczność ofert lub wydłużać obsługę zamówień."}
                                </p>
                              </div>

                              <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1">
                                <div className="text-xs font-semibold text-[#0F766E] flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                                  <span>Co należy zrobić</span>
                                </div>
                                <p className="text-xs sm:text-sm text-[#134E4A] leading-relaxed">
                                  {issue.suggestedFix ||
                                    "Uzupełnij brakujące dane w karcie produktu lub zamówienia w Base.com."}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-[#71717A]">
                          Pokazujemy {Math.min(6, filteredIssues.length)} z {filteredIssues.length} spraw
                        </span>
                        <Link
                          href={`/scans/${latestScan.id}`}
                          className="btn-studio-secondary"
                        >
                          <span>Otwórz wszystkie sprawy ({issues.length})</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* 4. SECONDARY SECTION: STORE HEALTH HISTORY & TREND */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                <div className="lg:col-span-6 studio-card p-6 space-y-4">
                  <div>
                    <h2 className="text-base font-bold text-[#18181B]">
                      Jak zmieniała się kondycja sklepu
                    </h2>
                    <p className="text-xs sm:text-sm text-[#71717A]">
                      Wyniki ostatnich sprawdzeń
                    </p>
                  </div>

                  {chartPoints.length > 0 ? (
                    <div className="h-48 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] p-4 flex items-end justify-between gap-3">
                      {chartPoints.map((pt, idx) => {
                        const barHeight = Math.max(18, Math.min(100, pt.healthScore));
                        const isLatest = idx === chartPoints.length - 1;
                        return (
                          <div
                            key={pt.id}
                            className="flex-1 flex flex-col items-center justify-end h-full"
                          >
                            <span className="text-xs font-bold text-[#18181B] mb-1.5 tabular-nums">
                              {pt.healthScore}%
                            </span>
                            <div className="w-full max-w-[46px] h-28 bg-[#EAE6DF] rounded-xl flex items-end overflow-hidden p-0.5">
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
                            <span className="mt-2 text-xs text-[#71717A] tabular-nums">
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
                    <div className="h-48 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] flex items-center justify-center text-sm text-[#71717A]">
                      Wykres pojawi się po wykonaniu pierwszego sprawdzenia.
                    </div>
                  )}
                </div>

                <div className="lg:col-span-6 studio-card p-6 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-[#18181B]">
                        Ostatnie raporty
                      </h2>
                      <p className="text-xs sm:text-sm text-[#71717A]">
                        Poprzednie sprawdzenia zapisane na Twoim koncie
                      </p>
                    </div>
                    <Link
                      href="/scans"
                      className="text-sm font-semibold text-[#0F766E] hover:underline"
                    >
                      Wszystkie ({scans.length})
                    </Link>
                  </div>

                  {scans.length === 0 ? (
                    <div className="py-10 text-center text-sm text-[#71717A]">
                      Brak wcześniejszych raportów.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F1EFEA]">
                      {scans.slice(0, 4).map((scan) => (
                        <div
                          key={scan.id}
                          className="py-3.5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold tabular-nums shrink-0 ${
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
                              <div className="text-sm font-semibold text-[#18181B] truncate">
                                {scan.shopConnection?.name || "Sklep Base.com"}
                              </div>
                              <div className="text-xs text-[#71717A]">
                                {new Date(
                                  scan.completedAt || scan.startedAt
                                ).toLocaleDateString("pl-PL")}{" "}
                                • {scan.issuesCount} spraw
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={`/api/scans/${scan.id}/pdf`}
                              download
                              className="p-2 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#FAF8F5] transition"
                              title="Pobierz PDF"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <Link
                              href={`/scans/${scan.id}`}
                              className="btn-studio-secondary py-1.5 px-3.5 text-xs"
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
