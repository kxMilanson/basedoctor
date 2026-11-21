"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  ArrowRight,
  ShieldCheck,
  Calendar,
  AlertOctagon,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function ScansHistoryPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/scans")
      .then((res) => (res.ok ? res.json() : { scans: [] }))
      .then((data) => setScans(data.scans || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-medium mb-2.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Rejestr audytów</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight">
            Historia Audytów Diagnostycznych
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Przeglądaj historyczne wyniki audytów i monitoruj poprawę integralności bazy danych w czasie.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-xs font-medium shadow-xs transition"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Nowy Skan w Pulpicie</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-16 text-center text-zinc-500 text-sm bg-white rounded-xl border border-zinc-200/80 shadow-xs animate-pulse">
          Ładowanie historii audytów...
        </div>
      ) : scans.length === 0 ? (
        <div className="p-16 text-center text-zinc-500 text-sm bg-white rounded-xl border border-zinc-200/80 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto text-zinc-400">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-zinc-900 text-base">Brak zapisanych audytów</p>
            <p className="text-zinc-500 text-xs max-w-sm mx-auto">
              Nie wykonano jeszcze żadnego skanu diagnostycznego. Podłącz sklep Base.com lub uruchom wersję demonstracyjną.
            </p>
          </div>
          <Link
            href="/connections"
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white rounded-lg text-xs font-medium hover:bg-zinc-800 transition"
          >
            <span>Zarządzaj połączeniami sklepu</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {scans.map((scan) => {
            const scoreColor =
              scan.healthScore >= 80
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : scan.healthScore >= 50
                ? "text-amber-700 bg-amber-50 border-amber-200"
                : "text-rose-700 bg-rose-50 border-rose-200";

            return (
              <div
                key={scan.id}
                className="bg-white p-5 rounded-xl border border-zinc-200/80 shadow-xs hover:border-zinc-300 transition flex flex-col md:flex-row md:items-center justify-between gap-5"
              >
                <div className="flex items-start sm:items-center gap-4">
                  {/* Monospace score tile */}
                  <div
                    className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center font-bold font-mono shrink-0 ${scoreColor}`}
                  >
                    <span className="text-lg leading-none">{scan.healthScore}%</span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold opacity-75 mt-0.5 font-sans">
                      Zdrowie
                    </span>
                  </div>

                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-zinc-950 text-base truncate">
                        {scan.shopConnection?.name || "Sklep Base.com"}
                      </h2>
                      {scan.shopConnection?.isDemo && (
                        <span className="badge-demo text-[10px] py-0.5 px-2">Środowisko Demo</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-zinc-500 font-mono">
                      <span className="flex items-center gap-1 font-sans text-zinc-500">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {new Date(scan.completedAt || scan.startedAt).toLocaleString("pl-PL")}
                      </span>
                      <span className="text-zinc-300">•</span>
                      <span>{scan.productsScanned} prod.</span>
                      <span className="text-zinc-300">•</span>
                      <span>{scan.ordersScanned} zam.</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      {scan.criticalCount > 0 ? (
                        <span className="badge-critical text-[11px] font-mono">
                          <AlertOctagon className="w-3 h-3 mr-1 inline" />
                          {scan.criticalCount} krytycznych
                        </span>
                      ) : null}
                      {scan.warningCount > 0 ? (
                        <span className="badge-warning text-[11px] font-mono">
                          <AlertTriangle className="w-3 h-3 mr-1 inline" />
                          {scan.warningCount} ostrzeżeń
                        </span>
                      ) : null}
                      <span className="badge-neutral text-[11px] font-mono">
                        <Info className="w-3 h-3 mr-1 inline" />
                        {scan.infoCount} informacyjnych
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-end md:self-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 w-full md:w-auto justify-end">
                  <a
                    href={`/api/scans/${scan.id}/pdf`}
                    download
                    className="px-3.5 py-2 rounded-lg border border-zinc-200 text-zinc-700 hover:bg-zinc-50 text-xs font-medium flex items-center gap-1.5 transition shadow-xs"
                    title="Pobierz oficjalny raport PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-zinc-500" />
                    <span>PDF</span>
                  </a>

                  <Link
                    href={`/scans/${scan.id}`}
                    className="px-4 py-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-xs"
                  >
                    <span>Szczegóły Usterek</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
