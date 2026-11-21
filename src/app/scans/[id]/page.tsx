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
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
        Ładowanie raportu diagnostycznego...
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-slate-700 font-semibold">
          Nie znaleziono wskazanego raportu diagnostycznego.
        </p>
        <Link
          href="/scans"
          className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Wróć do listy skanów
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

  const scoreColor =
    scan.healthScore >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : scan.healthScore >= 50
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar with Back Link and PDF Export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Link
          href="/scans"
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Wróć do historii
        </Link>

        <a
          href={`/api/scans/${scan.id}/pdf`}
          download
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition"
        >
          <Download className="w-4 h-4" />
          Pobierz Oficjalny Raport PDF
        </a>
      </div>

      {/* Report Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Raport Audytowy BaseDoctor
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                  scan.summary?.dataSource === "DEMO_FIXTURES" || scan.id?.includes("demo")
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
              >
                {scan.summary?.dataSource === "DEMO_FIXTURES" || scan.id?.includes("demo")
                  ? "Tryb: Fixtures demonstracyjne"
                  : "Tryb: Połączenie na żywo (Base.com API)"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {scan.shopConnection?.name || "Sklep Base.com"}
            </h1>
            <p className="text-xs text-slate-500">
              ID Raportu: <code className="text-slate-700">{scan.id}</code> • Zakończono:{" "}
              {new Date(scan.completedAt || scan.startedAt).toLocaleString("pl-PL")}
            </p>
          </div>

          <div
            className={`px-6 py-4 rounded-2xl border text-center self-start sm:self-auto ${scoreColor}`}
          >
            <div className="text-4xl font-black">{scan.healthScore}%</div>
            <div className="text-[10px] uppercase font-bold tracking-wider opacity-90 mt-0.5">
              Health Score
            </div>
          </div>
        </div>

        {/* Counts Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100 text-center">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-500">Produkty</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {scan.productsScanned}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="text-xs text-slate-500">Zamówienia</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {scan.ordersScanned}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
            <div className="text-xs text-rose-600 font-semibold">Krytyczne</div>
            <div className="text-lg font-extrabold text-rose-700 mt-0.5">
              {scan.criticalCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
            <div className="text-xs text-amber-600 font-semibold">Ostrzeżenia</div>
            <div className="text-lg font-extrabold text-amber-700 mt-0.5">
              {scan.warningCount}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 col-span-2 sm:col-span-1">
            <div className="text-xs text-blue-600 font-semibold">Informacyjne</div>
            <div className="text-lg font-extrabold text-blue-700 mt-0.5">
              {scan.infoCount}
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {scan.summary && (
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">
            Wyniki Poszczególnych Modułów
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(scan.summary as any[]).map((cat, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 truncate">{cat.title}</span>
                  <span className="font-extrabold text-blue-600">{cat.score}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  Usterki: {cat.totalIssues}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1">Ważność:</span>
          {[
            { id: "ALL", label: `Wszystkie (${issues.length})` },
            { id: "CRITICAL", label: `Krytyczne (${scan.criticalCount})`, color: "text-rose-600" },
            { id: "WARNING", label: `Ostrzeżenia (${scan.warningCount})`, color: "text-amber-600" },
            { id: "INFO", label: `Info (${scan.infoCount})`, color: "text-blue-600" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSeverityFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                severityFilter === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-500">Kategoria:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
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

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="bg-white p-8 text-center text-slate-500 text-sm rounded-2xl border border-slate-200">
            Brak usterek odpowiadających wybranym kryteriom filtrowania.
          </div>
        ) : (
          filteredIssues.map((issue, idx) => {
            const isCritical = issue.severity === "CRITICAL";
            const isWarning = issue.severity === "WARNING";

            return (
              <div
                key={issue.id || idx}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        isCritical
                          ? "bg-rose-100 text-rose-800"
                          : isWarning
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {issue.severity}
                    </span>

                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                      {issue.category}
                    </span>

                    <span className="text-xs text-slate-400 font-mono">
                      {issue.code}
                    </span>
                  </div>

                  {issue.affectedIdentifier && (
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-800">
                      Dotyczy: {issue.affectedIdentifier}
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {issue.title}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    {issue.description}
                  </p>
                </div>

                {/* Business Impact Box */}
                {issue.businessImpact && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-950">
                      <strong className="font-semibold block text-amber-900 mb-0.5">
                        Konsekwencje biznesowe dla sklepu:
                      </strong>
                      {issue.businessImpact}
                    </div>
                  </div>
                )}

                {/* Suggested Fix Action Box */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
                  <Wrench className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-950 flex-1">
                    <strong className="font-semibold block text-blue-900 mb-0.5">
                      Rekomendowane działanie naprawcze:
                    </strong>
                    {issue.suggestedFix}

                    {issue.autoFixNote && (
                      <div className="mt-2 pt-2 border-t border-blue-200/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-blue-800">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                          {issue.autoFixNote}
                        </span>
                        {issue.estimatedFixTime && (
                          <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-900">
                            <Clock className="w-3 h-3 text-blue-700" />
                            Szacowany czas: {issue.estimatedFixTime}
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
