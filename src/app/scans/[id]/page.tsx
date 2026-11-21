"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Info,
  Layers,
  Package,
  ShieldCheck,
  Tag,
  Wrench,
  Clock,
  Sparkles,
  AlertCircle,
  FileText,
} from "lucide-react";
import { IssueCategory, IssueSeverity } from "@/types";

export default function ScanDetailsPage() {
  const params = useParams();
  const scanId = params.id as string;

  const [scan, setScan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center text-xs text-zinc-500 font-medium">
        Ładowanie raportu diagnostycznego...
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
        <p className="text-zinc-800 font-semibold text-xs">
          Nie znaleziono wskazanego raportu diagnostycznego.
        </p>
        <Link
          href="/scans"
          className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-xs hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Wróć do listy skanów
        </Link>
      </div>
    );
  }

  const issues: any[] = scan.issues || [];

  const filteredIssues = issues.filter((iss) => {
    if (severityFilter !== "ALL" && iss.severity !== severityFilter) {
      return false;
    }
    if (categoryFilter !== "ALL" && iss.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const isDemo =
    scan.summary?.dataSource === "DEMO_FIXTURES" ||
    scan.id?.includes("demo") ||
    scan.shopConnection?.name?.toLowerCase().includes("demo") ||
    scan.shopConnection?.name?.toLowerCase().includes("syntetyczn");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-200/80">
        <Link
          href="/scans"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 text-xs font-medium transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Wróć do historii audytów
        </Link>

        <a
          href={`/api/scans/${scan.id}/pdf`}
          download
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold shadow-xs transition"
        >
          <Download className="w-3.5 h-3.5" />
          Pobierz Oficjalny Raport PDF
        </a>
      </div>

      {/* Report Summary Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-neutral">
                <ShieldCheck className="w-3 h-3 text-blue-600" /> Raport Audytowy
              </span>
              {isDemo ? (
                <span className="badge-demo">
                  <Sparkles className="w-3 h-3 text-purple-600" /> Fixtures demonstracyjne
                </span>
              ) : (
                <span className="badge-active">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Połączenie na żywo (Base.com API)
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-950">
              {scan.shopConnection?.name || "Sklep Base.com"}
            </h1>
            <p className="text-[11px] text-zinc-400">
              ID Raportu: <code className="font-mono text-zinc-600">{scan.id}</code> • Zakończono:{" "}
              {new Date(scan.completedAt || scan.startedAt).toLocaleString("pl-PL")}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 text-center self-start sm:self-auto min-w-[130px]">
            <div className="font-mono text-4xl font-extrabold text-zinc-950">{scan.healthScore}%</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 mt-0.5">
              Health Score
            </div>
          </div>
        </div>

        {/* Counts Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-zinc-100 text-center text-xs">
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
            <div className="text-[11px] text-zinc-400">Produkty</div>
            <div className="font-mono font-bold text-zinc-900 mt-0.5 text-base">{scan.productsScanned}</div>
          </div>
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/60">
            <div className="text-[11px] text-zinc-400">Zamówienia</div>
            <div className="font-mono font-bold text-zinc-900 mt-0.5 text-base">{scan.ordersScanned}</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
            <div className="text-[11px] text-rose-600 font-semibold">Krytyczne</div>
            <div className="font-mono font-bold text-rose-700 mt-0.5 text-base">{scan.criticalCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
            <div className="text-[11px] text-amber-600 font-semibold">Ostrzeżenia</div>
            <div className="font-mono font-bold text-amber-700 mt-0.5 text-base">{scan.warningCount}</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-blue-600 font-semibold">Informacyjne</div>
            <div className="font-mono font-bold text-blue-700 mt-0.5 text-base">{scan.infoCount}</div>
          </div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      {scan.summary && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-600">
            Wyniki Poszczególnych Modułów
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(scan.summary as any[]).map((cat, idx) => (
              <div
                key={idx}
                className="bg-white p-3.5 rounded-xl border border-zinc-200/80 shadow-xs space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-zinc-700 truncate">{cat.title}</span>
                  <span className="font-mono font-bold text-zinc-950">{cat.score}%</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-1 overflow-hidden">
                  <div
                    className={`h-1 rounded-full ${
                      cat.score >= 80 ? "bg-emerald-500" : cat.score >= 50 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <div className="text-[10px] text-zinc-400">
                  Usterki: <span className="font-mono font-medium text-zinc-600">{cat.totalIssues}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-[11px] font-semibold text-zinc-400 mr-1.5 uppercase tracking-wider">
            Ważność:
          </span>
          {[
            { id: "ALL", label: `Wszystkie (${issues.length})` },
            { id: "CRITICAL", label: `Krytyczne (${scan.criticalCount})` },
            { id: "WARNING", label: `Ostrzeżenia (${scan.warningCount})` },
            { id: "INFO", label: `Info (${scan.infoCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSeverityFilter(tab.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                severityFilter === tab.id
                  ? "bg-zinc-950 text-white font-semibold"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Kategoria:
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Wszystkie kategorie</option>
            <option value="PRODUCT">Katalog i SKU</option>
            <option value="INVENTORY">Magazyn</option>
            <option value="ORDER">Zamówienia</option>
            <option value="SHIPPING">Wysyłka</option>
            <option value="PRICING">Ceny i Podatki</option>
          </select>
        </div>
      </div>

      {/* Issues Detailed Cards */}
      <div className="space-y-3.5">
        {filteredIssues.length === 0 ? (
          <div className="bg-white p-8 text-center text-zinc-400 text-xs rounded-2xl border border-zinc-200/80">
            Brak usterek odpowiadających wybranym kryteriom filtrowania.
          </div>
        ) : (
          filteredIssues.map((issue, idx) => {
            const isCritical = issue.severity === "CRITICAL";
            const isWarning = issue.severity === "WARNING";

            return (
              <div
                key={issue.id || idx}
                className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs space-y-3.5 hover:border-zinc-300 transition"
              >
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
                      {issue.severity}
                    </span>

                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-600">
                      {issue.category}
                    </span>

                    <span className="font-mono text-[11px] text-zinc-400">
                      {issue.code}
                    </span>
                  </div>

                  {issue.affectedIdentifier && (
                    <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                      Dotyczy: {issue.affectedIdentifier}
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-sm font-bold text-zinc-950">
                    {issue.title}
                  </h2>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                {/* Business Impact Box */}
                {issue.businessImpact && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-950">
                      <strong className="font-semibold block text-amber-900 mb-0.5">
                        Konsekwencje biznesowe dla sklepu:
                      </strong>
                      <p className="text-[11px] leading-relaxed text-amber-900/90">{issue.businessImpact}</p>
                    </div>
                  </div>
                )}

                {/* Suggested Fix Action Box */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 flex items-start gap-2.5">
                  <Wrench className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-950 flex-1">
                    <strong className="font-semibold block text-blue-900 mb-0.5">
                      Rekomendowane działanie naprawcze:
                    </strong>
                    <p className="text-[11px] leading-relaxed text-blue-900/90">{issue.suggestedFix}</p>

                    {issue.autoFixNote && (
                      <div className="mt-2 pt-2 border-t border-blue-200/50 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                        <span className="flex items-center gap-1 text-blue-800">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          {issue.autoFixNote}
                        </span>
                        {issue.estimatedFixTime && (
                          <span className="inline-flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px]">
                            <Clock className="w-3 h-3 text-blue-700" />
                            Czas naprawy: {issue.estimatedFixTime}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
