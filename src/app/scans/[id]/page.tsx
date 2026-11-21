"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Info,
  Layers,
  Lock,
  Package,
  ShieldCheck,
  Sparkles,
  Wrench,
  AlertCircle,
  FileText,
  Search,
  ExternalLink,
} from "lucide-react";

export default function ScanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const scanId = params.id as string;

  const [scan, setScan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

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

  const isDemo = Boolean(
    scan?.summary?.dataSource === "DEMO_FIXTURES" ||
      scan?.id?.includes("demo") ||
      scan?.shopConnection?.name?.toLowerCase().includes("demo") ||
      scan?.shopConnection?.name?.toLowerCase().includes("syntetyczn")
  );

  const issues: any[] = scan?.issues || [];

  const filteredIssues = issues.filter((iss) => {
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
      const matchCode = iss.code?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchImpact || matchEntity || matchCode;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F7F4] text-[#111315]">
      {/* Persistent Left Sidebar */}
      <AppSidebar
        connectionsCount={1}
        activeStoreName={scan?.shopConnection?.name || "Konto Base.com"}
        isDemo={isDemo}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Workspace Top Header */}
        <header className="sticky top-0 z-30 h-14 px-4 sm:px-8 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#E5E3DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/scans"
              className="text-xs font-medium text-[#5C6168] hover:text-[#111315] flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Rejestr Audytów</span>
            </Link>
            <span className="text-[#CFCBC2]">/</span>
            <span className="text-xs font-semibold text-[#111315] truncate font-mono">
              Raport #{scanId?.slice(0, 12)}
            </span>
            {isDemo && (
              <span className="badge-demo font-mono text-[10px] hidden sm:inline-flex">
                DEMO • SYNTETYCZNE
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {scan && (
              <a
                href={`/api/scans/${scan.id}/pdf`}
                download
                className="btn-primary-cobalt"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pobierz Raport PDF</span>
              </a>
            )}
          </div>
        </header>

        {/* Workspace Content */}
        <div className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {loading ? (
            <div className="pci-card p-12 text-center text-xs text-[#5C6168] font-mono animate-pulse">
              Ładowanie szczegółowego raportu diagnostycznego...
            </div>
          ) : !scan ? (
            <div className="pci-card p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-[#111315]">
                Nie znaleziono wskazanego raportu diagnostycznego.
              </p>
              <Link href="/scans" className="btn-secondary-surface text-xs inline-flex">
                <ArrowLeft className="w-3.5 h-3.5" /> Wróć do rejestru audytów
              </Link>
            </div>
          ) : (
            <>
              {/* Report Header Card */}
              <div className="pci-card p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="pci-eyebrow">Raport Diagnostyczny</span>
                      {isDemo ? (
                        <span className="badge-demo">
                          <Sparkles className="w-3 h-3 text-[#0052FF]" />
                          Środowisko Demonstracyjne
                        </span>
                      ) : (
                        <span className="badge-active">
                          <CheckCircle2 className="w-3 h-3 text-[#059669]" />
                          Połączenie zweryfikowane (Base.com API)
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111315]">
                      {scan.shopConnection?.name || "Sklep Base.com"}
                    </h1>
                    <p className="text-xs text-[#5C6168] font-mono">
                      ID: <span className="text-[#111315] font-semibold">{scan.id}</span> • Czas zakończenia:{" "}
                      {new Date(scan.completedAt || scan.startedAt).toLocaleString("pl-PL")}
                    </p>
                  </div>

                  {/* Monospace Health Score Card */}
                  <div className="p-4 rounded-lg border border-[#E5E3DC] bg-[#FAF9F6] text-center shrink-0 min-w-[140px]">
                    <div className="font-mono text-4xl font-bold tracking-tight text-[#111315] tabular-nums">
                      {scan.healthScore}%
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#5C6168] font-semibold mt-0.5">
                      Health Score
                    </div>
                  </div>
                </div>

                {/* 5-Column Throughput & Severity Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5 border-t border-[#EFECE6] text-center">
                  <div className="p-3 rounded-md bg-[#FAF9F6] border border-[#EFECE6]">
                    <div className="text-[10px] font-mono uppercase text-[#5C6168]">Produkty SKU</div>
                    <div className="font-mono font-bold text-[#111315] mt-0.5 text-base tabular-nums">
                      {scan.productsScanned}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-[#FAF9F6] border border-[#EFECE6]">
                    <div className="text-[10px] font-mono uppercase text-[#5C6168]">Zamówienia</div>
                    <div className="font-mono font-bold text-[#111315] mt-0.5 text-base tabular-nums">
                      {scan.ordersScanned}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-[#FEF2F2] border border-[#FECACA]">
                    <div className="text-[10px] font-mono uppercase text-[#B91C1C] font-semibold">Krytyczne</div>
                    <div className="font-mono font-bold text-[#B91C1C] mt-0.5 text-base tabular-nums">
                      {scan.criticalCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-[#FFFBEB] border border-[#FDE68A]">
                    <div className="text-[10px] font-mono uppercase text-[#B45309] font-semibold">Ostrzeżenia</div>
                    <div className="font-mono font-bold text-[#B45309] mt-0.5 text-base tabular-nums">
                      {scan.warningCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-md bg-[#EDF2FF] border border-[#C7D7FE] col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-mono uppercase text-[#0040CC] font-semibold">Informacyjne</div>
                    <div className="font-mono font-bold text-[#0040CC] mt-0.5 text-base tabular-nums">
                      {scan.infoCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Module Performance Breakdown */}
              {scan.summary && (scan.summary as any[]).length > 0 && (
                <div className="space-y-3">
                  <span className="pci-eyebrow">Kondycja wg Domen</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {(scan.summary as any[]).map((cat, idx) => (
                      <div key={idx} className="pci-card p-4 space-y-2.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-[#111315]">{cat.title}</span>
                          <span className="font-mono font-bold text-[#111315] tabular-nums">
                            {cat.score}%
                          </span>
                        </div>
                        <div className="w-full bg-[#F2F0EB] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              cat.score >= 80
                                ? "bg-[#059669]"
                                : cat.score >= 50
                                ? "bg-[#D97706]"
                                : "bg-[#DC2626]"
                            }`}
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-[#5C6168]">
                          <span>Wykryte: {cat.totalIssues}</span>
                          {cat.criticalCount > 0 && (
                            <span className="font-mono font-semibold text-[#B91C1C]">
                              {cat.criticalCount} kryt.
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter & Search Bar */}
              <div className="pci-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="pci-eyebrow mr-1">Priorytet:</span>
                  <div className="inline-flex p-0.5 rounded-md bg-[#F4F2ED] border border-[#E5E3DC] text-xs">
                    {[
                      { id: "ALL", label: `Wszystkie (${issues.length})` },
                      { id: "CRITICAL", label: `Krytyczne (${scan.criticalCount})` },
                      { id: "WARNING", label: `Ostrzeżenia (${scan.warningCount})` },
                      { id: "INFO", label: `Info (${scan.infoCount})` },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSeverityFilter(tab.id)}
                        className={`px-3 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                          severityFilter === tab.id
                            ? "bg-[#FFFFFF] text-[#111315] font-semibold shadow-xs"
                            : "text-[#5C6168] hover:text-[#111315]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label="Filtruj wg kategorii"
                    className="px-2.5 py-1.5 rounded-md border border-[#E5E3DC] bg-[#FAF9F6] text-xs font-medium text-[#111315] focus:outline-none focus:border-[#0052FF]"
                  >
                    <option value="ALL">Wszystkie domeny</option>
                    <option value="PRODUCT">Katalog SKU</option>
                    <option value="INVENTORY">Magazyn WMS</option>
                    <option value="ORDER">Zamówienia i Wysyłka</option>
                    <option value="SHIPPING">Wysyłka i Logistyka</option>
                    <option value="PRICING">Ceny i Podatki</option>
                  </select>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#868C94] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Szukaj SKU, kodu, wpływu..."
                      className="pl-8 pr-3 py-1.5 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-xs text-[#111315] placeholder:text-[#868C94] focus:outline-none focus:border-[#0052FF] focus:bg-[#FFFFFF] w-48 sm:w-56"
                    />
                  </div>
                </div>
              </div>

              {/* Issues List Cards */}
              <div className="space-y-3.5">
                {filteredIssues.length === 0 ? (
                  <div className="pci-card p-12 text-center text-xs text-[#5C6168]">
                    Brak usterek odpowiadających wybranym kryteriom filtrowania.
                  </div>
                ) : (
                  filteredIssues.map((issue, idx) => {
                    const isCritical = issue.severity === "CRITICAL";
                    const isWarning = issue.severity === "WARNING";

                    return (
                      <div
                        key={issue.id || idx}
                        className="pci-card p-5 space-y-4 hover:border-[#CFCBC2] transition"
                      >
                        {/* Issue Header Strip */}
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={
                                isCritical
                                  ? "badge-critical"
                                  : isWarning
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

                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#F4F2ED] text-[#373B40] border border-[#E5E3DC]">
                              {issue.category}
                            </span>

                            <span className="font-mono text-[11px] text-[#868C94]">
                              {issue.code}
                            </span>
                          </div>

                          {issue.affectedIdentifier && (
                            <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-[#FAF9F6] text-[#111315] border border-[#E5E3DC]">
                              Obiekt: {issue.affectedIdentifier}
                            </span>
                          )}
                        </div>

                        {/* Title and Description */}
                        <div>
                          <h2 className="text-sm font-semibold text-[#111315]">
                            {issue.title}
                          </h2>
                          <p className="text-xs text-[#5C6168] mt-1 leading-relaxed">
                            {issue.description}
                          </p>
                        </div>

                        {/* Business Impact Box (Charcoal / Amber Alert) */}
                        {issue.businessImpact && (
                          <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#E5E3DC] flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
                            <div className="text-xs text-[#373B40]">
                              <strong className="font-semibold block text-[#111315] mb-0.5">
                                Konsekwencje biznesowe dla sklepu:
                              </strong>
                              <p className="text-[11px] leading-relaxed text-[#5C6168]">
                                {issue.businessImpact}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Suggested Remediation Box */}
                        <div className="p-3.5 rounded-lg bg-[#EDF2FF] border border-[#C7D7FE] flex items-start gap-2.5">
                          <Wrench className="w-4 h-4 text-[#0052FF] shrink-0 mt-0.5" />
                          <div className="text-xs text-[#0A2158] flex-1">
                            <strong className="font-semibold block text-[#0040CC] mb-0.5">
                              Rekomendowane działanie naprawcze:
                            </strong>
                            <p className="text-[11px] leading-relaxed text-[#373B40]">
                              {issue.suggestedFix}
                            </p>

                            <div className="mt-2 pt-2 border-t border-[#C7D7FE]/60 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                              {issue.canAutoFix ? (
                                <span className="inline-flex items-center gap-1 font-mono font-semibold text-[#0052FF]">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  Możliwa automatyczna korekta przez BaseLinker API
                                </span>
                              ) : (
                                <span className="font-mono text-[#5C6168]">
                                  Wymaga manualnej weryfikacji w panelu
                                </span>
                              )}

                              {issue.estimatedFixTime && (
                                <span className="inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#C7D7FE] text-[#0040CC] text-[10px]">
                                  <Clock className="w-3 h-3 text-[#0052FF]" />
                                  Szacowany czas naprawy: {issue.estimatedFixTime}
                                </span>
                              )}
                            </div>
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
