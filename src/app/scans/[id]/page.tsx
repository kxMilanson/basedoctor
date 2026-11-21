"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Download,
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
      scan?.shopConnection?.name?.toLowerCase().includes("syntetyczn") ||
      scan?.shopConnection?.name?.toLowerCase().includes("przykładow")
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
      const matchId = iss.affectedIdentifier?.toLowerCase().includes(q);
      return matchTitle || matchDesc || matchImpact || matchEntity || matchId;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF8F5] text-[#18181B]">
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
              className="text-xs font-medium text-[#52525B] hover:text-[#18181B] flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Wszystkie raporty</span>
            </Link>
            <span className="text-[#D6D1C7]">/</span>
            <span className="text-xs sm:text-sm font-semibold text-[#18181B] truncate">
              Szczegóły sprawdzenia sklepu
            </span>
          </div>

          {scan && (
            <a
              href={`/api/scans/${scan.id}/pdf`}
              download
              className="btn-studio-brand shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Pobierz raport PDF</span>
            </a>
          )}
        </header>

        <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          {loading ? (
            <div className="studio-card p-12 text-center text-xs text-[#71717A] animate-pulse">
              Przygotowujemy Twój raport...
            </div>
          ) : !scan ? (
            <div className="studio-card p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-[#18181B]">
                Nie znaleziono wskazanego raportu.
              </p>
              <Link href="/scans" className="btn-studio-secondary inline-flex text-xs">
                <ArrowLeft className="w-3.5 h-3.5" /> Wróć do historii raportów
              </Link>
            </div>
          ) : (
            <>
              {/* Executive Summary Card */}
              <div className="studio-card p-6 sm:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {isDemo ? (
                        <span className="pill-demo">Sklep przykładowy</span>
                      ) : (
                        <span className="pill-healthy">
                          <CheckCircle2 className="w-3 h-3" />
                          Połączenie bezpieczne (tylko odczyt)
                        </span>
                      )}
                      <span className="text-xs text-[#71717A]">
                        Wykonano: {new Date(scan.completedAt || scan.startedAt).toLocaleString("pl-PL")}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#18181B]">
                      {scan.shopConnection?.name || "Sklep Base.com"}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#52525B]">
                      Przejrzeliśmy {scan.productsScanned} produktów i {scan.ordersScanned} zamówień. Poniżej znajdziesz listę rzeczy wymagających uwagi.
                    </p>
                  </div>

                  {/* Overall Score Box */}
                  <div className="px-6 py-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E4DC] text-center shrink-0 min-w-[150px]">
                    <div className="text-4xl font-bold tracking-tight text-[#18181B] tabular-nums">
                      {scan.healthScore}
                      <span className="text-base font-medium text-[#71717A]">/100</span>
                    </div>
                    <div className="text-xs font-medium text-[#52525B] mt-0.5">
                      Kondycja sklepu
                    </div>
                  </div>
                </div>

                {/* Friendly Breakdown Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-5 border-t border-[#F1EFEA] text-center">
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                    <div className="text-[11px] text-[#71717A]">Sprawdzone produkty</div>
                    <div className="font-bold text-[#18181B] mt-0.5 text-lg tabular-nums">
                      {scan.productsScanned}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC]">
                    <div className="text-[11px] text-[#71717A]">Sprawdzone zamówienia</div>
                    <div className="font-bold text-[#18181B] mt-0.5 text-lg tabular-nums">
                      {scan.ordersScanned}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFF1F2] border border-[#FECDD3]">
                    <div className="text-[11px] text-[#BE123C] font-semibold">Pilne sprawy</div>
                    <div className="font-bold text-[#BE123C] mt-0.5 text-lg tabular-nums">
                      {scan.criticalCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                    <div className="text-[11px] text-[#B45309] font-semibold">Warto poprawić</div>
                    <div className="font-bold text-[#B45309] mt-0.5 text-lg tabular-nums">
                      {scan.warningCount}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] col-span-2 sm:col-span-1">
                    <div className="text-[11px] text-[#0F766E] font-semibold">Wskazówki</div>
                    <div className="font-bold text-[#0F766E] mt-0.5 text-lg tabular-nums">
                      {scan.infoCount}
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
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
                    className="px-3 py-2 rounded-xl border border-[#E8E4DC] bg-[#FAF8F5] text-xs font-medium text-[#18181B] focus:outline-none focus:border-[#0F766E]"
                  >
                    <option value="ALL">Wszystkie obszary</option>
                    <option value="PRODUCT">Produkty i katalog</option>
                    <option value="INVENTORY">Magazyn i stany</option>
                    <option value="ORDER">Zamówienia</option>
                    <option value="SHIPPING">Wysyłka</option>
                    <option value="PRICING">Ceny i podatki</option>
                  </select>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Szukaj produktu lub zamówienia..."
                      className="pl-8 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] text-xs text-[#18181B] placeholder:text-[#A1A1AA] focus:outline-none focus:border-[#0F766E] focus:bg-white w-48 sm:w-56"
                    />
                  </div>
                </div>
              </div>

              {/* Issues Action Cards */}
              <div className="space-y-3.5">
                {filteredIssues.length === 0 ? (
                  <div className="studio-card p-12 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-[#10B981] mx-auto" />
                    <p className="text-sm font-semibold text-[#18181B]">
                      Brak spraw pasujących do wybranych filtrów
                    </p>
                  </div>
                ) : (
                  filteredIssues.map((issue, idx) => {
                    const isUrgent = issue.severity === "CRITICAL";
                    const isWarning = issue.severity === "WARNING";

                    return (
                      <div
                        key={issue.id || idx}
                        className="studio-card-hover p-5 sm:p-6 space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
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
                                ? "Pilne — wymaga uwagi"
                                : isWarning
                                ? "Warto poprawić"
                                : "Wskazówka"}
                            </span>
                            <span className="pill-neutral">
                              {getFriendlyCategory(issue.category)}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {(issue.affectedIdentifier || issue.entityName) && (
                              <span className="font-mono text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF8F5] text-[#18181B] border border-[#E8E4DC]">
                                {issue.entityName || issue.affectedIdentifier}
                              </span>
                            )}
                            {issue.estimatedFixTime && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#52525B]">
                                <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                                Zajmie ok. {issue.estimatedFixTime}
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h2 className="text-base font-semibold text-[#18181B]">
                            {issue.title}
                          </h2>
                          <p className="text-xs sm:text-sm text-[#52525B] mt-1 leading-relaxed">
                            {issue.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                          {issue.businessImpact && (
                            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E4DC] space-y-1">
                              <div className="text-xs font-semibold text-[#B45309] flex items-center gap-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                <span>Dlaczego to ważne dla Twojego sklepu</span>
                              </div>
                              <p className="text-xs text-[#3F3F46] leading-relaxed">
                                {issue.businessImpact}
                              </p>
                            </div>
                          )}

                          <div className="p-4 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-2">
                            <div className="text-xs font-semibold text-[#0F766E] flex items-center gap-1.5">
                              <Wrench className="w-3.5 h-3.5 shrink-0" />
                              <span>Jak to naprawić krok po kroku</span>
                            </div>
                            <p className="text-xs text-[#134E4A] leading-relaxed">
                              {issue.suggestedFix}
                            </p>
                            {issue.autoFixNote && (
                              <div className="pt-2 border-t border-[#99F6E4]/60 text-[11px] text-[#0F766E] flex items-center gap-1.5 font-medium">
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
