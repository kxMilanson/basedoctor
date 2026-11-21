"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/AppSidebar";
import {
  FileText,
  Download,
  ArrowRight,
  Play,
  Calendar,
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
      latestScan?.shopConnection?.name?.toLowerCase().includes("przykładow") ||
      latestScan?.id?.includes("demo")
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAF8F5] text-[#18181B]">
      <AppSidebar
        connectionsCount={1}
        activeStoreName={latestScan?.shopConnection?.name || "Sklep Base.com"}
        isDemo={isDemo}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 h-16 px-4 sm:px-8 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E4DC] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-sm sm:text-base font-semibold text-[#18181B] truncate">
              Wyniki i historia sprawdzeń
            </h1>
            <span className="pill-neutral">
              {scans.length} {scans.length === 1 ? "raport" : "raportów"}
            </span>
          </div>

          <Link href="/dashboard" className="btn-studio-brand shrink-0">
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Nowe sprawdzenie</span>
          </Link>
        </header>

        <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#18181B]">
              Poprzednie raporty kondycji sklepu
            </h2>
            <p className="text-xs sm:text-sm text-[#52525B]">
              Przeglądaj wcześniejsze wyniki i pobieraj gotowe raporty PDF dla swojego zespołu lub księgowości.
            </p>
          </div>

          {loading ? (
            <div className="studio-card p-12 text-center text-xs text-[#71717A] animate-pulse">
              Ładowanie historii raportów...
            </div>
          ) : scans.length === 0 ? (
            <div className="studio-card p-12 text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0F766E] mx-auto flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#18181B] text-sm">
                Brak zapisanych raportów
              </h3>
              <p className="text-xs text-[#52525B] max-w-sm mx-auto">
                Nie wykonano jeszcze żadnego sprawdzenia sklepu. Podłącz sklep lub uruchom wersję przykładową.
              </p>
              <Link href="/connections" className="btn-studio-brand inline-flex mt-2">
                <span>Przejdź do połączeń sklepów</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => {
                const isScanDemo = Boolean(
                  scan.shopConnection?.name?.toLowerCase().includes("demo") ||
                    scan.shopConnection?.name?.toLowerCase().includes("przykładow") ||
                    scan.id?.includes("demo")
                );

                return (
                  <div
                    key={scan.id}
                    className="studio-card-hover p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${
                          scan.healthScore >= 80
                            ? "bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
                            : scan.healthScore >= 50
                            ? "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]"
                            : "bg-[#FFF1F2] text-[#BE123C] border-[#FECDD3]"
                        }`}
                      >
                        <span className="text-xl font-bold leading-none tabular-nums">
                          {scan.healthScore}%
                        </span>
                        <span className="text-[10px] font-medium opacity-80 mt-1">
                          Kondycja
                        </span>
                      </div>

                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-[#18181B] text-sm sm:text-base truncate">
                            {scan.shopConnection?.name || "Sklep Base.com"}
                          </h3>
                          {isScanDemo && <span className="pill-demo">Sklep przykładowy</span>}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#71717A]">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(scan.completedAt || scan.startedAt).toLocaleString("pl-PL")}
                          </span>
                          <span>•</span>
                          <span>{scan.productsScanned} produktów</span>
                          <span>•</span>
                          <span>{scan.ordersScanned} zamówień</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          {scan.criticalCount > 0 ? (
                            <span className="pill-urgent">
                              {scan.criticalCount} pilnych
                            </span>
                          ) : (
                            <span className="pill-healthy">Brak pilnych błędów</span>
                          )}
                          {scan.warningCount > 0 && (
                            <span className="pill-warning">
                              {scan.warningCount} do poprawy
                            </span>
                          )}
                          {scan.infoCount > 0 && (
                            <span className="pill-neutral">
                              {scan.infoCount} wskazówek
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end md:self-center shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#F1EFEA] w-full md:w-auto justify-end">
                      <a
                        href={`/api/scans/${scan.id}/pdf`}
                        download
                        className="btn-studio-secondary py-2 px-3.5 text-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-[#0F766E]" />
                        <span>Pobierz PDF</span>
                      </a>

                      <Link
                        href={`/scans/${scan.id}`}
                        className="btn-studio-primary py-2 px-4 text-xs"
                      >
                        <span>Zobacz raport</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
