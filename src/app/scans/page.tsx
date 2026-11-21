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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Historia Audytów Diagnostycznych
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Przeglądaj historyczne wyniki audytów i monitoruj poprawę jakości bazy danych
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          Nowy Skan w Pulpicie
        </Link>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200">
          Ładowanie historii audytów...
        </div>
      ) : scans.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-sm bg-white rounded-2xl border border-slate-200 space-y-3">
          <p>Nie wykonano jeszcze żadnego skanu diagnostycznego.</p>
          <Link
            href="/connections"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
          >
            Podłącz sklep i uruchom audyt
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {scans.map((scan) => {
            const scoreColor =
              scan.healthScore >= 80
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : scan.healthScore >= 50
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-rose-50 text-rose-700 border-rose-200";

            return (
              <div
                key={scan.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-14 h-14 rounded-2xl border flex flex-col items-center justify-center font-black ${scoreColor}`}
                  >
                    <span className="text-lg leading-none">{scan.healthScore}%</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider opacity-80 mt-0.5">
                      Zdrowie
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="font-bold text-slate-900 text-base">
                      {scan.shopConnection?.name || "Sklep Base.com"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(scan.completedAt || scan.startedAt).toLocaleString("pl-PL")}
                      </span>
                      <span>•</span>
                      <span>Produkty: {scan.productsScanned}</span>
                      <span>•</span>
                      <span>Zamówienia: {scan.ordersScanned}</span>
                    </div>

                    <div className="flex items-center gap-3 pt-1 text-xs">
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5" /> {scan.criticalCount} krytycznych
                      </span>
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {scan.warningCount} ostrzeżeń
                      </span>
                      <span className="text-blue-600 font-medium flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" /> {scan.infoCount} info
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <a
                    href={`/api/scans/${scan.id}/pdf`}
                    download
                    className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    Pobierz PDF
                  </a>

                  <Link
                    href={`/scans/${scan.id}`}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                  >
                    Przeglądaj Usterki
                    <ArrowRight className="w-3.5 h-3.5" />
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
