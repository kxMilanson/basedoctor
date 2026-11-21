"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { RadialHealthGauge } from "@/components/RadialHealthGauge";
import {
  FixSuggestion,
  getFixSuggestionForIssue,
  SafeFixModal,
} from "@/components/SafeFixModal";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";

function getFriendlyCategory(cat: string): string {
  switch (cat) {
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

export default function ScanDetailsPage() {
  const params = useParams();
  const scanId = params.id as string;

  const [scan, setScan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Safe Fix Modal state
  const [fixTarget, setFixTarget] = useState<{
    issue: any;
    issueKey: string;
    suggestion: FixSuggestion;
  } | null>(null);
  const [fixing, setFixing] = useState(false);

  useEffect(() => {
    if (!scanId) return;
    fetch(`/api/scans/${scanId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.scan) {
          setScan(data.scan);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [scanId]);

  const handleApplyFix = async (newValue: string, fieldName: string, oldValue: string) => {
    if (!fixTarget || !scan) return;
    setFixing(true);
    try {
      const res = await fetch(`/api/scans/${scan.id}/fix`, {
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
      setScan(data.scan);
      setFixTarget(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFixing(false);
    }
  };

  const handleRollbackFix = async (issueKey: string) => {
    if (!scan) return;
    setFixing(true);
    try {
      const res = await fetch(`/api/scans/${scan.id}/fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ROLLBACK",
          issueId: issueKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Nie udało się cofnąć poprawki.");
      setScan(data.scan);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFixing(false);
    }
  };

  const isDemo = Boolean(
    scan?.summary?.dataSource === "DEMO_FIXTURES" ||
      scan?.id?.includes("demo") ||
      scan?.shopConnection?.name?.toLowerCase().includes("demo") ||
      scan?.shopConnection?.name?.toLowerCase().includes("syntetyczn") ||
      scan?.shopConnection?.name?.toLowerCase().includes("przykładow")
  );

  const issues: any[] = scan?.issues || [];
  const fixedIssues = useMemo(
    () => issues.filter((i) => (i.status || i.details?.status) === "FIXED"),
    [issues]
  );

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
    link.download = `BaseDoctor-korekty-${scan?.id || "sklep"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredIssues = issues
    .map((iss, idx) => ({ ...iss, _idx: idx }))
    .filter((iss) => {
      if (severityFilter !== "ALL" && iss.severity !== severityFilter) {
        return false;
      }
      if (categoryFilter !== "ALL" && iss.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = iss.title?.toLowerCase().includes(q);
        const matchDesc = iss.description?.toLowerCase().includes(q);
        const matchImpact = iss.businessImpact?.toLowerCase().includes(q);
        const matchEntity = iss.entityName?.toLowerCase().includes(q);
        const matchId = iss.affectedIdentifier?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchImpact || matchEntity || matchId;
      }
      return true;
    });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF8F5] text-[#18181B]">
      {fixTarget && (
        <SafeFixModal
          issue={fixTarget.issue}
          suggestion={fixTarget.suggestion}
          submitting={fixing}
          onClose={() => setFixTarget(null)}
          onConfirm={handleApplyFix}
        />
      )}

      <AppSidebar
        connectionsCount={1}
        activeStoreName={scan?.shopConnection?.name || "Sklep Base.com"}
        isDemo={isDemo}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-8 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E4DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/scans"
              className="text-sm font-medium text-[#52525B] hover:text-[#18181B] flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Wszystkie raporty</span>
            </Link>
            <span className="text-[#D6D1C7]">/</span>
            <span className="text-sm sm:text-base font-bold text-[#18181B] truncate">
              Szczegóły sprawdzenia sklepu
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {fixedIssues.length > 0 && (
              <button
                type="button"
                onClick={handleExportCorrectionsCsv}
                className="btn-studio-secondary border-[#99F6E4] bg-[#F0FDFA] text-[#0F766E] cursor-pointer hidden sm:inline-flex"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Korekty CSV ({fixedIssues.length})</span>
              </button>
            )}
            {scan && (
              <a
                href={`/api/scans/${scan.id}/pdf`}
                download
                className="btn-studio-brand shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Pobierz raport PDF</span>
              </a>
            )}
          </div>
        </header>

        <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {loading ? (
            <div className="studio-card p-12 text-center text-sm text-[#71717A] animate-pulse">
              Przygotowujemy Twój raport...
            </div>
          ) : !scan ? (
            <div className="studio-card p-12 text-center space-y-3">
              <p className="text-base font-semibold text-[#18181B]">
                Nie znaleziono wskazanego raportu.
              </p>
              <Link href="/scans" className="btn-studio-secondary inline-flex">
                <ArrowLeft className="w-4 h-4" /> Wróć do historii raportów
              </Link>
            </div>
          ) : (
            <>
              {/* Executive Summary Card with Radial Gauge */}
              <div className="studio-card p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {isDemo ? (
                        <span className="pill-demo">Sklep przykładowy</span>
                      ) : (
                        <span className="pill-healthy">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Połączenie bezpieczne (tylko odczyt)
                        </span>
                      )}
                      <span className="text-xs sm:text-sm text-[#71717A]">
                        Wykonano: {new Date(scan.completedAt || scan.startedAt).toLocaleString("pl-PL")}
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#18181B]">
                      {scan.shopConnection?.name || "Sklep Base.com"}
                    </h1>
                    <p className="text-sm text-[#52525B] max-w-2xl leading-relaxed">
                      Przejrzeliśmy {scan.productsScanned} produktów i {scan.ordersScanned} zamówień.
                      Kliknij <strong>„Napraw 1 kliknięciem”</strong> przy wybranych pozycjach, aby bezpiecznie przygotować i zapisać poprawkę z możliwością cofnięcia.
                    </p>
                  </div>

                  <div className="px-6 py-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC] flex justify-center shrink-0">
                    <RadialHealthGauge score={scan.healthScore} size={140} />
                  </div>
                </div>

                {/* Friendly Breakdown Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5 border-t border-[#F1EFEA] text-center">
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                    <div className="text-xs text-[#71717A]">Sprawdzone produkty</div>
                    <div className="font-bold text-[#18181B] mt-0.5 text-xl tabular-nums">
                      {scan.productsScanned}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                    <div className="text-xs text-[#71717A]">Sprawdzone zamówienia</div>
                    <div className="font-bold text-[#18181B] mt-0.5 text-xl tabular-nums">
                      {scan.ordersScanned}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3]">
                    <div className="text-xs text-[#BE123C] font-semibold">Pilne sprawy</div>
                    <div className="font-bold text-[#BE123C] mt-0.5 text-xl tabular-nums">
                      {scan.criticalCount}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                    <div className="text-xs text-[#B45309] font-semibold">Warto poprawić</div>
                    <div className="font-bold text-[#B45309] mt-0.5 text-xl tabular-nums">
                      {scan.warningCount}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] col-span-2 sm:col-span-1">
                    <div className="text-xs text-[#047857] font-semibold">Naprawione teraz</div>
                    <div className="font-bold text-[#047857] mt-0.5 text-xl tabular-nums">
                      {fixedIssues.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="studio-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="inline-flex flex-wrap p-1 rounded-xl bg-[#F3F0EA] border border-[#E8E4DC] gap-1">
                  {[
                    { id: "ALL", label: `Wszystkie (${issues.length})` },
                    { id: "CRITICAL", label: `Pilne (${scan.criticalCount})` },
                    { id: "WARNING", label: `Do poprawy (${scan.warningCount})` },
                    { id: "INFO", label: `Wskazówki (${scan.infoCount})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSeverityFilter(tab.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition cursor-pointer ${
                        severityFilter === tab.id
                          ? "bg-white text-[#18181B] font-semibold shadow-xs"
                          : "text-[#52525B] hover:text-[#18181B]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label="Filtruj wg obszaru"
                    className="px-3.5 py-2 rounded-xl border border-[#E8E4DC] bg-[#FAF8F5] text-sm font-medium text-[#18181B] focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="ALL">Wszystkie obszary</option>
                    <option value="PRODUCT">Produkty i katalog</option>
                    <option value="INVENTORY">Magazyn i stany</option>
                    <option value="ORDER">Zamówienia</option>
                    <option value="SHIPPING">Wysyłka</option>
                    <option value="PRICING">Ceny i podatki</option>
                  </select>

                  <div className="relative">
                    <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Szukaj produktu..."
                      className="pl-9 pr-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-sm text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] focus:bg-white w-48 sm:w-56"
                    />
                  </div>
                </div>
              </div>

              {/* Issues Action Cards */}
              <div className="space-y-4">
                {filteredIssues.length === 0 ? (
                  <div className="studio-card p-12 text-center space-y-2">
                    <CheckCircle2 className="w-9 h-9 text-[#10B981] mx-auto" />
                    <p className="text-base font-semibold text-[#18181B]">
                      Brak spraw pasujących do wybranych filtrów
                    </p>
                  </div>
                ) : (
                  filteredIssues.map((issue) => {
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
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
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
                                  ? "Pilne — wymaga uwagi"
                                  : isWarning
                                  ? "Warto poprawić"
                                  : "Wskazówka"}
                              </span>
                            )}
                            <span className="pill-neutral">
                              {getFriendlyCategory(issue.category)}
                            </span>
                            {(issue.affectedIdentifier || issue.entityName) && (
                              <span className="font-mono text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF8F5] text-[#18181B] border border-[#E8E4DC]">
                                {issue.entityName || issue.affectedIdentifier}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {issue.estimatedFixTime && !isFixed && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#52525B]">
                                <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                                ok. {issue.estimatedFixTime}
                              </span>
                            )}
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
                          <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs sm:text-sm text-[#047857]">
                            <strong>Zapisana poprawka ({fixSnapshot.fieldName}):</strong>{" "}
                            zmieniono z <span className="line-through opacity-75">{fixSnapshot.oldValue}</span> na{" "}
                            <strong>{fixSnapshot.newValue}</strong>
                          </div>
                        )}

                        <div>
                          <h2 className="text-base sm:text-lg font-bold text-[#18181B]">
                            {issue.title}
                          </h2>
                          <p className="text-sm text-[#52525B] mt-1 leading-relaxed">
                            {issue.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {issue.businessImpact && (
                            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                              <div className="text-xs font-semibold text-[#B45309] flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>Dlaczego to ważne dla Twojego sklepu</span>
                              </div>
                              <p className="text-xs sm:text-sm text-[#3F3F46] leading-relaxed">
                                {issue.businessImpact}
                              </p>
                            </div>
                          )}

                          <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-2">
                            <div className="text-xs font-semibold text-[#0F766E] flex items-center gap-1.5">
                              <Wrench className="w-4 h-4 shrink-0" />
                              <span>Jak to naprawić krok po kroku</span>
                            </div>
                            <p className="text-xs sm:text-sm text-[#134E4A] leading-relaxed">
                              {issue.suggestedFix}
                            </p>
                            {issue.autoFixNote && (
                              <div className="pt-2 border-t border-[#99F6E4]/60 text-xs text-[#0F766E] flex items-center gap-1.5 font-medium">
                                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                                <span>{issue.autoFixNote}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
