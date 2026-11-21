"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
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
  Play,
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

  const latestScan = scans[0];
  const isDemo = Boolean(
    latestScan?.shopConnection?.name?.toLowerCase().includes("demo") ||
      latestScan?.id?.includes("demo")
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F8F7F4] text-[#111315]">
      {/* Persistent Left Sidebar */}
      <AppSidebar
        connectionsCount={1}
        activeStoreName={latestScan?.shopConnection?.name || "Konto Base.com"}
        isDemo={isDemo}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Workspace Top Header */}
        <header className="sticky top-0 z-30 h-14 px-4 sm:px-8 bg-[#F8F7F4]/90 backdrop-blur-md border-b border-[#E5E3DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-medium text-[#5C6168]">Diagnostyka</span>
            <span className="text-[#CFCBC2]">/</span>
            <h1 className="text-xs sm:text-sm font-semibold text-[#111315] truncate">
              Rejestr Audytów Diagnostycznych
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#FAF9F6] border border-[#E5E3DC] text-[#5C6168]">
              {scans.length} {scans.length === 1 ? "pozycja" : "pozycji"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="btn-primary-cobalt">
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Nowy Skan w Pulpicie</span>
            </Link>
          </div>
        </header>

        {/* Workspace Body */}
        <div className="p-4 sm:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E3DC] pb-4">
            <div>
              <span className="pci-eyebrow">Archiwum Operacyjne</span>
              <h2 className="text-base font-semibold text-[#111315] mt-0.5">
                Historia Wykonanych Audytów
              </h2>
              <p className="text-xs text-[#5C6168] mt-0.5">
                Monitoruj poprawę wskaźnika Health Score oraz historię wykrytych nieprawidłowości w czasie.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="pci-card p-12 text-center text-xs text-[#5C6168] font-mono animate-pulse">
              Ładowanie rejestru audytów...
            </div>
          ) : scans.length === 0 ? (
            <div className="pci-card p-12 text-center space-y-3">
              <div className="w-10 h-10 rounded-md bg-[#FAF9F6] border border-[#E5E3DC] text-[#0052FF] mx-auto flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-[#111315] text-sm">Brak zarejestrowanych audytów</h3>
              <p className="text-xs text-[#5C6168] max-w-sm mx-auto">
                Nie przeprowadzono jeszcze żadnego audytu bazy Base.com. Podłącz sklep lub uruchom wersję demo.
              </p>
              <Link href="/connections" className="btn-primary-cobalt inline-flex mt-2">
                <span>Zarządzaj połączeniami sklepu</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="pci-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#E5E3DC] text-[10px] font-mono uppercase tracking-wider text-[#5C6168]">
                      <th className="py-3 px-4">Health Score</th>
                      <th className="py-3 px-4">Środowisko / Sklep</th>
                      <th className="py-3 px-4">Data Wykonania</th>
                      <th className="py-3 px-4">Wolumen Obiektów</th>
                      <th className="py-3 px-4">Rozkład Ryzyk</th>
                      <th className="py-3 px-4 text-right">Eksport / Raport</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFECE6] text-xs">
                    {scans.map((scan) => {
                      const isScanDemo = Boolean(
                        scan.shopConnection?.name?.toLowerCase().includes("demo") ||
                          scan.id?.includes("demo")
                      );

                      return (
                        <tr key={scan.id} className="hover:bg-[#FAF9F6] transition group">
                          <td className="py-3.5 px-4 whitespace-nowrap">
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

                          <td className="py-3.5 px-4 font-semibold text-[#111315]">
                            <div className="flex items-center gap-2">
                              <span>{scan.shopConnection?.name || "Sklep Base.com"}</span>
                              {isScanDemo && <span className="badge-demo text-[10px]">DEMO</span>}
                            </div>
                            <div className="text-[10px] font-mono text-[#868C94] mt-0.5">
                              ID: {scan.id}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-mono text-[#5C6168] whitespace-nowrap">
                            {new Date(scan.completedAt || scan.startedAt).toLocaleString("pl-PL")}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[#5C6168]">
                            <span>{scan.productsScanned} prod.</span>
                            <span className="text-[#CFCBC2] mx-1">•</span>
                            <span>{scan.ordersScanned} zam.</span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 font-mono text-[11px]">
                              {scan.criticalCount > 0 ? (
                                <span className="text-[#B91C1C] font-semibold">
                                  {scan.criticalCount} kryt.
                                </span>
                              ) : (
                                <span className="text-[#059669]">0 kryt.</span>
                              )}
                              <span className="text-[#CFCBC2]">•</span>
                              <span className="text-[#B45309] font-semibold">
                                {scan.warningCount} ostrz.
                              </span>
                              <span className="text-[#CFCBC2]">•</span>
                              <span className="text-[#5C6168]">
                                {scan.infoCount} info
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <a
                                href={`/api/scans/${scan.id}/pdf`}
                                download
                                className="btn-secondary-surface py-1 px-2.5 text-[11px]"
                                title="Pobierz oficjalny raport PDF"
                              >
                                <Download className="w-3 h-3 text-[#5C6168]" />
                                <span>PDF</span>
                              </a>
                              <Link
                                href={`/scans/${scan.id}`}
                                className="btn-primary-ink py-1 px-2.5 text-[11px]"
                              >
                                <span>Szczegóły</span>
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
